CREATE DATABASE IF NOT EXISTS campusplan
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE campusplan;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  student_id VARCHAR(50) NOT NULL,
  email VARCHAR(190) NOT NULL,
  institution VARCHAR(160) NOT NULL,
  program VARCHAR(120) NOT NULL,
  year_of_study VARCHAR(30) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_student_id (student_id),
  UNIQUE KEY uq_users_email (email)
);

CREATE TABLE IF NOT EXISTS assignments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  title VARCHAR(180) NOT NULL,
  course VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  due_date DATE NOT NULL,
  priority ENUM('High', 'Medium', 'Low') NOT NULL DEFAULT 'Medium',
  status ENUM('Not Started', 'In Progress', 'Completed') NOT NULL DEFAULT 'Not Started',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_assignments_user_due_date (user_id, due_date),
  CONSTRAINT fk_assignments_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
