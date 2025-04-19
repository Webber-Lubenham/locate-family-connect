
create table public.guardians (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  student_id uuid references auth.users(id) on delete cascade,
  email text not null,
  phone text,
  is_active boolean default true
);

-- Permissões RLS
alter table public.guardians enable row level security;

-- Políticas
create policy "Estudantes podem gerenciar seus responsáveis"
  on guardians
  for all
  using (auth.uid() = student_id);

-- Índices
create index guardians_student_id_idx on guardians(student_id);
create index guardians_email_idx on guardians(email);

-- Permissões
grant all on guardians to authenticated;
