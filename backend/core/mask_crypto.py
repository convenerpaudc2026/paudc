import os
import base64
import hashlib
from cryptography.fernet import Fernet

key_prefix = "mgxkey-"

def derive_fernet_key(key_material: str) -> bytes:
    """Derive a valid Fernet key from arbitrary string using SHA-256 and urlsafe base64."""
    digest = hashlib.sha256(key_material.encode("utf-8")).digest() # 32 bytes
    return base64.urlsafe_b64encode(digest)

def get_fernet(key_str: str) -> Fernet:
    key = derive_fernet_key(key_str)
    return Fernet(key)

def encrypt_text(plain: str) -> str:
    pwd = os.environ.get('MASK_KEY')
    if not pwd or len(pwd) < 32:
        raise RuntimeError('MASK_KEY must be configured with at least 32 characters')
    f = get_fernet(pwd)
    return key_prefix + f.encrypt(plain.encode("utf-8")).decode("utf-8")
