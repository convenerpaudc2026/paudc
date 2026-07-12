import asyncio
import time
from collections import OrderedDict, deque
from dataclasses import dataclass

from starlette.responses import JSONResponse


@dataclass(frozen=True)
class RateLimitPolicy:
    method: str
    path: str
    requests: int
    window_seconds: int


class RateLimitMiddleware:
    def __init__(self, app, policies: tuple[RateLimitPolicy, ...], max_clients: int = 10_000):
        self.app = app
        self.policies = policies
        self.max_clients = max_clients
        self.buckets: OrderedDict[tuple[str, str, str], deque[float]] = OrderedDict()
        self.lock = asyncio.Lock()

    async def __call__(self, scope, receive, send):
        if scope['type'] != 'http':
            await self.app(scope, receive, send)
            return

        method = scope.get('method', '').upper()
        path = scope.get('path', '')
        policy = next(
            (item for item in self.policies if item.method == method and item.path == path),
            None,
        )
        if policy is None:
            await self.app(scope, receive, send)
            return

        client = scope.get('client')
        client_ip = client[0] if client else 'unknown'
        key = (client_ip, method, path)
        now = time.monotonic()

        async with self.lock:
            bucket = self.buckets.setdefault(key, deque())
            cutoff = now - policy.window_seconds
            while bucket and bucket[0] <= cutoff:
                bucket.popleft()
            if len(bucket) >= policy.requests:
                retry_after = max(1, int(policy.window_seconds - (now - bucket[0])))
                response = JSONResponse(
                    status_code=429,
                    content={'detail': 'Too many requests'},
                    headers={'Retry-After': str(retry_after)},
                )
                await response(scope, receive, send)
                return
            bucket.append(now)
            self.buckets.move_to_end(key)
            while len(self.buckets) > self.max_clients:
                self.buckets.popitem(last=False)

        await self.app(scope, receive, send)
