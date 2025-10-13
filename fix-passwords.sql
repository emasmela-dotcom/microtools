-- Fix Password Hashes
-- Run this in phpMyAdmin SQL tab

USE digital_hermit_community;

-- Update Alex Chen's password (proper hash for 'password123')
UPDATE users SET password = '$2y$10$12WU66unI8WhGHn7WXyLgOB.9WttmAswWy5sAiGhvtwWrar/TmyCe' WHERE id = 11;

-- Update Test User's password (proper hash for 'test123')
UPDATE users SET password = '$2y$10$J7540Bg1drcSqcxwNwWli.JLXwnbvND/ykCUirqJEzT.cHBrFHkQW' WHERE id = 10;

-- Verify the updates
SELECT id, name, email, status, 
       CASE WHEN password IS NOT NULL THEN 'Yes' ELSE 'No' END as has_password
FROM users 
WHERE id IN (10, 11);
