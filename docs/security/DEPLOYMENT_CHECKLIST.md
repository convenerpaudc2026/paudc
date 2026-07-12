# Production security deployment checklist

## Before deployment

- [ ] Revoke the exposed Firebase key and create a replacement with minimum permissions.
- [ ] Purge the credential and logs from every Git ref and replace existing clones.
- [ ] Require the `Security checks` workflow on protected branches and confirm every job passes.
- [ ] Set `ENVIRONMENT=production` and `DEBUG=false`.
- [ ] Generate a new random `JWT_SECRET_KEY` of at least 32 characters in the deployment secret store.
- [ ] Set HTTPS `FRONTEND_URL` and `BACKEND_URL`, exact `CORS_ORIGINS`, and the intended cookie SameSite policy.
- [ ] Configure a persistent PostgreSQL `DATABASE_URL` with TLS and least-privilege credentials.
- [ ] Configure Firebase, OIDC, SMTP, storage, and form-forwarding values only in the deployment secret store.
- [ ] Confirm OIDC redirect and logout URLs exactly match the production hosts.
- [ ] Apply the reviewed database migration and retain rollback/backup evidence.

## Edge and infrastructure

- [ ] Enforce HTTPS redirects and modern TLS; verify HSTS after domain ownership is stable.
- [ ] Add distributed rate limits for login, token exchange, contact, registration, waitlist, and expensive AI endpoints.
- [ ] Add bot protection for public forms if abuse volume warrants it.
- [ ] Restrict database and administrative service access by network and IAM policy.
- [ ] Encrypt backups, test restoration, and record recovery objectives.
- [ ] Alert on authentication spikes, repeated 403/429 responses, unexpected admin actions, and server errors without logging secrets.

## Staging verification

- [ ] Test anonymous, participant, organizer, and admin access matrices.
- [ ] Verify cookies are Secure, HttpOnly, correctly SameSite, and absent from URLs/browser storage.
- [ ] Verify untrusted or missing origins cannot perform cookie-authenticated mutations.
- [ ] Verify CORS rejects arbitrary origins and accepts only intended frontend hosts.
- [ ] Run authenticated and unauthenticated DAST and resolve high/medium findings.
- [ ] Check CSP, HSTS, frame, MIME, referrer, permissions, and cache headers on real responses.
- [ ] Test oversized and chunked bodies, traversal payloads, stored XSS, IDOR, duplicate enrollment, and quiz-answer disclosure.
- [ ] Confirm logs redact tokens, credentials, personal data, and exception internals.

## Certification handoff

- [ ] Freeze the assessed release commit and record dependency lockfile hashes.
- [ ] Give the assessor architecture, data-flow, role matrix, CI output, DAST results, migration evidence, and this readiness report.
- [ ] Record accepted residual risks with an owner and review date.
- [ ] Obtain the independent signed report/certificate and define reassessment triggers.
