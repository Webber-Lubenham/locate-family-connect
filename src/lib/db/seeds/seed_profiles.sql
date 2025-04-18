-- Seed data for profiles table with UUID user_ids
INSERT INTO profiles (user_id, email, full_name, phone, user_type, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'john.doe@example.com', 'John Doe', '+441234567890', 'student', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'jane.smith@example.com', 'Jane Smith', '+441234567891', 'teacher', NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'parent.user@example.com', 'Parent User', '+441234567892', 'parent', NOW(), NOW());
