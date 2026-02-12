# Super Admin Login & Subscription Fix

## Issues Fixed

### 1. Super Admin Redirection Issue
**Problem**: When a user with `super_admin` role logged in, they were not being redirected to the admin dashboard (`/dashboard/admin`).

**Solution**: 
- Updated `POSStack.tsx` to detect super_admin users and route them appropriately
- Added a special admin notice banner in `DashboardScreen.tsx` that informs super admins to use the web admin panel for full administrative features

### 2. Subscription Check Bypass for Super Admins
**Problem**: Super admins were being redirected to the subscription page because the app was checking for subscription status even though super admins don't need subscriptions.

**Solution**: Created exceptions for super_admin users at multiple levels:

#### Frontend Changes:
1. **SubscriptionContext.tsx**
   - Added super_admin detection in `refreshStatus()` function
   - Super admins now get a mock "ACTIVE" subscription that never expires
   - Bypasses API calls to subscription endpoints for super admins

2. **DashboardScreen.tsx**
   - Added `isSuperAdmin` flag detection
   - Added informational banner explaining super admin access
   - Prevents fetching report data for super admins (they use web panel)
   - Added styles for the admin notice banner

3. **POSStack.tsx**
   - Updated routing logic to handle super_admin role
   - Ensures proper initial route selection

#### Backend Changes:
1. **middleware/jwt.go**
   - Added `role` to fiber context locals
   - Enables other middlewares to check user role

2. **middleware/subscription.go**
   - Added super_admin bypass check
   - Super admins skip subscription validation entirely

3. **middleware/module_guard.go**
   - Added super_admin bypass check
   - Super admins have access to all modules without subscription

## How It Works

### Super Admin Login Flow:
1. User with `role = "super_admin"` logs in via mobile app
2. JWT token includes the super_admin role
3. `SubscriptionContext` detects super_admin and sets mock active subscription
4. User is NOT redirected to subscription page
5. User sees Dashboard with admin notice banner
6. Banner directs them to use web admin panel at `/dashboard/admin`

### Super Admin Backend Access:
1. JWT middleware extracts role and sets it in context
2. Subscription middleware checks role - if super_admin, bypasses check
3. Module guard middleware checks role - if super_admin, bypasses check
4. Super admin has full access to all endpoints without subscription restrictions

## Testing

### To Test Super Admin Access:

1. **Create a super admin user** (via SQL):
```sql
UPDATE users SET role = 'super_admin' WHERE email = 'admin@example.com';
```

2. **Login via mobile app**:
   - Use the super admin credentials
   - Should see Dashboard (not subscription page)
   - Should see teal banner with "Super Admin Access" message

3. **Verify backend access**:
   - Super admin should be able to access all API endpoints
   - No subscription or module errors should occur

4. **Access web admin panel**:
   - Navigate to web application
   - Go to `/dashboard/admin`
   - Manage subscriptions, modules, and promo codes

## Files Modified

### Frontend (React Native):
- `src/contexts/SubscriptionContext.tsx`
- `src/navigation/POSStack.tsx`
- `src/screens/home/DashboardScreen.tsx`

### Backend (Go):
- `backend/POS/internal/middleware/jwt.go`
- `backend/POS/internal/middleware/subscription.go`
- `backend/POS/internal/middleware/module_guard.go`

## Notes

- Super admins are intended for system administration, not regular POS operations
- The mobile app provides basic access; full admin features are in the web panel
- Super admins bypass ALL subscription and module checks
- The mock subscription prevents any subscription-related UI from appearing
- Super admins can still access regular POS features if needed

## Future Enhancements

Consider adding:
1. A dedicated admin screen in the mobile app (optional)
2. Deep linking to web admin panel from mobile app
3. Admin-specific analytics or monitoring features
4. Ability to switch between admin mode and regular business mode
