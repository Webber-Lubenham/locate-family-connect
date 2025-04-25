-- Seed data for testing
insert into auth.users (id, email, email_confirmed_at, aud)
values (
    '11111111-1111-1111-1111-111111111111',
    'student1@example.com',
    timezone('utc'::text, now()),
    'authenticated'
),
(
    '22222222-2222-2222-2222-222222222222',
    'parent1@example.com',
    timezone('utc'::text, now()),
    'authenticated'
);

-- Insert test users
insert into users (id, name, role, phone)
values (
    '11111111-1111-1111-1111-111111111111',
    'John Doe',
    'student',
    '+44 7900 123456'
),
(
    '22222222-2222-2222-2222-222222222222',
    'Jane Smith',
    'parent',
    '+44 7800 123456'
);
