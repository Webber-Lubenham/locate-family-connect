-- Adjust OTP expiry time to 15 minutes (900 seconds)
UPDATE auth.flow_state
SET otp_send_interval = interval '15 minutes'
WHERE otp_send_interval > interval '1 hour';

-- Update configuration for new OTPs
ALTER TABLE auth.flow_state
ALTER COLUMN otp_send_interval SET DEFAULT interval '15 minutes';

-- Add comment explaining the security enhancement
COMMENT ON COLUMN auth.flow_state.otp_send_interval IS 'OTP expiry time set to 15 minutes for enhanced security.';

-- Update auth settings to use 15-minute OTP expiry
UPDATE auth.config
SET config = jsonb_set(
  config,
  '{email_signin,otp_expiry_seconds}',
  '900'::jsonb
)
WHERE config->>'email_signin' IS NOT NULL;

-- Add comment explaining the security enhancement
COMMENT ON TABLE auth.config IS 'Auth configuration with OTP expiry set to 15 minutes for enhanced security.'; 