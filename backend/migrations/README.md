# Database migrations

Production schema changes are explicit and must be reviewed before deployment.
The application does not create or repair production tables at startup.

Apply `20260622_security_constraints.sql` to the production PostgreSQL database
during a maintenance window. It fails safely if duplicate enrollments exist and
does not delete or merge records automatically.
