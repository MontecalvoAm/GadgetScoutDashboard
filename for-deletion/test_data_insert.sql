-- =============================================
-- TEST DATA INSERT SCHEMA FOR FACEBOOK MESSENGER DASHBOARD
-- This file contains INSERT queries for testing purposes only
-- Run this after creating all tables with dashboard_schema_create_tables.sql
-- =============================================

-- =============================================
-- STEP 1: USERS SYSTEM & REFERENCE DATA
-- =============================================

-- Insert Reference Table Status values (needed for foreign keys)
INSERT INTO M_ReferenceTableStatus (ID, StatusName, StatusDescription, AppliesToTable, CreatedBy) VALUES
(1, 'ACTIVE', 'Record is active and visible', 'ALL_TABLES', 1),
(2, 'INACTIVE', 'Record is inactive or soft-deleted', 'ALL_TABLES', 1),
(3, 'PENDING', 'Record is pending approval', 'ALL_TABLES', 1),
(4, 'ARCHIVED', 'Record is archived for history', 'ALL_TABLES', 1);

-- Bootstrap initial admin user (ID=1 for setup)
INSERT INTO M_Users (ID, Username, Email, PasswordHash, DisplayName, IsActive, CreatedBy, ReferenceTableStatusID) VALUES
(1, 'admin', 'admin@dashboard.com', '$2b$12$testhashfortestingonly', 'System Administrator', TRUE, 1, 1);

-- Insert standard roles
INSERT INTO M_Roles (ID, RoleName, Description, IsSystemRole, CreatedBy, ReferenceTableStatusID) VALUES
(1, 'SUPER_ADMIN', 'Full system access with super administrator privileges', TRUE, 1, 1),
(2, 'EDITOR', 'Can manage conversations, customers, and message templates', FALSE, 1, 1),
(3, 'VIEWER', 'Read-only access to all data except sensitive settings', FALSE, 1, 1),
(4, 'SUPPORT_AGENT', 'Limited access to assigned conversations and customers only', FALSE, 1, 1);

-- Assign admin user to SUPER_ADMIN role
INSERT INTO M_UserRoles (ID, UserID, RoleID, CreatedBy, ReferenceTableStatusID) VALUES
(1, 1, 1, 1, 1);

-- =============================================
-- STEP 2: DYNAMIC NAVIGATION STRUCTURE
-- =============================================

-- Main navigation items
INSERT INTO M_Navigation (ID, ParentID, DisplayName, Route, Icon, OrderNumber, IsVisible, CreatedBy, ReferenceTableStatusID) VALUES
(1, NULL, 'Dashboard', '/dashboard', 'HomeIcon', 1, TRUE, 1, 1),
(2, NULL, 'Conversations', '/conversations', 'ChatBubbleLeftRightIcon', 2, TRUE, 1, 1),
(3, NULL, 'Customers', '/customers', 'UsersIcon', 3, TRUE, 1, 1),
(4, NULL, 'Analytics', '/analytics', 'ChartBarIcon', 4, TRUE, 1, 1),
(5, NULL, 'Settings', NULL, NULL, 10, TRUE, 1, 1),
(6, 5, 'Users', '/settings/users', 'UserGroupIcon', 1, TRUE, 1, 1),
(7, 5, 'Message Templates', '/settings/templates', 'DocumentTextIcon', 2, TRUE, 1, 1),
(8, 5, 'System Settings', '/settings/system', 'CogIcon', 3, TRUE, 1, 1);

-- Navigation role permissions (which roles can see which navigation items)
INSERT INTO M_NavigationRoles (ID, NavigationID, RoleID, CanAccess, CreatedBy, ReferenceTableStatusID) VALUES
(1, 1, 1, TRUE, 1, 1),
(2, 1, 2, TRUE, 1, 1),
(3, 1, 3, TRUE, 1, 1),
(4, 1, 4, TRUE, 1, 1),

(5, 2, 1, TRUE, 1, 1),
(6, 2, 2, TRUE, 1, 1),
(7, 2, 3, TRUE, 1, 1),
(8, 2, 4, TRUE, 1, 1),

(9, 3, 1, TRUE, 1, 1),
(10, 3, 2, TRUE, 1, 1),
(11, 3, 3, TRUE, 1, 1),
(12, 3, 4, TRUE, 1, 1),

(13, 4, 1, TRUE, 1, 1),
(14, 4, 2, TRUE, 1, 1),
(15, 4, 3, TRUE, 1, 1),
(16, 4, 4, FALSE, 1, 1),

(17, 5, 1, TRUE, 1, 1),
(18, 5, 2, FALSE, 1, 1),
(19, 5, 3, FALSE, 1, 1),
(20, 5, 4, FALSE, 1, 1),

(21, 6, 1, TRUE, 1, 1),
(22, 6, 2, TRUE, 1, 1),
(23, 7, 1, TRUE, 1, 1),
(24, 7, 2, TRUE, 1, 1),
(25, 8, 1, TRUE, 1, 1),
(26, 8, 2, FALSE, 1, 1);

-- =============================================
-- STEP 3: FACEBOOK MESSENGER DATA TEST DATA
-- =============================================

-- Test Facebook customers
INSERT INTO M_Customers (ID, FacebookUserID, DisplayName, FirstName, LastName, ProfilePictureURL, Gender, IsActive, CreatedBy, ReferenceTableStatusID) VALUES
(1, 'fb_1234567890', 'Alice Johnson', 'Alice', 'Johnson', 'https://facebook.com/pic123.jpg', 'F', TRUE, 1, 1),
(2, 'fb_0987654321', 'Bob Smith', 'Bob', 'Smith', 'https://facebook.com/pic098.jpg', 'M', TRUE, 1, 1),
(3, 'fb_1111111111', 'Carol Davis', 'Carol', 'Davis', 'https://facebook.com/pic111.jpg', 'F', TRUE, 1, 1),
(4, 'fb_2222222222', 'David Wilson', 'David', 'Wilson', 'https://facebook.com/pic222.jpg', 'M', TRUE, 1, 1),
(5, 'fb_3333333333', 'Emma Brown', 'Emma', 'Brown', 'https://facebook.com/pic333.jpg', 'F', FALSE, 1, 1);

-- Test conversations
INSERT INTO M_Conversations (ID, ConversationID, CustomerID, UserID, Status, LastMessageTimestamp, Priority, Notes, CreatedBy, ReferenceTableStatusID) VALUES
(1, 'conv_20241214_001', 1, 1, 'ACTIVE', NOW() - INTERVAL 1 HOUR, 'HIGH', 'Urgent customer inquiry about order status', 1, 1),
(2, 'conv_20241214_002', 2, 1, 'ACTIVE', NOW() - INTERVAL 2 HOUR, 'NORMAL', 'General product inquiry', 1, 1),
(3, 'conv_20241213_003', 3, NULL, 'ACTIVE', NOW() - INTERVAL 6 HOUR, 'NORMAL', 'New message - waiting for agent assignment', 1, 1),
(4, 'conv_20241213_004', 1, 1, 'CLOSED', NOW() - INTERVAL 24 HOUR, 'NORMAL', 'Resolved order tracking issue', 1, 1),
(5, 'conv_20241212_005', 4, 1, 'ARCHIVED', NOW() - INTERVAL 48 HOUR, 'LOW', 'Follow-up survey completed', 1, 1);

-- Test messages for conversations
INSERT INTO T_Messages (ID, MessageID, ConversationID, FacebookMessageID, SenderType, SenderID, MessageContent, MessageType, IsRead, CreatedBy, ReferenceTableStatusID) VALUES
-- Conversation 1 messages
(1, 'msg_001_001', 1, 'fb_msg_001001', 'CUSTOMER', 'fb_1234567890', 'Hi, where is my order? I placed it 3 days ago.', 'TEXT', TRUE, 1, 1),
(2, 'msg_001_002', 1, 'fb_msg_001002', 'USER', '1', 'Hello Alice! I can see your order. Let me check the shipping status for you.', 'TEXT', TRUE, 1, 1),
(3, 'msg_001_003', 1, 'fb_msg_001003', 'USER', '1', 'Your order has been shipped and will arrive tomorrow. Tracking number: 1Z12345E6903445555', 'TEXT', FALSE, 1, 1),

-- Conversation 2 messages
(4, 'msg_002_001', 2, 'fb_msg_002001', 'CUSTOMER', 'fb_0987654321', 'I am interested in product XYZ, can you tell me more?', 'TEXT', TRUE, 1, 1),
(5, 'msg_002_002', 2, 'fb_msg_002002', 'USER', '1', 'Of course! Product XYZ is available and has these features: ...', 'TEXT', TRUE, 1, 1),

-- Conversation 3 messages (unassigned)
(6, 'msg_003_001', 3, 'fb_msg_003001', 'CUSTOMER', 'fb_1111111111', 'When will product ABC be back in stock?', 'TEXT', FALSE, 1, 1);

-- =============================================
-- STEP 4: MESSAGE TEMPLATES
-- =============================================

-- Standard message templates
INSERT INTO M_MessageTemplates (ID, TemplateName, TemplateType, TemplateContent, Category, IsActive, CreatedBy, ReferenceTableStatusID) VALUES
(1, 'Welcome Message', 'TEXT', '{"text": "Hi [customer_name]! Welcome to our customer support. How can I help you today?"}', 'GREETING', TRUE, 1, 1),
(2, 'Order Status Inquiry', 'TEXT', '{"text": "Let me check the status of your order #[order_number]. I''ll get back to you shortly with tracking information!"}', 'ORDER', TRUE, 1, 1),
(3, 'Product Out of Stock', 'TEXT', '{"text": "Thanks for your interest! Product [product_name] is currently out of stock. Would you like me to notify you when it''s available?"}', 'INVENTORY', TRUE, 1, 1),
(4, 'Shipping Info', 'TEXT', '{"text": "Your order has been shipped! Tracking: [tracking_number]\n\nEstimated delivery: [delivery_date]\n\nYou can track it here: [tracking_url]"}', 'SHIPPING', TRUE, 1, 1),
(5, 'Follow-up Survey', 'QUICK_REPLY', '{"text": "How was your experience today?", "quick_replies": ["Excellent", "Good", "Average", "Poor"]}', 'SURVEY', TRUE, 1, 1);

-- =============================================
-- STEP 5: SYSTEM CONFIGURATION
-- =============================================

-- System settings for the dashboard
INSERT INTO T_SystemSettings (ID, SettingGroup, SettingKey, SettingValue, SettingType, IsEncrypted, Description, IsActive, CreatedBy, ReferenceTableStatusID) VALUES
(1, 'FACEBOOK', 'WEBHOOK_SECRET', 'your_webhook_secret_here', 'STRING', TRUE, 'Facebook webhook verification secret', TRUE, 1, 1),
(2, 'FACEBOOK', 'PAGE_ACCESS_TOKEN', 'your_page_access_token_here', 'STRING', TRUE, 'Facebook page access token for API calls', TRUE, 1, 1),
(3, 'APP', 'SESSION_TIMEOUT', '30', 'NUMBER', FALSE, 'User session timeout in minutes', TRUE, 1, 1),
(4, 'APP', 'PAGINATION_LIMIT', '50', 'NUMBER', FALSE, 'Number of items per page in listings', TRUE, 1, 1),
(5, 'LOGS', 'RETENTION_DAYS', '90', 'NUMBER', FALSE, 'Number of days to retain audit logs', TRUE, 1, 1),
(6, 'MESSAGES', 'AUTO_ASSIGN', 'TRUE', 'BOOLEAN', FALSE, 'Auto-assign new conversations to available agents', TRUE, 1, 1),
(7, 'UI', 'DEFAULT_LANGUAGE', 'EN', 'STRING', FALSE, 'Default dashboard language', TRUE, 1, 1),
(8, 'NOTIFICATIONS', 'EMAIL_ADMIN', 'admin@dashboard.com', 'STRING', FALSE, 'Admin email for system notifications', TRUE, 1, 1);

-- =============================================
-- STEP 6: CONVERSATION LABELS
-- =============================================

-- Custom labels for conversations
INSERT INTO T_ConversationLabels (ID, ConversationID, LabelName, LabelColor, IsSystemLabel, CreatedBy, ReferenceTableStatusID) VALUES
(1, 1, 'Urgent', 'EF4444', TRUE, 1, 1),
(2, 1, 'Order Inquiry', 'F59E0B', FALSE, 1, 1),
(3, 2, 'Product Info', '3B82F6', FALSE, 1, 1),
(4, 3, 'Stock Inquiry', '10B981', FALSE, 1, 1),
(5, 4, 'Resolved', '059669', TRUE, 1, 1);

-- =============================================
-- STEP 7: ADDITIONAL TEST USERS (FOR ROLE TESTING)
-- =============================================

-- Additional dashboard users for different roles
-- Note: Using ID+1 strategy for new IDs
INSERT INTO M_Users (ID, Username, Email, PasswordHash, DisplayName, RoleOverride, IsActive, CreatedBy, ReferenceTableStatusID) VALUES
(2, 'editor1', 'editor@dashboard.com', '$2b$12$editorhash', 'Conversation Editor', 'EDITOR', TRUE, 1, 1),
(3, 'viewer1', 'viewer@dashboard.com', '$2b$12$viewerhash', 'Data Analyst', 'VIEWER', TRUE, 1, 1),
(4, 'agent1', 'agent@dashboard.com', '$2b$12$agenthash', 'Support Agent', 'SUPPORT_AGENT', TRUE, 1, 1),
(5, 'superadmin', 'super@dashboard.com', '$2b$12$superadmin', 'Super Admin', 'SUPER_ADMIN', TRUE, 1, 1);

-- Assign roles to test users
INSERT INTO M_UserRoles (ID, UserID, RoleID, CreatedBy, ReferenceTableStatusID) VALUES
(6, 2, 2, 1, 1),  -- editor1 -> EDITOR
(7, 3, 3, 1, 1),  -- viewer1 -> VIEWER
(8, 4, 4, 1, 1),  -- agent1 -> SUPPORT_AGENT
(9, 5, 1, 1, 1);  -- superadmin -> SUPER_ADMIN