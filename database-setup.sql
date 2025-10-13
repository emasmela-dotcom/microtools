-- Digital Hermit Community Platform Database Setup
-- Run this in phpMyAdmin or MySQL command line

-- Create database
CREATE DATABASE IF NOT EXISTS digital_hermit_community;
USE digital_hermit_community;

-- Users table for basic signups
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    message TEXT,
    source VARCHAR(50) DEFAULT 'landing_page',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'
);

-- Enhanced profiles table for detailed signups
CREATE TABLE IF NOT EXISTS user_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    age VARCHAR(20),
    location VARCHAR(255),
    bio TEXT,
    tech_interests TEXT,
    mindfulness_practices TEXT,
    work_style VARCHAR(50),
    hobbies TEXT,
    connection_type VARCHAR(50),
    privacy_level VARCHAR(20) DEFAULT 'public',
    newsletter BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User interests table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS user_interests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_profile_id INT NOT NULL,
    interest VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_profile_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_interest (user_profile_id, interest)
);

-- Connection requests table
CREATE TABLE IF NOT EXISTS connection_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_user_id INT NOT NULL,
    to_user_id INT NOT NULL,
    from_user_name VARCHAR(255) NOT NULL,
    to_user_name VARCHAR(255) NOT NULL,
    message TEXT,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Connections table (accepted connections)
CREATE TABLE IF NOT EXISTS connections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    connection_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user1_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_connection (user1_id, user2_id)
);

-- Insert some sample interests
INSERT INTO user_interests (user_profile_id, interest) VALUES
(1, 'programming'),
(1, 'design'),
(1, 'writing'),
(2, 'photography'),
(2, 'music'),
(2, 'outdoor');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_location ON user_profiles(location);
CREATE INDEX idx_user_profiles_work_style ON user_profiles(work_style);
CREATE INDEX idx_user_profiles_connection_type ON user_profiles(connection_type);
CREATE INDEX idx_user_interests_interest ON user_interests(interest);
CREATE INDEX idx_connection_requests_status ON connection_requests(status);
CREATE INDEX idx_connections_user1 ON connections(user1_id);
CREATE INDEX idx_connections_user2 ON connections(user2_id);

-- Show tables
SHOW TABLES;