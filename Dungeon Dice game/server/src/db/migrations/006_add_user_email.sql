ALTER TABLE users
ADD COLUMN email TEXT;

CREATE UNIQUE INDEX idx_users_email_unique
ON users(email)
WHERE email IS NOT NULL;