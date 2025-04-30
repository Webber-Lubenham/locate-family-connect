
-- Adjust OTP expiry time to 15 minutes (900 seconds) for enhanced security
UPDATE auth.config
SET config = jsonb_set(
  config,
  '{email_signin,otp_expiry_seconds}',
  '900'::jsonb
)
WHERE config->>'email_signin' IS NOT NULL;

-- Add comment explaining the security enhancement
COMMENT ON TABLE auth.config IS 'Auth configuration with OTP expiry set to 15 minutes for enhanced security.'; 
