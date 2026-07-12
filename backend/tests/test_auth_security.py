from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

import pytest
from jose import jwt
from starlette.responses import Response

from core.auth import IDTokenValidationError, clear_auth_cookie, create_access_token, decode_access_token, set_auth_cookie
from core.config import settings
from dependencies import auth as auth_dependencies


@pytest.fixture
def secure_auth_settings(monkeypatch):
    monkeypatch.setattr(settings, 'jwt_secret_key', 't' * 48)
    monkeypatch.setattr(settings, 'jwt_algorithm', 'HS256')
    monkeypatch.setattr(settings, 'jwt_audience', 'paudc-api')
    monkeypatch.setattr(settings, 'backend_url', 'https://api.paudc2026.com')
    monkeypatch.setattr(settings, 'environment', 'production')
    monkeypatch.setattr(settings, 'auth_cookie_name', 'paudc_session')
    monkeypatch.setattr(settings, 'auth_cookie_samesite', 'lax')


def test_application_jwt_round_trip_requires_expected_claims(secure_auth_settings):
    token = create_access_token({'sub': 'user-123', 'role': 'participant'})
    payload = decode_access_token(token)

    assert payload['sub'] == 'user-123'
    assert payload['aud'] == 'paudc-api'
    assert payload['iss'] == 'https://api.paudc2026.com'
    assert payload['jti']


def test_wrong_audience_is_rejected(secure_auth_settings):
    now = datetime.now(timezone.utc)
    token = jwt.encode(
        {
            'sub': 'user-123',
            'aud': 'another-api',
            'iss': 'https://api.paudc2026.com',
            'iat': now,
            'exp': now + timedelta(minutes=5),
        },
        settings.jwt_secret_key,
        algorithm='HS256',
    )

    with pytest.raises(IDTokenValidationError):
        decode_access_token(token)


def test_session_cookie_is_http_only_secure_and_same_site(secure_auth_settings):
    response = Response()
    set_auth_cookie(response, 'signed-token')

    cookie = response.headers['set-cookie']
    assert 'paudc_session=signed-token' in cookie
    assert 'HttpOnly' in cookie
    assert 'Secure' in cookie
    assert 'SameSite=lax' in cookie

    clear_response = Response()
    clear_auth_cookie(clear_response)
    assert 'paudc_session=' in clear_response.headers['set-cookie']


@pytest.mark.asyncio
async def test_authorization_uses_current_database_role(monkeypatch):
    database_user = SimpleNamespace(
        id='user-123',
        email='person@example.com',
        name='Person',
        role='participant',
        last_login=None,
    )

    class FakeSession:
        async def scalar(self, statement):
            return database_user

    monkeypatch.setattr(
        auth_dependencies,
        'decode_access_token',
        lambda token: {'sub': 'user-123', 'role': 'admin'},
    )

    current_user = await auth_dependencies.resolve_authenticated_user('token', FakeSession())
    assert current_user.role == 'participant'
