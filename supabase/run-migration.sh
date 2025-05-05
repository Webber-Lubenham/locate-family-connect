
#!/bin/bash

# Script to run the guardian RLS migration
echo "Running guardian RLS migration..."

# Get Supabase URL and key from environment or use defaults
SUPABASE_URL=${SUPABASE_URL:-"rsvjnndhbyyxktbczlnk.supabase.co"}
SUPABASE_KEY=${SUPABASE_KEY:-"sbp_5846ad02afffcbddf30ff9a6b55798e54caa83ac"}

# Run the migration using PSQL or curl
if command -v psql &>/dev/null; then
  echo "Using PSQL to run migration..."
  PGPASSWORD=$SUPABASE_KEY psql -h $SUPABASE_URL -U postgres -d postgres -f supabase/migrations/20250505_fix_guardians_rls.sql
else
  echo "PSQL not found, using curl instead..."
  # Read the migration file
  MIGRATION=$(cat supabase/migrations/20250505_fix_guardians_rls.sql)
  
  # Execute using Supabase REST API
  curl -X POST "https://$SUPABASE_URL/rest/v1/rpc/exec_sql" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"$MIGRATION\"}"
fi

echo "Migration completed!"
