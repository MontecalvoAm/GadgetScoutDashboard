-- Facebook Messenger Integration Schema
-- Follows M_ (Master) and T_ (Transactional) naming conventions
-- Next.js Messenger Dashboard - Dr. Claude 2025

-- Master Data Tables for Facebook Entities

-- Facebook Pages Master Data
CREATE TABLE M_Pages (
    ID INT PRIMARY KEY,
    FacebookPageID VARCHAR(100) NOT NULL UNIQUE,
    PageName VARCHAR(255) NOT NULL,
    PageAccessToken TEXT,
    Category VARCHAR(100),
    FollowerCount INT DEFAULT 0,
    ProfilePictureURL VARCHAR(500),
    CoverPhotoURL VARCHAR(500),
    IsVerified BOOLEAN DEFAULT FALSE,
    IsActive INT DEFAULT 1,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ReferenceTableStatusID INT DEFAULT 1,
    INDEX idx_facebook_id (FacebookPageID),
    INDEX idx_active (IsActive),
    INDEX idx_created (CreatedAt)
);

-- Facebook Customers/Customers Master Data
CREATE TABLE M_Customers (
    ID INT PRIMARY KEY,
    FacebookPSID VARCHAR(200) NOT NULL UNIQUE,
    FirstName VARCHAR(100),
    LastName VARCHAR(100),
    FullName VARCHAR(255) GENERATED ALWAYS AS (CONCAT(FirstName, ' ', LastName)) STORED,
    ProfilePictureURL VARCHAR(500),
    Locale VARCHAR(10) DEFAULT 'en_US',
    Gender VARCHAR(20),
    Email VARCHAR(255),
    Phone VARCHAR(50),
    IsSubscribed BOOLEAN DEFAULT TRUE,
    LastSeenAt TIMESTAMP NULL,
    Source VARCHAR(50) DEFAULT 'MESSENGER',
    Tags JSON,
    ProfileData JSON,
    IsActive INT DEFAULT 1,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ReferenceTableStatusID INT DEFAULT 1,
    INDEX idx_facebook_psid (FacebookPSID),
    INDEX idx_email (Email),
    INDEX idx_active (IsActive),
    INDEX idx_lastseen (LastSeenAt)
);

-- Agent Master Data (Human Agents)
CREATE TABLE M_Agents (
    ID INT PRIMARY KEY,
    UserID INT,
    AgentCode VARCHAR(20) UNIQUE NOT NULL,
    DisplayName VARCHAR(100) NOT NULL,
    ProfilePicture VARCHAR(500),
    Expertise VARCHAR(255),
    AvailabilityStatus ENUM('ONLINE', 'OFFLINE', 'BUSY', 'AWAY') DEFAULT 'OFFLINE',
    MaxConcurrentChats INT DEFAULT 5,
    Phone VARCHAR(50),
    WorkingHours JSON,
    IsActive INT DEFAULT 1,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ReferenceTableStatusID INT DEFAULT 1,
    FOREIGN KEY (UserID) REFERENCES M_Users(ID),
    INDEX idx_userid (UserID),
    INDEX idx_agentcode (AgentCode),
    INDEX idx_status (AvailabilityStatus)
);

-- Message Templates Master Data
CREATE TABLE M_MessageTemplates (
    ID INT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL UNIQUE,
    TemplateID VARCHAR(50),
    Category VARCHAR(50),
    Language VARCHAR(10),
    ContentStructure JSON,
    Variables JSON,
    IsActive INT DEFAULT 1,
    CreatedBy INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ReferenceTableStatusID INT DEFAULT 1,
    FOREIGN KEY (CreatedBy) REFERENCES M_Users(ID),
    INDEX idx_name (Name),
    INDEX idx_category (Category),
    INDEX idx_language (Language)
);

-- Campaign Master Data (Broadcasts)
CREATE TABLE M_Campaigns (
    ID INT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Description TEXT,
    CampaignType ENUM('BROADCAST', 'SCHEDULED', 'DRIP') DEFAULT 'BROADCAST',
    TargetAudienceFilter JSON,
    MessageTemplateID INT,
    ScheduleTime TIMESTAMP NULL,
    Status ENUM('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'FAILED') DEFAULT 'DRAFT',
    CreatedBy INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ReferenceTableStatusID INT DEFAULT 1,
    FOREIGN KEY (MessageTemplateID) REFERENCES M_MessageTemplates(ID),
    FOREIGN KEY (CreatedBy) REFERENCES M_Users(ID),
    INDEX idx_status (Status),
    INDEX idx_schedule (ScheduleTime)
);

-- Transactional Data Tables

-- Conversations (Thread Level)
CREATE TABLE T_Conversations (
    ID INT PRIMARY KEY,
    FacebookConversationID VARCHAR(200) NOT NULL,
    CustomerID INT NOT NULL,
    PageID INT NOT NULL,
    Status ENUM('OPEN', 'CLOSED', 'ARCHIVED', 'PENDING') DEFAULT 'OPEN',
    Priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
    AssignedAgentID INT,
    Channel ENUM('MESSENGER', 'INSTAGRAM', 'WHATSAPP') DEFAULT 'MESSENGER',
    Subject VARCHAR(255),
    Summary TEXT,
    Tags JSON,
    Metadata JSON,
    FirstMessageAt TIMESTAMP,
    LastMessageAt TIMESTAMP,
    ResolvedAt TIMESTAMP NULL,
    Satisfied BOOLEAN DEFAULT NULL,
    ReferenceTableStatusID INT DEFAULT 1,
    FOREIGN KEY (CustomerID) REFERENCES M_Customers(ID),
    FOREIGN KEY (PageID) REFERENCES M_Pages(ID),
    FOREIGN KEY (AssignedAgentID) REFERENCES M_Agents(ID),
    INDEX idx_facebook_conv (FacebookConversationID),
    INDEX idx_customer (CustomerID),
    INDEX idx_status (Status),
    INDEX idx_agent (AssignedAgentID),
    INDEX idx_last_msg (LastMessageAt)
);

-- Individual Messages
CREATE TABLE T_Messages (
    ID INT PRIMARY KEY,
    FacebookMessageID VARCHAR(200) NOT NULL UNIQUE,
    ConversationID INT NOT NULL,
    SenderType ENUM('CUSTOMER', 'AGENT', 'BOT') NOT NULL,
    SenderID INT, -- Points to either M_Customers or M_Agents based on SenderType
    Content TEXT,
    MessageType ENUM('TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'STICKER', 'FILE', 'QUICK_REPLY', 'TEMPLATE') DEFAULT 'TEXT',
    MediaURL VARCHAR(500),
    MediaContentType VARCHAR(50),
    MessageData JSON,
    ReplyToMessageID INT,
    SentAt TIMESTAMP,
    DeliveredAt TIMESTAMP NULL,
    ReadAt TIMESTAMP NULL,
    Reactions JSON,
    QuickReplies JSON,
    Buttons JSON,
    IsEcho BOOLEAN DEFAULT FALSE,
    ReferenceTableStatusID INT DEFAULT 1,
    FOREIGN KEY (ConversationID) REFERENCES T_Conversations(ID),
    FOREIGN KEY (ReplyToMessageID) REFERENCES T_Messages(ID),
    INDEX idx_facebook_msg (FacebookMessageID),
    INDEX idx_conversation (ConversationID),
    INDEX idx_sender_type (SenderType, SenderID),
    INDEX idx_sent (SentAt),
    INDEX idx_status_read (ReadAt)
);

-- Quick Responses/Reactions
CREATE TABLE T_QuickResponses (
    ID INT PRIMARY KEY,
    ResponseKey VARCHAR(100) NOT NULL,
    Content TEXT NOT NULL,
    AssociatedPageID INT,
    Triggers JSON,
    Category VARCHAR(50),
    UsageCount INT DEFAULT 0,
    LastUsedAt TIMESTAMP NULL,
    IsActive INT DEFAULT 1,
    CreatedBy INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ReferenceTableStatusID INT DEFAULT 1,
    FOREIGN KEY (AssociatedPageID) REFERENCES M_Pages(ID),
    FOREIGN KEY (CreatedBy) REFERENCES M_Users(ID),
    INDEX idx_key (ResponseKey),
    INDEX idx_page (AssociatedPageID),
    INDEX idx_category (Category)
);

-- Agent Actions and Notes
CREATE TABLE T_AgentActions (
    ID INT PRIMARY KEY,
    AgentID INT NOT NULL,
    ConversationID INT,
    ActionType ENUM('REPLY', 'CLOSED', 'REOPENED', 'ASSIGNED', 'TRANSFERRED', 'NOTED') NOT NULL,
    Details TEXT,
    Duration INT, -- in seconds
    Effectiveness ENUM('POSITIVE', 'NEUTRAL', 'NEGATIVE') DEFAULT 'NEUTRAL',
    ReferenceTableStatusID INT DEFAULT 1,
    FOREIGN KEY (AgentID) REFERENCES M_Agents(ID),
    FOREIGN KEY (ConversationID) REFERENCES T_Conversations(ID),
    INDEX idx_agent (AgentID),
    INDEX idx_conversation (ConversationID),
    INDEX idx_action (ActionType)
);

-- Customer Satisfaction/Feedback
CREATE TABLE T_Feedback (
    ID INT PRIMARY KEY,
    ConversationID INT NOT NULL,
    CustomerID INT NOT NULL,
    Rating ENUM('1', '2', '3', '4', '5') NOT NULL,
    Comment TEXT,
    Category ENUM('RESPONSE_TIME', 'AGENT_HELPFULNESS', 'OVERALL_EXPERIENCE', 'OTHER'),
    FollowingConversation BOOLEAN DEFAULT FALSE,
    ReferenceTableStatusID INT DEFAULT 1,
    FOREIGN KEY (ConversationID) REFERENCES T_Conversations(ID),
    FOREIGN KEY (CustomerID) REFERENCES M_Customers(ID),
    INDEX idx_conversation (ConversationID),
    INDEX idx_customer (CustomerID),
    INDEX idx_rating (Rating)
);

-- Message Attachments
CREATE TABLE T_MessageAttachments (
    ID INT PRIMARY KEY,
    MessageID INT NOT NULL,
    AttachmentType ENUM('IMAGE', 'VIDEO', 'AUDIO', 'FILE', 'LOCATION') NOT NULL,
    FileName VARCHAR(255),
    FileSize INT,
    URL VARCHAR(500) NOT NULL,
    MIMEType VARCHAR(50),
    ThumbnailURL VARCHAR(500),
    Metadata JSON,
    ReferenceTableStatusID INT DEFAULT 1,
    FOREIGN KEY (MessageID) REFERENCES T_Messages(ID),
    INDEX idx_message (MessageID),
    INDEX idx_type (AttachmentType)
);

-- Quick Insert Functions for Manual Data Loading

-- Insert customers manually (for testing)
DELIMITER //
CREATE PROCEDURE InsertCustomer(
    IN fb_psid VARCHAR(200),
    IN first_name VARCHAR(100),
    IN last_name VARCHAR(100),
    IN email VARCHAR(255),
    IN phone VARCHAR(50)
)
BEGIN
    DECLARE next_id INT;
    SET next_id = (SELECT IFNULL(MAX(ID), 0) + 1 FROM M_Customers);

    INSERT INTO M_Customers (
        ID, FacebookPSID, FirstName, LastName, Email, Phone, ReferenceTableStatusID
    ) VALUES (
        next_id, fb_psid, first_name, last_name, email, phone, 1
    );
END //

-- Insert conversations manually
CREATE PROCEDURE InsertConversation(
    IN fb_conversation_id VARCHAR(200),
    IN customer_fb_id VARCHAR(200),
    IN subject VARCHAR(255),
    IN message_content TEXT
)
BEGIN
    DECLARE customer_id INT;
    DECLARE conversation_id INT;
    DECLARE page_id INT;

    -- Get customer ID
    SELECT ID INTO customer_id FROM M_Customers WHERE FacebookPSID = customer_fb_id LIMIT 1;

    -- Assume page_id = 1 for single page setup
    SET page_id = 1;

    -- Generate conversation ID
    SET conversation_id = (SELECT IFNULL(MAX(ID), 0) + 1 FROM T_Conversations);

    -- Insert conversation
    INSERT INTO T_Conversations (
        ID, FacebookConversationID, CustomerID, PageID, Subject, Summary,
        FirstMessageAt, LastMessageAt, ReferenceTableStatusID
    ) VALUES (
        conversation_id, fb_conversation_id, customer_id, page_id, subject, message_content,
        NOW(), NOW(), 1
    );

    -- Insert initial message
    DECLARE message_id INT;
    SET message_id = (SELECT IFNULL(MAX(ID), 0) + 1 FROM T_Messages);

    INSERT INTO T_Messages (
        ID, FacebookMessageID, ConversationID, SenderType, Content,
        SentAt, ReferenceTableStatusID
    ) VALUES (
        message_id, CONCAT(fb_conversation_id, '_1'), conversation_id, 'CUSTOMER',
        message_content, NOW(), 1
    );
END //
DELIMITER ;

-- Index optimizations for messenger queries
CREATE INDEX idx_conversations_customer_status ON T_Conversations(CustomerID, Status);
CREATE INDEX idx_conversations_last_message ON T_Conversations(LastMessageAt DESC);
CREATE INDEX idx_messages_conversation_sent ON T_Messages(ConversationID, SentAt DESC);
CREATE INDEX idx_customers_subscribed ON M_Customers(IsSubscribed, LastSeenAt);
CREATE INDEX idx_pages_active ON M_Pages(IsActive);

-- Status codes reference
CREATE TABLE M_StatusCodes (
    StatusID INT PRIMARY KEY,
    StatusName VARCHAR(50) NOT NULL,
    StatusDesc VARCHAR(200),
    ColorCode VARCHAR(7),
    ForTable VARCHAR(50)
);

-- Insert status codes
INSERT INTO M_StatusCodes (StatusID, StatusName, StatusDesc, ColorCode, ForTable) VALUES
(1, 'ACTIVE', 'Active and visible', '#10B981', 'ALL'),
(2, 'INACTIVE', 'Inactive but not deleted', '#F59E0B', 'ALL'),
(3, 'DELETED', 'Soft deleted', '#EF4444', 'ALL'),
(4, 'ARCHIVED', 'Archived records', '#6B7280', 'ALL'),
(5, 'PENDING', 'Awaiting action', '#8B5CF6', 'CONVERSATIONS');

-- Display schema overview
SELECT
    TABLE_NAME,
    ENGINE,
    TABLE_ROWS,
    TABLE_COMMENT
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'dashboard'
AND (TABLE_NAME LIKE 'M_%' OR TABLE_NAME LIKE 'T_%')
ORDER BY TABLE_NAME;