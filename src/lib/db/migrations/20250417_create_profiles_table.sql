-- Create profiles table
CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    full_name TEXT NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for user_id
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
