import type { Config } from 'drizzle-kit'
import { env } from './src/env'

export default {
  schema: 'src/lib/db/schema.ts',
  out: 'src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres'
  },
} satisfies Config
