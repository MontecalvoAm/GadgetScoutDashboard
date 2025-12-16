const mysql = require('mysql2/promise');

const config = {
  host: '127.0.0.1',
  port: 6603,          // Using the port that worked for you earlier
  user: 'root',
  password: '12345',
  multipleStatements: true
};

const sql = `
  CREATE DATABASE IF NOT EXISTS dashboard;
  USE dashboard;

  -- 1. Status Table
  CREATE TABLE IF NOT EXISTS M_ReferenceTableStatus (
    ID INT NOT NULL PRIMARY KEY,
    StatusName VARCHAR(50) NOT NULL,
    StatusDescription VARCHAR(200),
    CreatedBy INT NOT NULL DEFAULT 1,
    CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  INSERT IGNORE INTO M_ReferenceTableStatus (ID, StatusName, StatusDescription) VALUES 
  (1, 'ACTIVE', 'Active'), (2, 'INACTIVE', 'Inactive');

  -- 2. Users Table
  CREATE TABLE IF NOT EXISTS M_Users (
    ID BIGINT NOT NULL PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    DisplayName VARCHAR(100),
    ProfilePictureURL VARCHAR(500),
    LastLogin TIMESTAMP NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedBy BIGINT NOT NULL DEFAULT 1,
    CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ModifiedBy BIGINT,
    ModifiedDate TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    ReferenceTableStatusID INT NOT NULL DEFAULT 1
  );

  -- 3. Roles Table
  CREATE TABLE IF NOT EXISTS M_Roles (
    ID BIGINT NOT NULL PRIMARY KEY,
    RoleName VARCHAR(50) NOT NULL UNIQUE,
    Description VARCHAR(200),
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedBy BIGINT NOT NULL DEFAULT 1,
    CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ReferenceTableStatusID INT NOT NULL DEFAULT 1
  );

  -- 4. User Roles Link
  CREATE TABLE IF NOT EXISTS M_UserRoles (
    ID BIGINT NOT NULL PRIMARY KEY,
    UserID BIGINT NOT NULL,
    RoleID BIGINT NOT NULL,
    CreatedBy BIGINT NOT NULL DEFAULT 1,
    CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ReferenceTableStatusID INT NOT NULL DEFAULT 1,
    UNIQUE KEY (UserID, RoleID)
  );

  -- 5. Navigation
  CREATE TABLE IF NOT EXISTS M_Navigation (
    ID BIGINT NOT NULL PRIMARY KEY,
    ParentID BIGINT NULL,
    NavName VARCHAR(100) NOT NULL,
    NavPath VARCHAR(200),
    IconClass VARCHAR(50),
    SortOrder INT DEFAULT 0,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedBy BIGINT NOT NULL DEFAULT 1,
    CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ReferenceTableStatusID INT NOT NULL DEFAULT 1
  );

  -- 6. Navigation Roles
  CREATE TABLE IF NOT EXISTS T_NavigationRoles (
    ID BIGINT NOT NULL PRIMARY KEY,
    NavigationID BIGINT NOT NULL,
    RoleID BIGINT NOT NULL,
    CanAccess BOOLEAN DEFAULT TRUE,
    CreatedBy BIGINT NOT NULL DEFAULT 1,
    CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ReferenceTableStatusID INT NOT NULL DEFAULT 1,
    UNIQUE KEY (NavigationID, RoleID)
  );

  -- 7. Customers
  CREATE TABLE IF NOT EXISTS M_Customers (
    ID BIGINT NOT NULL PRIMARY KEY,
    FacebookUserID VARCHAR(100) NOT NULL UNIQUE,
    DisplayName VARCHAR(200),
    FirstName VARCHAR(100),
    LastName VARCHAR(100),
    ProfilePictureURL VARCHAR(500),
    Gender VARCHAR(20),
    Locale VARCHAR(10),
    Timezone INT,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedBy BIGINT NOT NULL DEFAULT 1,
    CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ReferenceTableStatusID INT NOT NULL DEFAULT 1
  );

  -- 8. Conversations
  CREATE TABLE IF NOT EXISTS M_Conversations (
    ID BIGINT NOT NULL PRIMARY KEY,
    ConversationID VARCHAR(100) NOT NULL UNIQUE,
    CustomerID BIGINT NOT NULL,
    UserID BIGINT NULL,
    ConversationName VARCHAR(200),
    Status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    LastMessageTimestamp TIMESTAMP,
    LastMessageType VARCHAR(50),
    Priority VARCHAR(20) DEFAULT 'NORMAL',
    Tags JSON,
    Notes TEXT,
    CreatedBy BIGINT NOT NULL DEFAULT 1,
    CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ModifiedBy BIGINT,
    ModifiedDate TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    ReferenceTableStatusID INT NOT NULL DEFAULT 1
  );

  -- 9. Messages
  CREATE TABLE IF NOT EXISTS T_Messages (
    ID BIGINT NOT NULL PRIMARY KEY,
    MessageID VARCHAR(100) NOT NULL,
    ConversationID BIGINT NOT NULL,
    FacebookMessageID VARCHAR(100) NOT NULL UNIQUE,
    SenderType VARCHAR(50) NOT NULL,
    SenderID VARCHAR(100) NOT NULL,
    MessageContent TEXT,
    MessageType VARCHAR(50),
    AttachmentURL VARCHAR(500),
    AttachmentType VARCHAR(50),
    IsRead BOOLEAN DEFAULT FALSE,
    IsDelivered BOOLEAN DEFAULT FALSE,
    IsFromWebhook BOOLEAN DEFAULT TRUE,
    CreatedBy BIGINT NOT NULL DEFAULT 1,
    CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ModifiedBy BIGINT,
    ModifiedDate TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    ReferenceTableStatusID INT NOT NULL DEFAULT 1
  );

  -- 10. Audit Log
  CREATE TABLE IF NOT EXISTS T_AuditLog (
    ID BIGINT NOT NULL PRIMARY KEY,
    UserID BIGINT,
    Action VARCHAR(100) NOT NULL,
    TableName VARCHAR(100),
    RecordID VARCHAR(100),
    OldValues JSON,
    NewValues JSON,
    IPAddress VARCHAR(45),
    UserAgent TEXT,
    CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ReferenceTableStatusID INT NOT NULL DEFAULT 1
  );

  -- 11. Conversation Labels
  CREATE TABLE IF NOT EXISTS T_ConversationLabels (
    ID BIGINT NOT NULL PRIMARY KEY,
    ConversationID BIGINT NOT NULL,
    LabelName VARCHAR(100) NOT NULL,
    LabelColor VARCHAR(7),
    IsSystemLabel BOOLEAN DEFAULT FALSE,
    CreatedBy BIGINT NOT NULL DEFAULT 1,
    CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ReferenceTableStatusID INT NOT NULL DEFAULT 1
  );

  -- 12. Message Templates
  CREATE TABLE IF NOT EXISTS M_MessageTemplates (
    ID BIGINT NOT NULL PRIMARY KEY,
    TemplateName VARCHAR(200) NOT NULL,
    TemplateType VARCHAR(50),
    TemplateContent JSON NOT NULL,
    Category VARCHAR(100),
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedBy BIGINT NOT NULL DEFAULT 1,
    CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ModifiedBy BIGINT,
    ModifiedDate TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    ReferenceTableStatusID INT NOT NULL DEFAULT 1
  );

  -- 13. System Settings
  CREATE TABLE IF NOT EXISTS T_SystemSettings (
    ID BIGINT NOT NULL PRIMARY KEY,
    SettingGroup VARCHAR(100) NOT NULL,
    SettingKey VARCHAR(200) NOT NULL,
    SettingValue TEXT,
    SettingType VARCHAR(50),
    IsEncrypted BOOLEAN DEFAULT FALSE,
    Description VARCHAR(500),
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedBy BIGINT NOT NULL DEFAULT 1,
    CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ModifiedBy BIGINT,
    ModifiedDate TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    ReferenceTableStatusID INT NOT NULL DEFAULT 1
  );

  -- Default Data
  INSERT IGNORE INTO M_Users (ID, Username, Email, PasswordHash, DisplayName) VALUES 
  (1, 'admin', 'admin@dashboard.com', '$2b$12$hash', 'System Administrator');

  INSERT IGNORE INTO M_Roles (ID, RoleName, Description) VALUES 
  (1, 'SUPER_ADMIN', 'Full Access'), (2, 'EDITOR', 'Editor'), (3, 'VIEWER', 'Viewer');

  INSERT IGNORE INTO M_UserRoles (ID, UserID, RoleID) VALUES (1, 1, 1);
`;

async function setup() {
  try {
    const conn = await mysql.createConnection(config);
    console.log('✅ Connected. Creating tables...');
    await conn.query(sql);
    console.log('✅ SUCCESS! Linux database is ready.');
    await conn.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setup();
