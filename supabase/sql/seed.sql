-- Seed data for testing

-- Insert fictional students
INSERT INTO profiles (id, name, school, grade, phone, user_type, created_at, updated_at)
VALUES
  -- Student 1
  ('a3001', 'Ana Clara Santos', 'Escola Municipal Prof. João Silva', '7º ano', '(11) 98765-4321', 'student', NOW(), NOW()),
  -- Student 2
  ('a3002', 'Pedro Henrique Oliveira', 'Colégio Estadual Maria Souza', '8º ano', '(11) 91234-5678', 'student', NOW(), NOW()),
  -- Student 3
  ('a3003', 'Maria Eduarda Costa', 'Escola Estadual Dr. Carlos Santos', '9º ano', '(11) 99876-5432', 'student', NOW(), NOW()),
  -- Student 4
  ('a3004', 'Lucas Ferreira Silva', 'Colégio Municipal Prof. Ana Maria', '1º ano EM', '(11) 97654-3210', 'student', NOW(), NOW()),
  -- Student 5
  ('a3005', 'Juliana Mendes Lima', 'Escola Estadual Prof. João Carlos', '2º ano EM', '(11) 92345-6789', 'student', NOW(), NOW()),
  -- Student 6
  ('a3006', 'Rafael Santos Souza', 'Colégio Municipal Prof. Maria Silva', '3º ano EM', '(11) 93456-7890', 'student', NOW(), NOW()),
  -- Student 7
  ('a3007', 'Beatriz Ferreira Oliveira', 'Escola Estadual Prof. Carlos Mendes', '1º ano EM', '(11) 94567-8901', 'student', NOW(), NOW()),
  -- Student 8
  ('a3008', 'Gabriel Costa Lima', 'Colégio Estadual Prof. Ana Silva', '2º ano EM', '(11) 95678-9012', 'student', NOW(), NOW()),
  -- Student 9
  ('a3009', 'Larissa Mendes Santos', 'Escola Municipal Prof. João Carlos', '3º ano EM', '(11) 96789-0123', 'student', NOW(), NOW()),
  -- Student 10
  ('a3010', 'Bruno Oliveira Costa', 'Colégio Municipal Prof. Maria Silva', '1º ano EM', '(11) 97890-1234', 'student', NOW(), NOW());

-- Insert fictional parents
INSERT INTO profiles (id, name, school, grade, phone, user_type, created_at, updated_at)
VALUES
  -- Parent 1
  ('p1001', 'João Silva Santos', 'Escola Municipal Prof. João Silva', '7º ano', '(11) 98765-4321', 'parent', NOW(), NOW()),
  -- Parent 2
  ('p1002', 'Maria Souza Oliveira', 'Colégio Estadual Maria Souza', '8º ano', '(11) 91234-5678', 'parent', NOW(), NOW()),
  -- Parent 3
  ('p1003', 'Carlos Santos Costa', 'Escola Estadual Dr. Carlos Santos', '9º ano', '(11) 99876-5432', 'parent', NOW(), NOW()),
  -- Parent 4
  ('p1004', 'Ana Maria Silva Ferreira', 'Colégio Municipal Prof. Ana Maria', '1º ano EM', '(11) 97654-3210', 'parent', NOW(), NOW()),
  -- Parent 5
  ('p1005', 'João Carlos Mendes', 'Escola Estadual Prof. João Carlos', '2º ano EM', '(11) 92345-6789', 'parent', NOW(), NOW()),
  -- Parent 6
  ('p1006', 'Maria Silva Souza', 'Colégio Municipal Prof. Maria Silva', '3º ano EM', '(11) 93456-7890', 'parent', NOW(), NOW());

-- Insert fictional teachers
INSERT INTO profiles (id, name, school, grade, phone, user_type, created_at, updated_at)
VALUES
  -- Teacher 1
  ('t2001', 'Prof. Ana Maria Silva', 'Escola Municipal Prof. João Silva', '7º ano', '(11) 98765-4321', 'teacher', NOW(), NOW()),
  -- Teacher 2
  ('t2002', 'Prof. João Carlos Oliveira', 'Colégio Estadual Maria Souza', '8º ano', '(11) 91234-5678', 'teacher', NOW(), NOW()),
  -- Teacher 3
  ('t2003', 'Prof. Maria Souza Costa', 'Escola Estadual Dr. Carlos Santos', '9º ano', '(11) 99876-5432', 'teacher', NOW(), NOW()),
  -- Teacher 4
  ('t2004', 'Prof. Carlos Santos Silva', 'Colégio Municipal Prof. Ana Maria', '1º ano EM', '(11) 97654-3210', 'teacher', NOW(), NOW());

-- Insert fictional administrators
INSERT INTO profiles (id, name, school, grade, phone, user_type, created_at, updated_at)
VALUES
  -- Admin 1
  ('a4001', 'Dir. João Silva', 'Escola Municipal Prof. João Silva', 'Admin', '(11) 98765-4321', 'admin', NOW(), NOW()),
  -- Admin 2
  ('a4002', 'Dir. Maria Souza', 'Colégio Estadual Maria Souza', 'Admin', '(11) 91234-5678', 'admin', NOW(), NOW());
