-- Add authentication fields to existing tables
USE digital_hermit_community;

-- Add password field to users table
ALTER TABLE users ADD COLUMN password VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE users ADD COLUMN login_attempts INT DEFAULT 0;
ALTER TABLE users ADD COLUMN locked_until TIMESTAMP NULL DEFAULT NULL;

-- Add password field to user_profiles table (for enhanced users)
ALTER TABLE user_profiles ADD COLUMN password VARCHAR(255) DEFAULT NULL;
ALTER TABLE user_profiles ADD COLUMN last_login TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE user_profiles ADD COLUMN login_attempts INT DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN locked_until TIMESTAMP NULL DEFAULT NULL;

-- Create sessions table for session management
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id INT NOT NULL,
    user_type ENUM('basic', 'enhanced') NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create messages table for messaging system
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Show updated tables
SHOW TABLES;
