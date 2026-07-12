-- PostgreSQL deployment migration for security-related integrity constraints.
-- Run the preflight query first. Resolve duplicates deliberately before applying
-- the constraint; this migration never deletes user data automatically.

BEGIN;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM enrollments
        GROUP BY user_id, course_id
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Duplicate enrollments exist; resolve them before applying this migration';
    END IF;
END
$$;

ALTER TABLE enrollments
    ADD CONSTRAINT uq_enrollments_user_course UNIQUE (user_id, course_id);

COMMIT;
