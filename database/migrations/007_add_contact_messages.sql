-- Add Contact Messages Table for Contact Form SMS Notifications
-- This stores messages from the website contact form for admin notifications

CREATE TABLE contact_messages (
  id SERIAL PRIMARY KEY,
  
  -- Contact Information
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  message_content TEXT NOT NULL,
  
  -- System Information
  ip_address INET,
  user_agent TEXT,
  
  -- Admin Response Tracking
  is_existing_customer BOOLEAN DEFAULT FALSE, -- Auto-detected if phone exists in orders
  admin_responded BOOLEAN DEFAULT FALSE,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_contact_messages_phone ON contact_messages(phone);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at);
CREATE INDEX idx_contact_messages_existing_customer ON contact_messages(is_existing_customer);
CREATE INDEX idx_contact_messages_responded ON contact_messages(admin_responded);