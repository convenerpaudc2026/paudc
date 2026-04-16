import logging
from typing import Optional, Dict, Any
import os
import json
from pathlib import Path

import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from firebase_admin.exceptions import FirebaseError

logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK
def init_firebase():
    """Initialize Firebase Admin SDK with credentials from environment."""
    if firebase_admin._apps:  # Check if already initialized
        return
    
    try:
        # Try to get Firebase credentials from environment variable
        firebase_creds_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
        
        if firebase_creds_json:
            # Parse JSON from environment variable
            creds_dict = json.loads(firebase_creds_json)
            creds = credentials.Certificate(creds_dict)
        else:
            # Try to load from file (for development)
            creds_path = Path(__file__).parent.parent / "firebase-credentials.json"
            if creds_path.exists():
                creds = credentials.Certificate(str(creds_path))
            else:
                logger.warning("Firebase credentials not found. Firebase features will be disabled.")
                return
        
        firebase_admin.initialize_app(creds)
        logger.info("Firebase Admin SDK initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {e}")
        raise


async def verify_firebase_token(id_token: str) -> Optional[Dict[str, Any]]:
    """
    Verify a Firebase ID token and return the decoded token claims.
    
    Args:
        id_token: Firebase ID token from the client
        
    Returns:
        Decoded token claims or None if verification fails
    """
    try:
        if not firebase_admin._apps:
            init_firebase()
            
        decoded_token = firebase_auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        logger.error(f"Firebase token verification failed: {e}")
        return None


async def get_firebase_user(uid: str) -> Optional[Dict[str, Any]]:
    """
    Get Firebase user details by UID.
    
    Args:
        uid: Firebase user ID
        
    Returns:
        User record or None if not found
    """
    try:
        if not firebase_admin._apps:
            init_firebase()
            
        user = firebase_auth.get_user(uid)
        return {
            "uid": user.uid,
            "email": user.email,
            "display_name": user.display_name,
            "photo_url": user.photo_url,
            "email_verified": user.email_verified,
        }
    except Exception as e:
        logger.error(f"Failed to get Firebase user {uid}: {e}")
        return None
