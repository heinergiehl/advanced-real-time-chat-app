CREATE USER IF NOT EXISTS 'myappuser'@'%' IDENTIFIED WITH caching_sha2_password BY 'myapppassword';
GRANT ALL PRIVILEGES ON *.* TO 'myappuser'@'%';
FLUSH PRIVILEGES;