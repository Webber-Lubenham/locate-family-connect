
// Script to apply the parent access fix migration
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Path to migration file
const migrationFile = path.resolve(__dirname, '../supabase/migrations/20250506_fix_parent_access.sql');

// Check if the file exists
if (!fs.existsSync(migrationFile)) {
  console.error('Migration file not found:', migrationFile);
  process.exit(1);
}

// Read the migration SQL
const migrationSQL = fs.readFileSync(migrationFile, 'utf-8');

console.log('Applying parent access fix migration...');

try {
  // Using supabase CLI to run the SQL
  execSync(`supabase db execute --file ${migrationFile}`, { stdio: 'inherit' });
  console.log('Migration successfully applied!');
} catch (error) {
  console.error('Failed to apply migration:', error.message);
  console.log('You may need to run this SQL manually in the Supabase dashboard.');
  process.exit(1);
}
