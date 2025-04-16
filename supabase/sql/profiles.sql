-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text,
  school text,
  grade text,
  phone text,
  user_type text check (user_type in ('student', 'parent')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
alter table profiles enable row level security;

create policy "Users can view their own profile."
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile."
  on profiles for update
  using (auth.uid() = id);

-- Create trigger to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger on_profiles_updated
  before update on profiles
  for each row
  execute function update_updated_at_column();
