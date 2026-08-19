import importlib
import logging
import os
import pkgutil
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path

from core.config import settings
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.routing import APIRouter

# MODULE_IMPORTS_START
from core.database import initialize_database, close_database
from services.mock_data import initialize_mock_data
from services.auth import initialize_admin_user
from middlewares.rate_limit import RateLimitMiddleware, RateLimitPolicy
from middlewares.request_size import RequestBodyLimitMiddleware
# MODULE_IMPORTS_END

def setup_logging():
    """Configure the root logger and logging system."""
    # Vercel and AWS Lambda have read-only filesystems (except /tmp)
    is_serverless = (
        os.environ.get("IS_LAMBDA") == "true" or 
        os.environ.get("AWS_LAMBDA_FUNCTION_NAME") is not None or 
        os.environ.get("VERCEL") == "1"
    )
    
    if is_serverless:
        # Just use console logging for serverless environments
        logging.basicConfig(
            level=logging.INFO,
            format="%(name)s - %(levelname)s - %(message)s"
        )
        return

    # Create the logs directory
    log_dir = "logs"
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    # Generate log filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = os.path.join(log_dir, f"app_{timestamp}.log")

    # Configure log format
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    # Configure the root logger
    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler()
        ]
    )

    # Set log levels for specific modules
    logging.getLogger("uvicorn").setLevel(logging.DEBUG if settings.debug else logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

    # Log configuration details
    logger = logging.getLogger(__name__)
    logger.info("=== Logging system initialized ===")
    logger.info(f"Log file: {log_file}")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Timestamp: {timestamp}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # MODULE_STARTUP_START
    logger = logging.getLogger(__name__)
    logger.info("=== Application startup initiated ===")
    
    await initialize_database()
    await initialize_mock_data()
    await initialize_admin_user()
    
    logger.info("=== Application startup completed successfully ===")
    # MODULE_STARTUP_END
    yield
    # MODULE_SHUTDOWN_START
    logger.info("=== Application shutdown initiated ===")
    await close_database()
    logger.info("=== Application shutdown completed successfully ===")
    # MODULE_SHUTDOWN_END

setup_logging()

app = FastAPI(
    title=settings.project_name,
    openapi_url=f'{settings.api_v1_str}/openapi.json' if settings.environment != 'production' else None,
    docs_url='/docs' if settings.environment != 'production' else None,
    redoc_url='/redoc' if settings.environment != 'production' else None,
    lifespan=lifespan,
)


@app.exception_handler(HTTPException)
async def sanitize_http_errors(request: Request, exc: HTTPException):
    detail = exc.detail
    if exc.status_code >= 500:
        detail = 'Internal server error'
    return JSONResponse(
        status_code=exc.status_code,
        content={'detail': detail},
        headers=exc.headers,
    )

# MODULE_MIDDLEWARE_START
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_cors_origins,
    allow_credentials=True,
    allow_methods=['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allow_headers=['Authorization', 'Content-Type', 'Accept', 'X-Request-ID'],
    expose_headers=['X-Request-ID'],
    max_age=600,
)
app.add_middleware(
    RateLimitMiddleware,
    policies=(
        RateLimitPolicy('GET', '/api/v1/auth/login', 20, 60),
        RateLimitPolicy('POST', '/api/v1/auth/firebase/login', 20, 60),
        RateLimitPolicy('POST', '/api/v1/auth/token/exchange', 20, 60),
        RateLimitPolicy('POST', '/api/v1/contact/', 5, 600),
        RateLimitPolicy('POST', '/api/v1/forms/submit', 5, 600),
        RateLimitPolicy('POST', '/api/v1/forms/legacy-lab', 5, 600),
        RateLimitPolicy('POST', '/api/v1/entities/registrations/', 5, 3600),
        RateLimitPolicy('POST', '/api/v1/aihub/genTxt', 30, 60),
        RateLimitPolicy('POST', '/api/v1/aihub/genImg', 10, 60),
    ),
)
app.add_middleware(RequestBodyLimitMiddleware, max_body_bytes=2 * 1024 * 1024)
# MODULE_MIDDLEWARE_END

@app.middleware('http')
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers.setdefault('X-Content-Type-Options', 'nosniff')
    response.headers.setdefault('X-Frame-Options', 'DENY')
    response.headers.setdefault('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'")
    response.headers.setdefault('Referrer-Policy', 'no-referrer')
    response.headers.setdefault('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    response.headers.setdefault('X-Permitted-Cross-Domain-Policies', 'none')
    if request.url.path.startswith(f'{settings.api_v1_str}/auth'):
        response.headers.setdefault('Cache-Control', 'no-store')
    if settings.environment == 'production':
        response.headers.setdefault('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    return response


@app.middleware('http')
async def protect_cookie_authenticated_mutations(request, call_next):
    if (
        request.method in {'POST', 'PUT', 'PATCH', 'DELETE'}
        and request.cookies.get(settings.auth_cookie_name)
    ):
        origin = request.headers.get('origin', '').rstrip('/')
        if origin not in settings.allowed_cors_origins:
            return JSONResponse(status_code=403, content={'detail': 'Untrusted request origin'})
    return await call_next(request)

def include_routers_from_package(app: FastAPI, package_name: str = "routers") -> None:
    """Discover and include all APIRouter objects from a package."""
    logger = logging.getLogger(__name__)
    package = importlib.import_module(package_name)
    pkg_path = package.__path__
    
    discovered = 0
    for finder, module_name, is_pkg in pkgutil.walk_packages(pkg_path, package_name + "."):
        if is_pkg or module_name.endswith('__init__'):
            # Skip subpackages or __init__.py files
            # if we want to support leaf modules, subpackages will be walked automatically
            continue
            
        try:
            module = importlib.import_module(module_name)
        except Exception as e: # pragma: no cover - defensive logging
            logger.warning(f"Failed to import module '{module_name}': %s", module_name, exc_info=True)
            continue
            
        # Check for router variable names: router and admin_router
        for attr_name in ("router", "admin_router"):
            if not hasattr(module, attr_name):
                continue
                
            router_obj = getattr(module, attr_name)
            
            if isinstance(router_obj, APIRouter):
                app.include_router(router_obj)
                discovered += 1
                logger.info(f"Included {attr_name} from {module_name}")
                
    logger.info(f"Total routers discovered and included: {discovered}")

include_routers_from_package(app, "routers")

@app.get("/")
def root():
    return {"message": "FastAPI Modular Template is running!"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

def run_in_debug_mode(app: FastAPI):
    """Run the FastAPI app in debug mode with proper asyncio handling.
    
    This function handles the special case of running in a debugger (PyCharm, VS Code, etc.)
    where the debugger's asyncio event loop conflicts with uvicorn's asyncio_run.
    
    It loads environment variables from .env and uses asyncio.run() directly
    to avoid uvicorn's asyncio_run conflicts.
    """
    import asyncio
    import uvicorn
    from dotenv import load_dotenv
    
    # Load environment variables from .env file
    env_path = Path('.') / '.env'
    if env_path.exists():
        load_dotenv(dotenv_path=env_path, override=True)
        logger = logging.getLogger(__name__)
        logger.info("Loaded environment variables from .env file")
        
    # In debug mode, use uvicorn.Server directly to avoid uvicorn's asyncio_run conflicts
    config = uvicorn.Config(
        app, 
        host="0.0.0.0",  # nosec B104 - container/server binding is intentional
        port=int(settings.port), 
        log_level="info"
    )
    server = uvicorn.Server(config)
    asyncio.run(server.serve())


if __name__ == "__main__":
    import sys
    import uvicorn
    
    # Detect if running in debugger (PyCharm, VS Code, etc.)
    # Debuggers patch asyncio which conflicts with uvicorn's asyncio_run
    is_debugging = "pydevd" in sys.modules or (hasattr(sys, "gettrace") and sys.gettrace() is not None)
    
    if is_debugging:
        run_in_debug_mode(app)
    else:
        # Enable reload in normal mode
        uvicorn.run(
            "main:app", 
            host="0.0.0.0",  # nosec B104 - container/server binding is intentional
            port=int(settings.port),
            reload=settings.environment != "production",
            reload_excludes=["*.pyc", "*.log", "logs/*", "logs"],
        )
