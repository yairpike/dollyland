-- Update auth configuration to set secure OTP expiry
-- This sets OTP expiry to 1 hour (3600 seconds) which is within recommended limits
UPDATE auth.config 
SET 
  otp_expiry = 3600,
  sms_otp_expiry = 3600
WHERE TRUE;