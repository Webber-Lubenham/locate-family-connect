import type { Config } from 'drizzle-kit'
export default {
  schema: 'src/lib/db/schema.ts',
  out: 'src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: 'aws-0-eu-west-2.pooler.supabase.com',
    port: 6543,
    user: 'postgres.rsvjnndhbyyxktbczlnk',
    password: 'P+-@@6CUDUJSUpy',
    database: 'postgres',
    ssl: false
  }
} satisfies Config
