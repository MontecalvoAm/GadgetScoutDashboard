// User interface for authentication
export interface User {
  id: number;
  email: string;
  
  // These are the new fields causing the errors
  firstName?: string; 
  lastName?: string;
  roleId?: number;

  // Keep these for backward compatibility
  username?: string;
  displayName?: string;
  role?: string;
}

// Dashboard statistics interface
export interface DashboardStats {
  users: number;
  customers: number;
  conversations: number;
  messages: number;
  openConversations: number;
}

// Conversation interface
export interface Conversation {
  ID: number;
  Status: 'OPEN' | 'CLOSED' | 'PENDING' | 'RESOLVED';
  Subject: string;
  Messages: number;
  CustomerName: string;
  CustomerEmail: string;
  CreatedAt: string;
  UpdatedAt?: string;
  Priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  AssignedAgent?: string;
}

// Message interface for conversation details
export interface Message {
  ID: number;
  ConversationID: number;
  Sender: string;
  Content: string;
  CreatedAt: string;
  IsCustomer: boolean;
  Attachments?: string[];
}

// API response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Authentication interfaces
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<boolean>;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Pagination interfaces
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Error handling interfaces
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

// Form validation interfaces
export interface ValidationError {
  field: string;
  message: string;
}