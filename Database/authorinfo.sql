CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS authors (
	id BIGSERIAL PRIMARY KEY,
	email TEXT NOT NULL UNIQUE,
	phone TEXT NOT NULL UNIQUE,
	password_hash TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION authenticate_author(
	input_email TEXT,
	input_phone TEXT,
	input_password TEXT
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY INVOKER
AS $$
	SELECT EXISTS (
		SELECT 1
		FROM authors
		WHERE LOWER(email) = LOWER(TRIM(input_email))
		  AND regexp_replace(phone, '[^0-9]', '', 'g') = regexp_replace(input_phone, '[^0-9]', '', 'g')
		  AND crypt(input_password, password_hash) = password_hash
	);
$$;

-- Store only a hash, never a plaintext password.
-- Example:
-- INSERT INTO authors (email, phone, password_hash)
-- VALUES ('author@example.com', '+15551234567', crypt('replace-me', gen_salt('bf')));
