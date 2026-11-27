"""The backend must only report success when the Apps Script actually saved the row.

Apps Script answers HTTP 200 even when it fails, so a broken sheet used to show
applicants "Registration Submitted" while their data was dropped.
"""
import httpx
import pytest
from fastapi.testclient import TestClient

from core.config import settings
from main import app
from routers import public_forms
from routers.public_forms import apps_script_failure

EXEC_URL = 'https://script.google.com/macros/s/test-deployment/exec'
CONTENT_URL = 'https://script.googleusercontent.com/macros/echo?user_content_key=abc'

REGISTRATION = {
    'type': 'registration',
    'registrationType': 'individual',
    'email': 'applicant@example.com',
    'name': 'Test Applicant',
    'country': 'Nigeria',
}


def reply(url: str = CONTENT_URL, **kwargs) -> httpx.Response:
    return httpx.Response(200, request=httpx.Request('GET', url), **kwargs)


def test_success_json_is_accepted():
    assert apps_script_failure(reply(json={'success': True, 'message': 'Form submitted successfully'})) is None


def test_reported_failure_is_rejected_with_the_scripts_message():
    failure = apps_script_failure(reply(json={
        'success': False,
        'message': "Server error: TypeError: Cannot read properties of null (reading 'appendRow')",
    }))
    assert failure is not None and 'appendRow' in failure


def test_redirect_to_google_sign_in_is_rejected():
    failure = apps_script_failure(reply(
        url='https://accounts.google.com/v3/signin/identifier',
        headers={'content-type': 'text/html'},
        text='<html>Sign in</html>',
    ))
    assert failure is not None and 'accounts.google.com' in failure


def test_html_error_page_is_rejected():
    failure = apps_script_failure(reply(
        headers={'content-type': 'text/html; charset=utf-8'},
        text='<html><title>Error</title>Script function not found: doPost</html>',
    ))
    assert failure is not None


def test_plain_text_reply_without_a_failure_flag_is_accepted():
    assert apps_script_failure(reply(headers={'content-type': 'text/plain'}, text='OK')) is None


@pytest.fixture
def apps_script(monkeypatch):
    """Route the backend's outgoing Apps Script call to a fake that returns `state['reply']`."""
    state = {}

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.host == 'script.google.com':
            return httpx.Response(302, headers={'location': state.get('redirect', CONTENT_URL)})
        return state['reply']

    real_client = httpx.AsyncClient

    def fake_client(*args, **kwargs):
        return real_client(*args, transport=httpx.MockTransport(handler), **kwargs)

    monkeypatch.setattr(public_forms.httpx, 'AsyncClient', fake_client)
    monkeypatch.setattr(settings, 'google_apps_script_url', EXEC_URL)
    return state


def submit(payload=REGISTRATION):
    with TestClient(app) as client:
        return client.post('/api/v1/forms/submit', json=payload, headers={'X-Forwarded-For': '203.0.113.7'})


def test_saved_registration_returns_success(apps_script):
    apps_script['reply'] = httpx.Response(200, json={'success': True, 'message': 'Form submitted successfully'})
    response = submit()
    assert response.status_code == 200
    assert response.json() == {'success': True}


def test_registration_the_script_failed_to_save_returns_502(apps_script):
    apps_script['reply'] = httpx.Response(200, json={'success': False, 'message': 'Server error: TypeError'})
    response = submit()
    assert response.status_code == 502
    assert 'TypeError' not in response.text  # the script's internals stay in the server log


def test_sign_in_redirect_returns_502(apps_script):
    apps_script['redirect'] = 'https://accounts.google.com/ServiceLogin'
    apps_script['reply'] = httpx.Response(200, headers={'content-type': 'text/html'}, text='<html>Sign in</html>')
    assert submit().status_code == 502
