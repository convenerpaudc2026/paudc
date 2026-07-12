import asyncio
import json
import logging
import re
import time
import os
from pathlib import Path

from asyncpg.exceptions import (
    DuplicateTableError,
    UniqueViolationError,
)

from core.config import settings
from sqlalchemy.schema import DDL
from sqlalchemy import text  # Preserved Python 3.13 fix
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool, QueuePool

logger = logging.getLogger(__name__)

class Base(DeclarativeBase):
    pass

class DatabaseManager:
    def __init__(self):
        self.engine = None
        self._initialized = False
        self.async_session_maker = None
        self._init_lock = asyncio.Lock()  # Protect database initialization
        self._table_creation_lock = asyncio.Lock()  # Protect Table creation process

    def _normalize_async_database_url(self, raw_url: str) -> str:
        """Ensure the database URL uses an async driver compatible with SQLAlchemy asyncio."""
        if not raw_url:
            return raw_url
            
        try:
            import urllib.parse
            parsed = urllib.parse.urlparse(raw_url)
            drivername = parsed.scheme
        except Exception as e:
            logger.error(f"Failed to parse database url: {e}")
            return raw_url
            
        drivername = drivername or ""
        
        # already async drivers
        if "+aiosqlite" in drivername or "+asyncpg" in drivername or "+aiomysql" in drivername:
            return raw_url
            
        # Map common sync schemes to async equivalents
        if drivername == "sqlite":
            return raw_url.replace("sqlite://", "sqlite+aiosqlite://", 1)
        elif drivername == "postgresql" or drivername == "postgres":
            return raw_url.replace(drivername + "://", "postgresql+asyncpg://", 1)
        elif drivername in ("mysql", "mariadb"):
            return raw_url.replace(drivername + "://", f"{drivername}+aiomysql://", 1)
        else:
            logger.warning(f"Unknown database driver ({drivername})")
            return raw_url

    def check_db_exists(self, db_url: str) -> bool:
        """Check if sqlite DB exists."""
        if "sqlite" not in db_url:
            return True  # Assume exists for non-sqlite
        filename = db_url.split("///")[1]
        path = Path(filename).resolve()
        
        if not path.exists():
            logger.info(f"Database not found: {filename}")
            return False
        return True

    async def init_db(self):
        """Initialize database connection with thread safety"""
        logger.info("Starting database initialization...")

        async with self._init_lock:
            if self.engine is not None:
                logger.info("Database already initialized")
                return

            if not settings.DATABASE_URL:
                logger.error("No database URL provided. DATABASE_URL environment variable must be set.")
                raise ValueError("Database URL environment variable is required")

            # normalize database URL for async compatibility
            db_url = self._normalize_async_database_url(settings.DATABASE_URL)
            
            try:
                # determine if running in Lambda
                is_lambda = os.environ.get("AWS_LAMBDA_FUNCTION_NAME") is not None
                
                engine_kwargs = {}
                
                if is_lambda:
                    engine_kwargs["poolclass"] = NullPool
                    logger.info("Configuring DB pool for Lambda environment to avoid connection state conflicts")
                else:
                    engine_kwargs["pool_size"] = 10 
                    engine_kwargs["max_overflow"] = 20 
                    engine_kwargs["pool_recycle"] = 3600 
                    engine_kwargs["pool_pre_ping"] = True 
                    logger.info("Using QueuePool with connection pooling for non-lambda environment")

                self.engine = create_async_engine(db_url, hide_parameters=True, **engine_kwargs)
                logger.info("Database engine created successfully")

                self.async_session_maker = async_sessionmaker(
                    self.engine, class_=AsyncSession, expire_on_commit=False
                )
                self._initialized = True
                
                logger.info("Database connection created successfully")
                
            except Exception as e:
                logger.error(f"Failed to initialize database: {e}", exc_info=True)
                raise

    async def close_db(self):
        """Close database connection and dispose engine"""
        logger.info("Closing database connection...")
        if not self.engine:
            return 
            
        try:
            await self.engine.dispose()
            logger.info("Database connection closed and engine disposed")
        except Exception as e:
            logger.warning(f"Error disposing database engine: {e}")
        finally:
            self.engine = None
            self.async_session_maker = None
            self._initialized = False

    async def create_tables(self):
        """Create database tables with thread safety"""
        start_time = time.time()
        logger.info("Starting table creation...")

        async with self._table_creation_lock:
            try:
                logger.info("Starting table creation...")
                async with self.engine.begin() as conn:
                    await conn.run_sync(Base.metadata.create_all)
                logger.info("Tables initialized successfully")
                logger.debug(f"[DB_OP] Create tables completed in {time.time() - start_time:.4f}s")
            except (UniqueViolationError, DuplicateTableError) as e:
                logger.info(f"Duplicate table creation (expected): {e}. Ignored.")
            except Exception as e:
                logger.error(f"Failed to create tables: {e}")
                raise

    async def check_and_repair_existing_tables(self):
        """Check and fix the structure of existing tables."""
        repair_start = time.time()
        logger.info("Checking for structural repairs in existing tables...")

        try:
            existing_tables = await self._get_existing_tables()
            
            if not existing_tables:
                logger.info("No existing tables found, skipping repair")
                return
                
            model_tables = list(Base.metadata.tables.keys())
            
            for table_name in model_tables:
                if table_name in existing_tables:
                    await self._repair_table_structure(table_name, Base.metadata.tables[table_name])
                    
            logger.info(f"Table structure repair completed in {time.time() - repair_start:.4f}s")
        except Exception as e:
            logger.error(f"Failed to repair existing tables: {e}")

    def _escape_identifier(self, identifier: str, identifier_type: str = "identifier") -> str:
        """Validate and escape SQL identifiers."""
        if not re.match(r"^[a-zA-Z0-9_]+$", identifier):
            raise ValueError(f"Invalid {identifier_type} name: {identifier}. Only alphanumeric characters and underscores allowed.")
        return identifier

    def _escape_table_name(self, table_name: str) -> str:
        return self._escape_identifier(table_name, "table")

    def _escape_column_name(self, column_name: str) -> str:
        return self._escape_identifier(column_name, "column")

    async def _get_existing_tables(self) -> list:
        """Get list of existing tables in the database."""
        try:
            async with self.engine.begin() as conn:
                if self.engine.dialect.name == "postgresql":
                    query = text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
                elif self.engine.dialect.name == "sqlite":
                    query = text("SELECT name FROM sqlite_master WHERE type='table'")
                elif self.engine.dialect.name == "mysql":
                    query = text("SELECT table_name FROM information_schema.tables WHERE table_schema = database()")
                else:
                    logger.warning(f"Unknown database driver ({self.engine.dialect.name})")
                    return []
                    
                result = await conn.execute(query)
                return [row[0] for row in result.fetchall()]
        except Exception as e:
            logger.error(f"Failed to get existing tables: {e}")
            return []

    async def _repair_table_structure(self, table_name: str, model_table):
        """Repair the structure of a single table."""
        logger.debug(f"Checking table structure for: {table_name}")
        
        try:
            existing_columns = await self._get_table_columns(table_name)
            model_columns = self._get_model_columns(table_name)
            missing_columns = self._find_missing_columns(existing_columns, model_columns)
            
            if not missing_columns:
                return
                
            logger.info(
                f"Found {len(missing_columns)} missing columns in table {table_name}: "
                f"{', '.join([c['name'] for c in missing_columns])}"
            )
            
            await self._add_missing_columns(table_name, missing_columns)
            logger.debug(f"Table {table_name} structure is up to date")
            
        except Exception as e:
            logger.error(f"Failed to repair table structure for {table_name}: {e}")

    async def _add_missing_columns(self, table_name: str, missing_columns: list):
        try:
            async with self.engine.begin() as conn:
                for column_info in missing_columns:
                    alter_sql = self._generate_add_column_sql(table_name, column_info)
                    ddl = DDL(alter_sql)
                    await conn.execute(ddl)
                    logger.info(f"Successfully added {column_info['name']} to {table_name}")
        except Exception as e:
            logger.error(f"Failed to add missing columns to {table_name}: {e}")
            raise

    async def _get_table_columns(self, table_name: str):
        try:
            escaped_table_name = self._escape_table_name(table_name)
            
            if self.engine.dialect.name == "postgresql" or self.engine.dialect.name == "mysql":
                query_str = (
                    "SELECT column_name, data_type, is_nullable, column_default "
                    "FROM information_schema.columns "
                    "WHERE table_name = :table_name"
                )
                query = text(query_str)
                
                async with self.engine.begin() as conn:
                    result = await conn.execute(query, {"table_name": escaped_table_name})
                    columns = {}
                    for row in result.fetchall():
                        columns[row[0]] = {
                            "name": row[0],
                            "type": row[1],
                            "nullable": row[2] == "YES",
                            "default": row[3]
                        }
                    return columns
                    
            elif self.engine.dialect.name == "sqlite":
                # Identifier is restricted to [A-Za-z0-9_] by _escape_table_name.
                query_str = f"PRAGMA table_info('{escaped_table_name}')"  # nosec B608
                query = text(query_str)
                
                async with self.engine.begin() as conn:
                    result = await conn.execute(query)
                    columns = {}
                    for row in result.fetchall():
                        columns[row[1]] = {
                            "name": row[1],
                            "type": row[2],
                            "nullable": not row[3],
                            "default": row[4]
                        }
                    return columns
            else:
                logger.warning(f"Unknown database driver ({self.engine.dialect.name})")
                return {}
        except Exception as e:
            logger.error(f"Failed to get columns for {table_name}: {e}")
            return {}

    def _get_model_columns(self, table_name: str) -> dict:
        columns = {}
        model_table = Base.metadata.tables.get(table_name)
        
        if model_table is None:
            return columns
            
        for column in model_table.columns:
            default_value = None
            if column.default:
                if hasattr(column.default, "arg"):
                    default_value = str(column.default.arg)
            elif column.server_default:
                if hasattr(column.server_default, "arg"):
                    default_value = str(column.server_default.arg)
                    
            columns[column.name] = {
                "name": column.name,
                "type": self._map_sqlalchemy_type(column.type),
                "nullable": column.nullable,
                "default": default_value,
            }
            
        return columns

    def _map_sqlalchemy_type(self, sqlalchemy_type):
        type_name = str(sqlalchemy_type).upper()
        
        if "INTEGER" in type_name:
            return "INTEGER"
        elif "STRING" in type_name or "VARCHAR" in type_name:
            return "VARCHAR"
        elif "BOOLEAN" in type_name:
            return "BOOLEAN"
        elif "TEXT" in type_name:
            return "TEXT"
        elif "DATETIME" in type_name or "TIMESTAMP" in type_name:
            return "TIMESTAMP"
            
        return type_name

    def _find_missing_columns(self, existing_columns: dict, model_columns: dict) -> list:
        missing = []
        for col_name, col_info in model_columns.items():
            if col_name not in existing_columns:
                missing.append(col_info)
        return missing

    def _generate_add_column_sql(self, table_name: str, column_info: dict) -> str:
        escaped_table_name = self._escape_table_name(table_name)
        escaped_column_name = self._escape_column_name(column_info['name'])
        
        type_name = column_info["type"]
        nullable = column_info["nullable"]
        default = column_info["default"]
        
        # Both identifiers are validated and type_name is mapped from SQLAlchemy metadata.
        sql = f"ALTER TABLE {escaped_table_name} ADD COLUMN {escaped_column_name} {type_name}"  # nosec B608
        
        if not nullable:
            sql += " NOT NULL"
            
        if default is not None:
            if default == "now()":
                if type_name in ["TEXT", "VARCHAR", "STRING"]:
                    sql += " DEFAULT ''"
                else:
                    sql += " DEFAULT CURRENT_TIMESTAMP"
            else:
                if default == "''" and type_name in ["INTEGER", "BIGINT"]:
                    sql += " DEFAULT 0"
                elif type_name in ["BOOLEAN"]:
                    sql += " DEFAULT FALSE"
                else:
                    sql += f" DEFAULT {default}"
                    
            if type_name in ["TEXT", "VARCHAR", "STRING"] and not str(default).isdigit():
                if default not in ("''", "now()", "CURRENT_TIMESTAMP"):
                    sql += f" DEFAULT '{default}'"
                    
        return sql

    async def ensure_initialized(self):
        """Ensure the database is initialized - used for lazy loading in Lambda environments"""
        if not self._initialized:
            if not self.async_session_maker is not None:
                await self.init_db()


# --- GLOBALS & EXPORTS ---

db_manager = DatabaseManager()

def get_db_manager() -> DatabaseManager:
    return db_manager

async def get_db() -> AsyncSession:
    """FastAPI dependency for getting DB session with lazy initialization support"""
    if not db_manager.engine:
        logger.debug("[DB_OP] Starting get_db session creation")
        
    if not db_manager._initialized:
        logger.warning("Database session maker not available, attempting lazy initialization...")
        try:
            await db_manager.ensure_initialized()
        except Exception as e:
            logger.error(f"Failed to ensure database initialization: {e}", exc_info=True)
            raise RuntimeError("Database initialization failed") from e
            
    if not db_manager.async_session_maker:
        logger.error("Database session maker not available after initialization attempt")
        raise RuntimeError("Database not initialized")
        
    async with db_manager.async_session_maker() as session:
        start_time = time.time()
        logger.debug(f"[DB_OP] Session created successfully in {time.time() - start_time:.4f}s")
        try:
            yield session
        except Exception as e:
            logger.error(f"Database session error: {e}")
            raise
        finally:
            logger.debug(f"[DB_OP] Database session cleanup after {time.time() - start_time:.4f}s")

async def initialize_database():
    """Initialize database and create tables"""
    await db_manager.init_db()
    
    if settings.environment != "production":
        await db_manager.create_tables()
        await db_manager.check_and_repair_existing_tables()

async def close_database():
    """Close database connection"""
    await db_manager.close_db()

async def check_database_health() -> bool:
    """Check if database is healthy"""
    if not db_manager._initialized or not db_manager.async_session_maker:
        return False
        
    try:
        async with db_manager.async_session_maker() as session:
            await session.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False
