# Address Fields Database Update

## Overview
Updated the address handling system from a single field to separate detailed address fields for better data management and postal code-based logic.

## Changes Made

### 1. Database Schema (`database/schema.sql`)
**Added new fields to `orders` table:**
- `street_address VARCHAR(255)` - Street number and name
- `suburb VARCHAR(100)` - Suburb/city name  
- `state VARCHAR(10)` - State abbreviation (NSW, VIC, etc.)
- `postal_code VARCHAR(4)` - 4-digit Australian postal code

**Added index:**
- `idx_orders_postal_code` for efficient postal code queries

**Backward compatibility:**
- Kept existing `pickup_address TEXT NOT NULL` field for display and legacy support

### 2. API Route (`src/app/api/orders/route.ts`)
**Updated to handle new address fields:**
- Accepts both old format (`address`) and new format (`streetAddress`, `suburb`, `state`, `postalCode`)
- Validates address components when provided
- Stores both combined address and separate fields

### 3. Frontend (`src/app/page.tsx`)
**Updated form structure:**
- Replaced single address input with 4 separate fields
- Added proper validation for each field
- Postal code limited to 4 digits with validation
- Maintains backward compatibility by sending combined address string

### 4. Database Service (`src/lib/database.ts`)
**Updated Order interface:**
- Added optional fields for new address components
- Maintains compatibility with existing code

### 5. Admin Interface (`src/app/admin/page.tsx`)
**Updated Order type:**
- Added new address fields to interface
- Existing display continues to work with `pickup_address`

## Migration Required

### For Existing Databases:
Run the migration script: `database/migration_add_address_fields.sql`

```sql
-- Add new address columns to existing table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS street_address VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS suburb VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS state VARCHAR(10);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS postal_code VARCHAR(4);

-- Add postal code index
CREATE INDEX IF NOT EXISTS idx_orders_postal_code ON orders(postal_code);
```

## Benefits

### 1. **Postal Code Logic**
- Easy to implement delivery zone restrictions
- Postal code-based pricing logic
- Geographic analytics and reporting

### 2. **Data Quality**
- Structured validation for each address component
- Consistent data format
- Better error handling and user feedback

### 3. **Backward Compatibility**
- Existing integrations continue to work
- Combined address still available for display
- No breaking changes to current functionality

### 4. **Future Enhancements**
- Address autocomplete integration
- Geographic service area validation
- Location-based features

## Data Flow

### Frontend Form:
```javascript
address: {
  streetAddress: "123 Main Street",
  suburb: "Byron Bay", 
  state: "NSW",
  postalCode: "2481"
}
```

### API Payload:
```javascript
{
  // Combined for backward compatibility
  address: "123 Main Street, Byron Bay, NSW 2481",
  
  // Separate fields for logic
  streetAddress: "123 Main Street",
  suburb: "Byron Bay",
  state: "NSW", 
  postalCode: "2481"
}
```

### Database Storage:
```sql
pickup_address: "123 Main Street, Byron Bay, NSW 2481"  -- Display/legacy
street_address: "123 Main Street"                       -- Logic
suburb: "Byron Bay"                                      -- Logic  
state: "NSW"                                            -- Logic
postal_code: "2481"                                     -- Logic/indexing
```

## Testing Checklist

- [ ] Run migration script on database
- [ ] Test new order creation with separate address fields
- [ ] Verify backward compatibility with existing orders
- [ ] Test address validation (all fields required, postal code 4 digits)
- [ ] Confirm admin dashboard displays addresses correctly
- [ ] Test postal code indexing for performance