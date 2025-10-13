-- Setup Demo Users with Passwords
-- Run this in phpMyAdmin SQL tab

USE digital_hermit_community;

-- Update Alex Chen's profile status to approved
UPDATE user_profiles SET status = 'approved' WHERE user_id = 11;

-- Add password to Alex Chen (users table)
UPDATE users SET password = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE id = 11;

-- Add password to Test User 1758457565
UPDATE users SET password = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE id = 10;

-- Show updated users
SELECT id, name, email, status, 
       CASE WHEN password IS NOT NULL THEN 'Yes' ELSE 'No' END as has_password
FROM users 
WHERE status = 'approved';

-- Show updated profiles
SELECT id, user_id, first_name, last_name, email, status,
       CASE WHEN password IS NOT NULL THEN 'Yes' ELSE 'No' END as has_password
FROM user_profiles 
WHERE status = 'approved';
