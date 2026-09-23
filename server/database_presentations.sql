USE campusplan;

CREATE TABLE IF NOT EXISTS presentations (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  course VARCHAR(255) NOT NULL,
  description TEXT,
  presentation_date DATE NOT NULL,
  group_name VARCHAR(255),
  my_part TEXT,
  status ENUM('Not Started', 'Preparing', 'Ready', 'Completed') NOT NULL DEFAULT 'Not Started',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_presentations_user_date (user_id, presentation_date),
  CONSTRAINT fk_presentations_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);