SET FOREIGN_KEY_CHECKS = 0;
-- Simplified Messenger Dashboard Setup
-- Port 6603 - Root:12345 - SQLYog Ready

USE dashboard;

-- Core Users Table (Updated for dashboard)
DROP TABLE IF EXISTS M_Users;
CREATE TABLE M_Users (
    ID INT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Email VARCHAR(255) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    DisplayName VARCHAR(100),
    Role VARCHAR(50) DEFAULT 'VIEWER',
    IsActive INT DEFAULT 1,
    LastLoginAt TIMESTAMP NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ReferenceTableStatusID INT DEFAULT 1
);

-- Messenger Core
DROP TABLE IF EXISTS M_Customers;
CREATE TABLE M_Customers (
    ID INT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(255),
    Phone VARCHAR(20),
    IsActive INT DEFAULT 1,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS T_Conversations;
CREATE TABLE T_Conversations (
    ID INT PRIMARY KEY,
    CustomerID INT NOT NULL,
    Status VARCHAR(20) DEFAULT 'OPEN',
    Subject VARCHAR(255),
    Messages INT DEFAULT 0,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS T_Messages;
CREATE TABLE T_Messages (
    ID INT PRIMARY KEY,
    ConversationID INT NOT NULL,
    Sender VARCHAR(50),
    Content TEXT,
    SentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert important test data
INSERT INTO M_Users (ID, Username, Email, Password, DisplayName, Role, IsActive) VALUES
(1, 'admin', 'admin@dashboard.com', '119728', 'System Admin', 'SUPER_ADMIN', 1),
(1000, 'aljon', 'aljon@dashboard.com', '119728', 'Aljon Super Admin', 'SUPER_ADMIN', 1);

INSERT INTO M_Customers (ID, Name, Email) VALUES
(1, 'John Doe', 'john@example.com'),
(2, 'Jane Smith', 'jane@example.com'),
(3, 'Mike Johnson', 'mike@example.com');

INSERT INTO T_Conversations (ID, CustomerID, Status, Subject, Messages) VALUES
(1, 1, 'OPEN', 'Order Inquiry', 5),
(2, 2, 'OPEN', 'Product Question', 3),
(3, 3, 'CLOSED', 'Support Resolved', 8);

INSERT INTO T_Messages (ID, ConversationID, Sender, Content) VALUES
(1, 1, 'Customer', 'Hi, I need help with my order'),
(2, 1, 'Agent', 'Hello! How can I assist you today?'),
(3, 2, 'Customer', 'What colors are available?'),
(4, 3, 'Customer', 'Thank you for the help!'),
(5, 3, 'Agent', 'You're welcome! Let us know if you need anything else.');

-- Verify setup
SELECT '=== DATABASE READY ===' AS Status;
SELECT 'Port: 6603' AS Config, 'User: root' AS Connection, 'Database: dashboard' AS DBName;
SELECT "Users:" AS Entity, COUNT(*) AS Count FROM M_Users
UNION ALL
SELECT "Customers:" AS Entity, COUNT(*) AS Count FROM M_Customers
UNION ALL
SELECT "Conversations:" AS Entity, COUNT(*) AS Count FROM T_Conversations
UNION ALL
SELECT "Messages:" AS Entity, COUNT(*) AS Count FROM T_Messages;

SELECT '=== USER CREDENTIALS ===';
SELECT Username, Email, Role FROM M_Users ORDER BY ID;