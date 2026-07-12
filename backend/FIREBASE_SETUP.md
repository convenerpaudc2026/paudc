# Firebase Backend Integration

## Overview
The backend now supports Firebase authentication. Users can log in with Firebase on the frontend, and the backend will validate the Firebase ID token and issue a JWT for API access.

## Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

This will install `firebase-admin` (added to requirements.txt).

### 2. Configure Firebase Credentials
You have two options. Never place a service-account key inside the repository.

#### Option A: Environment Variable (Recommended for Production)
Set the `FIREBASE_CREDENTIALS_JSON` environment variable with your Firebase service account JSON:

```bash
export FIREBASE_CREDENTIALS_JSON='{"type":"service_account","project_id":"paudc-75c05",...}'
```

Or in `.env` file:
```
FIREBASE_CREDENTIALS_JSON={"type":"service_account","project_id":"paudc-75c05",...}
```

#### Option B: Explicit Credentials File (Development)
Store the service account JSON outside the repository and point to it explicitly:
```
FIREBASE_CREDENTIALS_FILE=C:/secure/path/firebase-service-account.json
```

### 3. Get Firebase Service Account Credentials
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (paudc-75c05)
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Copy the entire JSON content

## API Endpoint

### Firebase Login
**POST** `/api/v1/auth/firebase/login`

**Request:**
```json
{
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ..."
}
```

**Response (Success):**
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "username": "user",
    "full_name": "User Name",
    "role": "participant"
  }
}
```

**Response (Error):**
```json
{
  "detail": "Invalid Firebase token"
}
```

## Frontend Integration

### 1. Get Firebase ID Token
After Firebase authentication on the frontend:
```javascript
import { auth } from '@/lib/firebase';

const user = auth.currentUser;
const idToken = await user.getIdToken();
```

### 2. Exchange for Backend JWT
```javascript
const response = await fetch('http://localhost:8000/api/v1/auth/firebase/login', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id_token: idToken })
});
// The backend establishes an HttpOnly session cookie.
```

## Database Changes

Added new columns to the `users` table:
- `external_id` (String) - Firebase UID or OIDC sub
- `username` (String) - User's username
- `full_name` (String) - User's full name
- `provider` (String) - Authentication provider (firebase, oidc, google, etc.)

Development startup can create missing tables and columns. Production schema
changes must be applied through a reviewed migration.

## Flow Diagram

```
Frontend                         Backend
   |                              |
   | 1. User signs in with         |
   |    Firebase                   |
   |------- getIdToken() --------->|
   |                               |
   |                            2. Verify
   |                            Firebase
   |                            token
   | 3. POST /firebase/login   |
   |    {id_token: ...}        |
   |------- id_token ---------->|
   |                               |
   |                            4. Create/Get
   |                            user in DB
   |                               |
   | 5. Set HttpOnly cookie       |
   |<------ Set-Cookie -----------|
   |                               |
   | 6. Send credentialed requests |
   |-------- session cookie ------>|
```

## Security Notes

- ✅ Firebase tokens are validated server-side
- ✅ JWT tokens are issued for API access
- ✅ Credentials stored securely in environment variables
- ✅ User created automatically on first login
- ⚠️ Ensure Firebase credentials are never committed to version control
- ⚠️ Use HTTPS in production
- ⚠️ Implement token refresh mechanism for long-lived sessions

## Troubleshooting

### Firebase credentials not found
- Ensure `FIREBASE_CREDENTIALS_JSON` or `FIREBASE_CREDENTIALS_FILE` is set
- Check the environment variable syntax

### Invalid Firebase token
- Verify the ID token is fresh (not expired)
- Ensure Firebase auth is enabled in your project
- Check that the token is from the correct Firebase project

### Token verification fails
- Ensure `firebase-admin` is installed
- Check Firebase credentials are correct
- Verify the Firebase project ID matches the credentials

## Files Modified/Created

- `backend/services/firebase.py` - Firebase token verification service
- `backend/routers/auth.py` - Added `/firebase/login` endpoint
- `backend/models/auth.py` - Updated User model with new fields
- `backend/requirements.txt` - Added firebase-admin dependency
