# Supabase Client Best Practices

## Overview

To avoid warnings about multiple GoTrueClient instances and potential undefined behavior, it is important to create and use a single Supabase client instance throughout your application.

## Guidelines

- Use a singleton pattern to create the Supabase client once and reuse it everywhere.
- Export the singleton client from a dedicated module (e.g., `src/lib/supabase.ts`).
- Import and use the singleton client in all components, hooks, and contexts.
- Avoid creating new Supabase clients inside React components, hooks, or any runtime code.
- For admin operations, create a separate singleton admin client with appropriate keys and settings.
- In development, watch for warnings about multiple client instances and investigate any unexpected client creations.
- If using hot module reload, ensure the singleton pattern is preserved to avoid multiple instances.

## Example

```ts
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
```

Then import `supabase` from this module everywhere in your app.

## Additional Notes

- Test and script files may create their own clients for isolated testing; this is acceptable.
- The main app runtime should only use the singleton client to avoid conflicts.
