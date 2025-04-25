-- Seed data for users table with UUIDs
INSERT INTO users (id, email, user_type)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'john.doe@example.com', 'student'),
  ('22222222-2222-2222-2222-222222222222', 'jane.smith@example.com', 'teacher'),
  ('33333333-3333-3333-3333-333333333333', 'parent.user@example.com', 'parent');
