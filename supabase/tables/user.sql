CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  google_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
