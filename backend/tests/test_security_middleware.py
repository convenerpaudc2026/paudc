import json

import pytest
from fastapi import HTTPException
from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import PlainTextResponse
from starlette.routing import Route
from starlette.testclient import TestClient

from core.config import settings
from main import sanitize_http_errors
from middlewares.rate_limit import RateLimitMiddleware, RateLimitPolicy
from middlewares.request_size import RequestBodyLimitMiddleware


async def ok_endpoint(request):
    return PlainTextResponse('ok')


def test_rate_limiter_returns_retry_after():
    app = Starlette(routes=[Route('/limited', ok_endpoint, methods=['POST'])])
    app.add_middleware(
        RateLimitMiddleware,
        policies=(RateLimitPolicy('POST', '/limited', 2, 60),),
    )
    client = TestClient(app)

    assert client.post('/limited').status_code == 200
    assert client.post('/limited').status_code == 200
    limited = client.post('/limited')
    assert limited.status_code == 429
    assert int(limited.headers['retry-after']) >= 1


def test_rate_limiter_keys_on_forwarded_client_not_proxy():
    # Every request arrives from the same proxy socket; distinct visitors must
    # still get their own buckets.
    app = Starlette(routes=[Route('/limited', ok_endpoint, methods=['POST'])])
    app.add_middleware(
        RateLimitMiddleware,
        policies=(RateLimitPolicy('POST', '/limited', 1, 60),),
    )
    client = TestClient(app)

    assert client.post('/limited', headers={'X-Forwarded-For': '203.0.113.1, 10.0.0.1'}).status_code == 200
    assert client.post('/limited', headers={'X-Forwarded-For': '203.0.113.2, 10.0.0.1'}).status_code == 200
    assert client.post('/limited', headers={'X-Forwarded-For': '203.0.113.1, 10.0.0.1'}).status_code == 429
    # The Cloudflare-set header wins over a client-supplied X-Forwarded-For.
    assert client.post('/limited', headers={
        'CF-Connecting-IP': '198.51.100.7', 'X-Forwarded-For': '203.0.113.1',
    }).status_code == 200


def test_rate_limited_responses_carry_cors_headers():
    from main import app

    origin = settings.allowed_cors_origins[0]
    client = TestClient(app)
    headers = {'Origin': origin, 'X-Forwarded-For': '192.0.2.250'}
    responses = [client.post('/api/v1/forms/legacy-lab', json={}, headers=headers) for _ in range(6)]

    assert responses[-1].status_code == 429
    assert responses[-1].headers['access-control-allow-origin'] == origin
    assert 'retry-after' in responses[-1].headers['access-control-expose-headers'].lower()


def test_chunked_or_declared_request_body_cannot_exceed_limit():
    app = Starlette(routes=[Route('/upload', ok_endpoint, methods=['POST'])])
    app.add_middleware(RequestBodyLimitMiddleware, max_body_bytes=10)
    client = TestClient(app)

    assert client.post('/upload', content=b'1234567890').status_code == 200
    assert client.post('/upload', content=b'12345678901').status_code == 413


@pytest.mark.asyncio
async def test_server_errors_never_expose_exception_details():
    request = Request({'type': 'http', 'method': 'GET', 'path': '/', 'headers': []})
    response = await sanitize_http_errors(request, HTTPException(500, 'database password leaked'))

    assert response.status_code == 500
    assert json.loads(response.body) == {'detail': 'Internal server error'}
