-- Complete Messenger Dashboard Database Setup
-- MariaDB WSL - Port 6603 - Root/12345
-- SQLYog Compatible Commands

CREATE DATABASE IF NOT EXISTS dashboard;
USE dashboard;

-- Core Navigation Reference (required for testing)
CREATE TABLE IF NOT EXISTS M_Users (
    ID INT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Email VARCHAR(255) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    DisplayName VARCHAR(100),
    IsActive INT DEFAULT 1,
    LastLoginAt TIMESTAMP NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ReferenceTableStatusID INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS M_Roles (
    ID INT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL UNIQUE,
    Description VARCHAR(500),
    ReferenceTableStatusID INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS M_UserRoles (
    ID INT PRIMARY KEY,
    UserID INT NOT NULL,
    RoleID INT NOT NULL,
    CONSTRAINT fk_user_roles FOREIGN KEY (UserID) REFERENCES M_Users(ID),
    CONSTRAINT fk_role_roles FOREIGN KEY (RoleID) REFERENCES M_Roles(ID),
    UNIQUE KEY unique_user_role (UserID, RoleID)
);

-- Master Data for Messenger
CREATE TABLE IF NOT EXISTS M_Pages (
    ID INT PRIMARY KEY,
    FacebookPageID VARCHAR(100) NOT NULL UNIQUE,
    PageName VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS M_Customers (
    ID INT PRIMARY KEY,
    FacebookPSID VARCHAR(200) NOT NULL UNIQUE,
    FirstName VARCHAR(100),
    LastName VARCHAR(100),
    FullName VARCHAR(300),
    Email VARCHAR(255),
    IsActive INT DEFAULT 1,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS T_Conversations (
    ID INT PRIMARY KEY,
    FacebookConversationID VARCHAR(200) NOT NULL UNIQUE,
    CustomerID INT NOT NULL,
    Status ENUM('OPEN', 'CLOSED', 'PENDING') DEFAULT 'OPEN',
    Priority ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM',
    Subject VARCHAR(255),
    FirstMessageAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LastMessageAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_customer FOREIGN KEY (CustomerID) REFERENCES M_Customers(ID)
);

CREATE TABLE IF NOT EXISTS T_Messages (
    ID INT PRIMARY KEY,
    ConversationID INT NOT NULL,
    SenderType ENUM('CUSTOMER', 'AGENT') NOT NULL,
    Content TEXT,
    SentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conversation FOREIGN KEY (ConversationID) REFERENCES T_Conversations(ID)
);

-- Insert test data with explicit IDs for manual testing
INSERT IGNORE INTO M_Users (ID, Username, Email, Password, DisplayName, IsActive) VALUES
(1, 'admin', 'admin@dashboard.com', '119728', 'System Admin', 1),
(2, 'claude', 'claude@dashboard.com', '119728', 'Claude Admin', 1),
(1000, 'aljon', 'aljon@dashboard.com', '119728', 'Aljon Super Admin', 1);

INSERT IGNORE INTO M_Roles (ID, Name, Description, ReferenceTableStatusID) VALUES
(1, 'SUPER_ADMIN', 'Full system access', 1),
(2, 'ADMIN', 'Standard administrative access', 1),
(3, 'VIEWER', 'Read-only access', 1);

INSERT IGNORE INTO M_UserRoles (ID, UserID, RoleID) VALUES
(1, 1, 1),
(2, 2, 2),
(3, 1000, 1);

-- Insert test customers
INSERT IGNORE INTO M_Pages (ID, FacebookPageID, PageName) VALUES
(1, 'test_page_001', 'Test Store Page');

INSERT IGNORE INTO M_Customers (ID, FacebookPSID, FirstName, LastName, FullName) VALUES
(1, 'PSID_CUSTOMER_001', 'John', 'Doe', 'John Doe'),
(2, 'PSID_CUSTOMER_002', 'Jane', 'Smith', 'Jane Smith'),
(3, 'PSID_CUSTOMER_003', 'Mike', 'Johnson', 'Mike Johnson');

INSERT IGNORE INTO T_Conversations (ID, FacebookConversationID, CustomerID, Status, Subject) VALUES
(1, 'CONV_001', 1, 'OPEN', 'Order Inquiry'),
(2, 'CONV_002', 2, 'OPEN', 'Product Question'),
(3, 'CONV_003', 3, 'CLOSED', 'Resolved Support');

INSERT IGNORE INTO T_Messages (ID, ConversationID, SenderType, Content) VALUES
(1, 1, 'CUSTOMER', 'Hi, I have a question about my order'),
(2, 1, 'AGENT', 'Hello! How can I help you today?'),
(3, 2, 'CUSTOMER', 'What colors are available for this product?'),
(4, 3, 'CUSTOMER', 'Thank you for resolving my issue');

-- Verify data
SELECT '=== CONFIGURATION TEST ===' AS Test;
SELECT 'WSL MariaDB port:' AS Setting, 6603 AS Value;
SELECT 'Connection user:' AS Setting, 'root@127.0.0.1' AS Value;
SELECT 'Database:' AS Setting, 'dashboard' AS Value;

SELECT '=== DATA VERIFICATION ===';
SELECT COUNT(*) AS users_count FROM M_Users;
SELECT COUNT(*) AS roles_count FROM M_Roles;
SELECT COUNT(*) AS customers_count FROM M_Customers;
SELECT COUNT(*) AS conversations_count FROM T_Conversations;
SELECT COUNT(*) AS messages_count FROM T_Messages;

SELECT '=== SAMPLE DATA ===';
SELECT u.Username, u.Email, r.Name as Role
FROM M_Users u
JOIN M_UserRoles ur ON u.ID = ur.UserID
JOIN M_Roles r ON ur.RoleID = r.ID;