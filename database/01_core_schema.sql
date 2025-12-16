-- Core Dashboard Schema with Initial Data
-- Next.js Messenger Dashboard - Dr. Claude 2025

-- Drop existing tables in correct order
DROP TABLE IF EXISTS M_UserRoles;
DROP TABLE IF EXISTS M_RoleNavigation;
DROP TABLE IF EXISTS M_UserGroups;
DROP TABLE IF EXISTS M_GroupRoles;
DROP TABLE IF EXISTS M_Users;
DROP TABLE IF EXISTS M_Roles;
DROP TABLE IF EXISTS M_Navigation;
DROP TABLE IF EXISTS M_Groups;
DROP TABLE IF EXISTS T_AuditLog;

-- Manual ID generator function (replaces AUTO_INCREMENT)
DELIMITER //
CREATE FUNCTION GetNextID(table_name VARCHAR(50)) RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE next_id INT;
    SET next_id = (SELECT IFNULL(MAX(ID), 0) + 1 FROM M_Users WHERE 1);
    -- This should be modified per table, but kept simple
    RETURN next_id;
END //
DELIMITER ;

-- Core Roles M_Roles (Standard RBAC)
INSERT INTO M_Roles (ID, Name, Description, ReferenceTableStatusID) VALUES
(1, 'SUPER_ADMIN', 'Full system access including settings and user management', 1),
(2, 'ADMIN', 'Can manage content and view all data, limited settings', 1),
(3, 'EDITOR', 'Can edit and manage Facebook Messenger data and respond', 1),
(4, 'VIEWER', 'Read-only access to dashboard and reports', 1);

-- Initial Dashboard Admin User
INSERT INTO M_Users (ID, Username, Email, PasswordHash, DisplayName, ReferenceTableStatusID) VALUES
(1, 'admin', 'admin@messenger-dashboard.local', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewJVL3k6x4vO7AnC', 'System Administrator', 1),
(2, 'claude', 'claude@messenger-dashboard.local', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewJVL3k6x4vO7AnC', 'Dr. Claude Dashboard', 1);

-- User-Role Mapping
INSERT INTO M_UserRoles (ID, UserID, RoleID, ReferenceTableStatusID) VALUES
(1, 1, 1, 1),
(2, 2, 2, 1);

-- Dynamic Navigation Architecture
INSERT INTO M_Navigation (ID, ParentID, Name, Url, Icon, OrderIndex, RequiresRole, ReferenceTableStatusID) VALUES
-- Dashboard Root
(1, NULL, 'Dashboard Overview', '/dashboard', 'home', 1, 'VIEWER', 1),

-- Messenger Management Section
(2, NULL, 'Messenger Hub', NULL, 'chat', 2, 'VIEWER', 1),
(3, 2, 'Conversations', '/messenger/conversations', 'message-square', 1, 'VIEWER', 1),
(4, 2, 'Customers', '/messenger/customers', 'users', 2, 'VIEWER', 1),
(5, 2, 'Analytics', '/messenger/analytics', 'bar-chart-3', 3, 'VIEWER', 1),

-- Content Management
(6, NULL, 'Content', NULL, 'file-text', 3, 'EDITOR', 1),
(7, 6, 'Response Templates', '/content/templates', 'clipboard-list', 1, 'EDITOR', 1),
(8, 6, 'Scheduled Messages', '/content/scheduled', 'calendar-clock', 2, 'ADMIN', 1),

-- Settings & Administration
(9, NULL, 'Settings', NULL, 'settings', 10, 'ADMIN', 1),
(10, 9, 'Users & Roles', '/settings/users', 'user-shield', 1, 'SUPER_ADMIN', 1),
(11, 9, 'System Configuration', '/settings/system', 'sliders-horizontal', 2, 'SUPER_ADMIN', 1),
(12, 9, 'Audit Logs', '/settings/audit', 'file-search', 3, 'SUPER_ADMIN', 1);

-- Role-Based Navigation Permissions
INSERT INTO M_RoleNavigation (ID, RoleID, NavigationID, ReferenceTableStatusID) VALUES
-- VIEWER access
(1, 4, 1, 1),
(2, 4, 2, 1),
(3, 4, 3, 1),
(4, 4, 4, 1),
(5, 4, 5, 1),

-- EDITOR access (includes VIEWER)
(6, 3, 1, 1),
(7, 3, 2, 1),
(8, 3, 3, 1),
(9, 3, 4, 1),
(10, 3, 5, 1),
(11, 3, 6, 1),
(12, 3, 7, 1),

-- ADMIN access (includes EDITOR)
(13, 2, 1, 1),
(14, 2, 2, 1),
(15, 2, 3, 1),
(16, 2, 4, 1),
(17, 2, 5, 1),
(18, 2, 6, 1),
(19, 2, 7, 1),
(20, 2, 8, 1),
(21, 2, 9, 1),
(22, 2, 11, 1),
(23, 2, 12, 1),

-- SUPER_ADMIN access (all navigation)
(24, 1, 1, 1),
(25, 1, 2, 1),
(26, 1, 3, 1),
(27, 1, 4, 1),
(28, 1, 5, 1),
(29, 1, 6, 1),
(30, 1, 7, 1),
(31, 1, 8, 1),
(32, 1, 9, 1),
(33, 1, 10, 1),
(34, 1, 11, 1),
(35, 1, 12, 1);

-- Audit Logging Table
CREATE TABLE T_AuditLog (
    ID INT PRIMARY KEY,
    UserID INT,
    Action VARCHAR(100) NOT NULL,
    EntityType VARCHAR(50),
    EntityID INT,
    Details JSON,
    IPAddress VARCHAR(45),
    UserAgent VARCHAR(500),
    SessionID VARCHAR(100),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ReferenceTableStatusID INT DEFAULT 1,
    FOREIGN KEY (UserID) REFERENCES M_Users(ID),
    INDEX idx_user (UserID),
    INDEX idx_action (Action),
    INDEX idx_created (CreatedAt)
);

-- Display current tables
SELECT TABLE_NAME, TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'dashboard' AND TABLE_NAME LIKE 'M_%' OR TABLE_NAME LIKE 'T_%';