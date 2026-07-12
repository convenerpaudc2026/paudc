import pytest
from pydantic import ValidationError

from core.config import Settings


BASE_PRODUCTION_SETTINGS = {
    'environment': 'production',
    'jwt_secret_key': 's' * 48,
    'frontend_url': 'https://www.paudc2026.com',
    'backend_url': 'https://api.paudc2026.com',
    'DATABASE_URL': 'postgresql+asyncpg://app:password@db/paudc',
}


@pytest.mark.parametrize(
    ('override', 'expected_message'),
    [
        ({'jwt_secret_key': ''}, 'JWT_SECRET_KEY'),
        ({'jwt_secret_key': 'too-short'}, 'at least 32'),
        ({'frontend_url': 'http://www.paudc2026.com'}, 'FRONTEND_URL'),
        ({'DATABASE_URL': 'sqlite+aiosqlite:///./paudc.db'}, 'persistent database'),
        ({'debug': True}, 'DEBUG must be false'),
        ({'cors_origins': '*'}, 'wildcard'),
    ],
)
def test_production_security_misconfiguration_fails_closed(override, expected_message):
    values = {**BASE_PRODUCTION_SETTINGS, **override}
    with pytest.raises(ValidationError, match=expected_message):
        Settings(_env_file=None, **values)


def test_form_forwarding_destination_is_allowlisted():
    with pytest.raises(ValidationError, match='script.google.com'):
        Settings(
            _env_file=None,
            environment='dev',
            jwt_secret_key='s' * 48,
            google_apps_script_url='https://example.com/collect',
        )
