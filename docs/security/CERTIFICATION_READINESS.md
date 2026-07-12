# Security certification readiness

Assessment date: 2026-06-22

Status: **Conditionally ready for independent assessment; not certified.**

This repository has been hardened and mapped to OWASP ASVS control families.
A formal certificate must be issued by the selected independent assessor after
live-environment testing and closure of the blocking actions below. The exact
ASVS release and assurance level must be agreed with that assessor; external
standards lookup was unavailable in the assessment environment.

## Scope

Included:

- React/Vite frontend source and browser security configuration
- FastAPI application, authentication, authorization, validation, and storage
- Python and npm dependency manifests
- Repository secret hygiene and automated security checks
- Vercel-oriented application configuration

Not independently verified:

- Live Vercel, Firebase, OIDC, Google Apps Script, DNS, TLS, database, and IAM configuration
- Cloud logs, backups, restoration, alerting, WAF, and incident-response operation
- Production data retention and privacy compliance
- Third-party penetration testing or assessor attestation

## Readiness result

| Area | Result | Evidence |
|---|---|---|
| Authentication | Implemented | Signed JWTs require issuer, audience, expiry, issued-at, subject, and fixed HS256; Firebase and OIDC require verified email; sessions use Secure HttpOnly cookies in production. |
| Session management | Implemented with residual action | Cookie auth, SameSite policy, origin checks for state-changing requests, no browser token storage, database reload of current identity and role. Distributed revocation/deny-listing is not implemented. |
| Access control | Implemented | Admin mutations require admin dependencies; participant queries and changes are ownership-scoped; unpublished LMS data and quiz answers are restricted. |
| Input/output handling | Implemented | Pydantic bounds, storage-key traversal rejection, email escaping, rich-HTML sanitization, CSS value validation, generic server errors, and a body-size middleware that also handles undeclared/chunked bodies. |
| Abuse controls | Partially implemented | Sensitive public endpoints have bounded in-process rate limits. A distributed edge/WAF limiter is still required for multi-instance production. |
| Secrets | Blocking action | Credential files and logs are removed from the tracked tree and ignored. A Firebase private key remains in Git history and must be revoked and purged. |
| Dependencies | Automated | npm audit previously reported zero findings for the unchanged lockfile. CI now enforces npm audit, pip-audit, and Bandit. The latest local registry query was network-blocked. |
| Build/static checks | Partially verified | TypeScript passes; ESLint passes with zero errors and seven Fast Refresh warnings; current-tree credential scan and diff checks pass. The Vite bundle and Python suite must pass in CI. |
| Deployment/infrastructure | Not yet assessed | Requires live TLS/header checks, DAST, IAM review, database migration, backups, monitoring, and WAF evidence. |

## OWASP ASVS control-family mapping

| Control family | Repository evidence |
|---|---|
| Architecture and configuration | Production settings fail closed on weak secrets, HTTP URLs, SQLite, wildcard CORS, or debug mode; environment examples and deployment checklist are included. |
| Authentication | Firebase token verification, OIDC authorization-code flow with state, nonce, PKCE, signed ID-token validation, provider-conflict checks, and verified-email enforcement. |
| Session management | HttpOnly cookie session, Secure in production, SameSite setting, bounded lifetime, no-store auth responses, and trusted-origin checks for cookie-authenticated mutations. |
| Access control | Central current-user/admin dependencies, database-backed role resolution, ownership checks, enrollment checks, and server-side grading/progress rules. |
| Validation and business logic | Bounded schemas, fixed enrollment state, server-owned identity and role fields, duplicate-enrollment protection, bounded batch operations, and public-form validation. |
| Stored and reflected data | DOMPurify allowlisting, safe chart CSS generation, HTML email escaping, generic 5xx responses, and credential-safe authentication logging. |
| Cryptography | TLS required by production configuration, secure random state/nonce/PKCE/JTI values, fixed JWT algorithm, and no committed application secrets in the current tree. |
| Communications | Explicit CORS origins, credentials policy, HSTS, CSP, framing, MIME-sniffing, referrer, and permissions headers. |
| API and web services | Request-size enforcement, bounded query/page inputs, rate limits, external service timeouts, allowlisted form-forwarding destination, and storage path validation. |
| Malicious code and dependencies | npm and Python advisory checks, Bandit static analysis, current-tree credential pattern scan, lint, build, and tests in CI. |

## Material remediations completed

- Removed the committed Firebase credential, SQLite database, and application logs from Git tracking and added ignore rules.
- Replaced browser-stored bearer tokens and URL-fragment tokens with server-issued HttpOnly cookies.
- Added audience/issuer/algorithm enforcement and production secret validation.
- Added CSRF-style origin enforcement for cookie-authenticated mutations.
- Prevented identity-provider conflicts, unverified-email sign-in, and role injection.
- Re-reads identity and role from the database for each authenticated request.
- Protected administrative writes and ownership-scoped participant records.
- Hid quiz answers, moved grading server-side, and protected LMS enrollment access.
- Sanitized rich HTML and removed direct CSS HTML injection.
- Moved public form forwarding out of the browser and behind backend validation and rate limiting.
- Added request-size, CORS, security-header, error-sanitization, and abuse-control middleware.
- Updated vulnerable dependency ranges and added continuous security checks.

## Certification blockers

1. Revoke the exposed Firebase service-account key in Google Cloud/Firebase and issue a new least-privilege credential.
2. Rewrite Git history to remove the old credential and logs, then force-update all remotes and require every clone to be replaced.
3. Run and pass the new CI workflow, including Python tests, pip-audit, Bandit, npm audit, lint, and production build.
4. Apply `backend/migrations/20260622_security_constraints.sql` after resolving any duplicate enrollment records.
5. Configure distributed edge rate limiting/WAF rules; the application limiter is intentionally only a local safety layer.
6. Perform authenticated and unauthenticated DAST against staging, plus manual authorization testing for admin, organizer, participant, and anonymous roles.
7. Collect live evidence for TLS, headers, CORS, cookies, Firebase/IAM, database access, backups/restoration, logs/alerts, and incident response.
8. Review the Google Apps Script data processor and publish/approve retention and privacy rules for registrations, contact messages, and waitlist addresses.
9. Select an independent assessor, agree the ASVS release and target level, remediate their findings, and obtain their signed attestation.

## Residual risks to accept or close

- JWT sessions have no distributed deny-list. Database reloads immediately enforce user deletion and role changes, while a stolen token remains usable until expiry unless signing keys are rotated.
- Rate limiting is process-local and can be bypassed across serverless instances without edge controls.
- Video watch history uses browser storage as a user-experience aid; server-side completion remains the authoritative learning record.
- The legacy platform-token exchange endpoint remains for compatibility and should be removed when all clients use the OIDC callback flow.
- CSP `connect-src` permits HTTPS destinations because deployment-specific Firebase and API hosts are injected at build time; a nonce/hash-based and host-specific policy can further reduce exposure.
