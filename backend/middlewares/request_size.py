from starlette.responses import JSONResponse


class RequestBodyLimitMiddleware:
    def __init__(self, app, max_body_bytes: int = 2 * 1024 * 1024):
        self.app = app
        self.max_body_bytes = max_body_bytes

    async def __call__(self, scope, receive, send):
        if scope['type'] != 'http' or scope.get('method', '').upper() not in {'POST', 'PUT', 'PATCH'}:
            await self.app(scope, receive, send)
            return

        headers = {key.lower(): value for key, value in scope.get('headers', [])}
        content_length = headers.get(b'content-length')
        if content_length:
            try:
                if int(content_length) > self.max_body_bytes:
                    await self._reject(scope, receive, send)
                    return
            except ValueError:
                response = JSONResponse(status_code=400, content={'detail': 'Invalid Content-Length header'})
                await response(scope, receive, send)
                return

        messages = []
        received_bytes = 0
        more_body = True
        while more_body:
            message = await receive()
            messages.append(message)
            if message['type'] == 'http.disconnect':
                break
            body = message.get('body', b'')
            received_bytes += len(body)
            if received_bytes > self.max_body_bytes:
                await self._reject(scope, receive, send)
                return
            more_body = message.get('more_body', False)

        async def replay_receive():
            if messages:
                return messages.pop(0)
            return {'type': 'http.disconnect'}

        await self.app(scope, replay_receive, send)

    @staticmethod
    async def _reject(scope, receive, send):
        response = JSONResponse(status_code=413, content={'detail': 'Request body too large'})
        await response(scope, receive, send)
