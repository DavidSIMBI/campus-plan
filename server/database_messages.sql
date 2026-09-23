USE campusplan;

CREATE TABLE IF NOT EXISTS messages (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  sender_id INT UNSIGNED NOT NULL,
  receiver_id INT UNSIGNED NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_messages_sender_receiver (sender_id, receiver_id),
  KEY idx_messages_receiver_sender (receiver_id, sender_id),
  KEY idx_messages_created_at (created_at),
  CONSTRAINT fk_messages_sender
    FOREIGN KEY (sender_id) REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_messages_receiver
    FOREIGN KEY (receiver_id) REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);