-- TODO Please use our contact_table from https://github.com/circles-zone/contact-main-local-python-package/blob/dev/contact-main-local-python-package/database/mysql/schema/contact_table.sql and delete setup-db.sql from the repo.

CREATE DATABASE IF NOT EXISTS contacts_db;
USE contacts_db;

CREATE TABLE IF NOT EXISTS contact_table (
  contact_id INT AUTO_INCREMENT PRIMARY KEY,
  account_name VARCHAR(255) NOT NULL,
  uploaded_timestamp VARCHAR(255) NOT NULL
);

INSERT INTO contact_table (account_name, uploaded_timestamp) VALUES 
('ישראל כהן', 'israel@example.com'),
('שרה לוי', 'sara@example.com'),
('דוד אברהם', 'david@example.com');
