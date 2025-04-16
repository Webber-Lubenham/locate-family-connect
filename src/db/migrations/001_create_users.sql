-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name TEXT,
  email VARCHAR(256) NOT NULL UNIQUE,
  school TEXT,
  grade TEXT,
  phone VARCHAR(20),
  user_type TEXT NOT NULL
);
