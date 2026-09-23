USE campusplan;

CREATE TABLE IF NOT EXISTS tests (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  course VARCHAR(255) NOT NULL,
  description TEXT,
  test_date DATE NOT NULL,
  test_time TIME,
  room VARCHAR(255),
  status ENUM('Upcoming', 'Completed', 'Missed') NOT NULL DEFAULT 'Upcoming',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tests_user_date (user_id, test_date),
  CONSTRAINT fk_tests_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);