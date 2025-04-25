-- Create users table
create table if not exists users (
    id uuid references auth.users on delete cascade not null primary key,
    name text not null,
    role text not null check (role in ('student', 'parent')),
    phone text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a function to update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
create trigger update_users_updated_at
    before update on users
    for each row
    execute function update_updated_at_column();

-- Create a test user
insert into auth.users (id, email, email_confirmed_at, aud)
values (
    '00000000-0000-0000-0000-000000000000',
    'test@example.com',
    timezone('utc'::text, now()),
    'authenticated'
);

-- Insert test data into users table
insert into users (id, name, role, phone)
values (
    '00000000-0000-0000-0000-000000000000',
    'Test User',
    'student',
    '+44 7386 797716'
);
