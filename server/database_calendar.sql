USE campusplan;

CREATE TABLE IF NOT EXISTS calendar_events (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME,
  event_end_time TIME,
  description TEXT,
  priority ENUM('High', 'Medium', 'Low') NOT NULL DEFAULT 'Medium',
  event_type ENUM('Personal', 'Study', 'Meeting', 'Other') NOT NULL DEFAULT 'Personal',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_calendar_events_user_date (user_id, event_date),
  CONSTRAINT fk_calendar_events_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);