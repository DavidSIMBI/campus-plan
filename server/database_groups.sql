USE campusplan;

CREATE TABLE IF NOT EXISTS `groups` (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  course VARCHAR(160) NOT NULL,
  group_type VARCHAR(60) NOT NULL DEFAULT 'Study Group',
  created_by INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_groups_created_by (created_by),
  CONSTRAINT fk_groups_created_by
    FOREIGN KEY (created_by) REFERENCES users (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS group_members (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  group_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  role ENUM('admin', 'member') NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_group_members_group_user (group_id, user_id),
  KEY idx_group_members_user_group (user_id, group_id),
  CONSTRAINT fk_group_members_group
    FOREIGN KEY (group_id) REFERENCES `groups` (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_group_members_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS group_messages (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  group_id INT UNSIGNED NOT NULL,
  sender_id INT UNSIGNED NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_group_messages_group_created (group_id, created_at, id),
  KEY idx_group_messages_sender (sender_id),
  CONSTRAINT fk_group_messages_group
    FOREIGN KEY (group_id) REFERENCES `groups` (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_group_messages_sender
    FOREIGN KEY (sender_id) REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS group_message_reads (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  message_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  read_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_group_message_reads_message_user (message_id, user_id),
  KEY idx_group_message_reads_user_message (user_id, message_id),
  CONSTRAINT fk_group_message_reads_message
    FOREIGN KEY (message_id) REFERENCES group_messages (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_group_message_reads_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
