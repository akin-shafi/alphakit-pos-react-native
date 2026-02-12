# Super Admin Panel

The Super Admin Panel provides centralized management for subscriptions, business modules, and promotional codes across all businesses in the AlphaKit POS system.

## Access

The Admin Panel is only accessible to users with the `super_admin` role. To grant super admin access:

```sql
UPDATE users SET role = 'super_admin' WHERE email = 'admin@example.com';
```

## Features

### 1. Subscriptions Management

View all active and expired subscriptions across all businesses:

- **Business Name**: The name of the subscribed business
- **Plan Type**: MONTHLY, QUARTERLY, or ANNUAL
- **Status**: ACTIVE, EXPIRED, GRACE_PERIOD, or CANCELLED
- **Start/End Dates**: Subscription period
- **Amount Paid**: Total subscription cost

### 2. Business Modules Management

Control which premium features are available to each business:

#### Available Modules:
- **KITCHEN_DISPLAY**: Kitchen Display System (KDS)
- **TABLE_MANAGEMENT**: Table assignment and management
- **SAVE_DRAFTS**: Save incomplete orders as drafts
- **ADVANCED_INVENTORY**: Advanced inventory tracking features

#### Actions:
- **Add Module**: Assign a module to a business
  - Select business ID
  - Choose module type
  - Set active status
  - Optional: Set expiry date
  
- **Edit Module**: Update module status or expiry date
- **Toggle Status**: Quickly enable/disable a module
- **Delete Module**: Remove module access from a business

#### Example: Enable KDS for a Business

**Via UI:**
1. Navigate to Admin Panel → Business Modules
2. Click "Add Module"
3. Enter Business ID (e.g., 1)
4. Select "KITCHEN_DISPLAY"
5. Check "Active"
6. (Optional) Set expiry date
7. Click "Save"

**Via SQL:**
```sql
INSERT INTO business_modules (business_id, module, is_active, created_at, updated_at)
VALUES (1, 'KITCHEN_DISPLAY', true, NOW(), NOW());
```

### 3. Promo Codes Management

Create and manage promotional discount codes:

#### Fields:
- **Code**: Unique promo code (e.g., "SUMMER2024")
- **Discount Percentage**: 1-100%
- **Max Uses**: Maximum number of times the code can be used (0 = unlimited)
- **Expiry Date**: When the code expires
- **Status**: Active or Inactive
- **Used Count**: How many times the code has been used

#### Actions:
- **Add Promo Code**: Create a new promotional code
- **Edit Promo Code**: Update discount, usage limits, or expiry
- **Toggle Status**: Quickly activate/deactivate a code
- **Delete Promo Code**: Remove a promo code

#### Example: Create a 20% Discount Code

**Via UI:**
1. Navigate to Admin Panel → Promo Codes
2. Click "Add Promo Code"
3. Enter Code: "LAUNCH20"
4. Set Discount: 20%
5. Set Max Uses: 100
6. Set Expiry Date: 2024-12-31
7. Check "Active"
8. Click "Save"

**Via SQL:**
```sql
INSERT INTO promo_codes (code, discount_percentage, max_uses, expiry_date, active, created_at, updated_at)
VALUES ('LAUNCH20', 20, 100, '2024-12-31', true, NOW(), NOW());
```

## API Endpoints

All admin endpoints require JWT authentication with `super_admin` role:

### Subscriptions
- `GET /api/v1/admin/subscriptions` - List all subscriptions

### Modules
- `GET /api/v1/admin/modules` - List all business modules
- `POST /api/v1/admin/modules` - Create a new module
- `PUT /api/v1/admin/modules/:id` - Update a module
- `DELETE /api/v1/admin/modules/:id` - Delete a module

### Promo Codes
- `GET /api/v1/admin/promo-codes` - List all promo codes
- `POST /api/v1/admin/promo-codes` - Create a promo code
- `PUT /api/v1/admin/promo-codes/:id` - Update a promo code
- `DELETE /api/v1/admin/promo-codes/:id` - Delete a promo code

## Security

- All admin routes are protected by JWT authentication
- Only users with `role = 'super_admin'` can access these endpoints
- The admin panel is hidden from the sidebar for non-super-admin users
- Module checks are enforced on both frontend and backend

## Common Tasks

### Enable KDS for All Businesses

```sql
INSERT INTO business_modules (business_id, module, is_active, created_at, updated_at)
SELECT id, 'KITCHEN_DISPLAY', true, NOW(), NOW()
FROM businesses
WHERE NOT EXISTS (
  SELECT 1 FROM business_modules 
  WHERE business_modules.business_id = businesses.id 
  AND business_modules.module = 'KITCHEN_DISPLAY'
);
```

### View Active Subscriptions

```sql
SELECT 
  b.name AS business_name,
  s.plan_type,
  s.status,
  s.end_date,
  s.amount_paid
FROM subscriptions s
JOIN businesses b ON s.business_id = b.id
WHERE s.status IN ('ACTIVE', 'GRACE_PERIOD')
ORDER BY s.end_date ASC;
```

### Check Module Usage

```sql
SELECT 
  module,
  COUNT(*) AS total_businesses,
  SUM(CASE WHEN is_active THEN 1 ELSE 0 END) AS active_count
FROM business_modules
GROUP BY module;
```

## Troubleshooting

### Admin Panel Not Visible

1. Check user role:
   ```sql
   SELECT email, role FROM users WHERE email = 'your-email@example.com';
   ```

2. If role is not `super_admin`, update it:
   ```sql
   UPDATE users SET role = 'super_admin' WHERE email = 'your-email@example.com';
   ```

3. Log out and log back in to refresh the session

### Module Not Showing for Business

1. Verify module exists and is active:
   ```sql
   SELECT * FROM business_modules 
   WHERE business_id = 1 AND module = 'KITCHEN_DISPLAY';
   ```

2. Check if module has expired:
   ```sql
   SELECT * FROM business_modules 
   WHERE business_id = 1 
   AND module = 'KITCHEN_DISPLAY'
   AND (expiry_date IS NULL OR expiry_date > NOW());
   ```

3. Frontend caches subscription data - refresh the page or clear localStorage

## Notes

- Module changes take effect immediately after the next `/subscription/status` API call
- Promo codes are validated during subscription purchase
- Expired modules are automatically hidden from users
- Super admin role has access to all features across all businesses
