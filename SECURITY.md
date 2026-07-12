# Security policy

## Reporting a vulnerability

Do not disclose suspected vulnerabilities in a public issue. Use the PAUDC
contact form and put `Security vulnerability` in the subject. Include the
affected URL or component, reproduction steps, impact, and a safe contact
address. Do not include live credentials or personal data.

The maintainers should acknowledge the report privately, preserve evidence,
triage severity, and coordinate remediation and disclosure with the reporter.

## Supported code

Security fixes are applied to the currently deployed release and the default
branch. Older deployments should be upgraded rather than independently patched.

## Credential handling

- Secrets belong in the deployment secret store, never source control.
- Firebase service-account keys, JWT secrets, SMTP passwords, database URLs,
  OIDC client secrets, and API keys must be rotated after suspected exposure.
- Production and non-production environments must use separate credentials.
- Logs and support material must not contain tokens, passwords, or private keys.

## Release requirements

Every production release must pass `.github/workflows/security.yml`, use the
production settings in `backend/.env.example`, apply reviewed database
migrations, and complete the deployment checks in
`docs/security/DEPLOYMENT_CHECKLIST.md`.
