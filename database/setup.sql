-- Complete Messenger Dashboard Setup for Port 6603
-- SQLYog Compatible - MariaDB

USE dashboard;

-- Create clean tables without foreign keys first
CREATE TABLE IF NOT EXISTS M_Users_New (
    ID INT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Email VARCHAR(255) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    DisplayName VARCHAR(100),
    Role VARCHAR(50) DEFAULT 'VIEWER',
    IsActive INT DEFAULT 1,
    LastLoginAt TIMESTAMP NULL DEFAULT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS M_Customers (
    ID INT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(255),
    Phone VARCHAR(20),
    LastContact TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS T_Conversations (
    ID INT PRIMARY KEY,
    CustomerID INT NOT NULL,
    Status VARCHAR(20) DEFAULT 'OPEN',
    Subject VARCHAR(255),
    Messages INT DEFAULT 0,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS T_Messages (
    ID INT PRIMARY KEY,
    ConversationID INT NOT NULL,
    Sender VARCHAR(50),
    Content TEXT,
    SentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert test data for immediate use
INSERT INTO M_Users_New (ID, Username, Email, Password, DisplayName, Role, IsActive) VALUES
(1, 'admin', 'admin@dashboard.com', '119728', 'System Admin', 'SUPER_ADMIN', 1),
(1000, 'aljon', 'aljon@dashboard.com', '119728', 'Aljon Super Admin', 'SUPER_ADMIN', 1)
ON DUPLICATE KEY UPDATE Role='SUPER_ADMIN';

INSERT INTO M_Customers (ID, Name, Email, Phone) VALUES
(1, 'John Smith', 'john@company.com', '+1234567890'),
(2, 'Jane Doe', 'jane@company.com', '+2234567890'),
(3, 'Mike Johnson', 'mike@company.com', '+3234567890'),
(4, 'Sarah Wilson', 'sarah@company.com', '+4234567890')
ON DUPLICATE KEY UPDATE Name=VALUES(Name);

INSERT INTO T_Conversations (ID, CustomerID, Status, Subject, Messages) VALUES
(1, 1, 'OPEN', 'Order Inquiry #12345', 3),
(2, 2, 'OPEN', 'Product Question - Returns', 5),
(3, 3, 'CLOSED', 'Support Resolved', 8),
(4, 4, 'OPEN', 'New Feature Request', 2)
ON DUPLICATE KEY UPDATE Status=VALUES(Status);

INSERT INTO T_Messages (ID, ConversationID, Sender, Content) VALUES
(1, 1, 'Customer', 'Hi, I need help with my order #12345'),
(2, 1, 'Agent', 'Hello! How can I assist you today?'),
(3, 1, 'Customer', 'The tracking number you provided is not working'),
(4, 2, 'Customer', 'Can I return the blue shirt?'),
(5, 2, 'Agent', 'Yes, you can return within 30 days with original receipt'),
(6, 3, 'Agent', 'Your issue has been resolved successfully'),
(7, 4, 'Customer', 'Would love to see dark mode added');

-- Verify everything is ready
SELECT 'MESSENGER DASHBOARD READY' AS STATUS;
SELECT 'Port: 6603, User: root, Database: dashboard' as CONFIG;

SELECT 'USERS:' AS TYPE, COUNT(*) AS COUNT FROM M_Users_New
UNION ALL
SELECT 'CUSTOMERS:' AS TYPE, COUNT(*) AS COUNT FROM M_Customers
UNION ALL
SELECT 'CONVERSATIONS:' AS TYPE, COUNT(*) AS COUNT FROM T_Conversations
UNION ALL
SELECT 'MESSAGES:' AS TYPE, COUNT(*) AS COUNT FROM T_Messages;

SELECT Username, Email, Role FROM M_Users_New ORDER BY ID;