from core.database import Base
from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy import func

class User(Base):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}

    id = Column(String(255), primary_key=True, index=True) # Use platform sub as primary key
    external_id = Column(String(255), unique=True, index=True, nullable=True)  # Firebase UID or OIDC sub
    email = Column(String(255), unique=True, index=True, nullable=True)
    username = Column(String(255), nullable=True)
    name = Column(String(255), nullable=True)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="user", nullable=False) # user / admin / participant / organizer
    provider = Column(String(50), default="oidc", nullable=True)  # oidc / firebase / google / github
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)


class OIDCState(Base):
    __tablename__ = "oidc_states"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    state = Column(String(255), unique=True, index=True, nullable=False)
    nonce = Column(String(255), nullable=False)
    code_verifier = Column(String(255), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())