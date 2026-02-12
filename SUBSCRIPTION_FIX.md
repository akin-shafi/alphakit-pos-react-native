# Subscription & Module Access Issues - Diagnosis & Fix

## Problem Summary

You're experiencing two related issues:

### Issue 1: "Module Not Subscribed" Error for `/shifts/active`
```json
{
    "error": "Module Not Subscribed",
    "message": "This feature requires an active subscription for the SAVE_DRAFTS module.",
    "module": "SAVE_DRAFTS"
}
```

### Issue 2: Auto-redirect to Subscription Page
Despite having 3 days left on your trial, you're being redirected to the subscription page.

## Root Causes

### 1. Missing Business Modules
Your business doesn't have the required modules activated in the `business_modules` table. The system requires explicit module activation even for trial users.

### 2. Incorrect Module Guard Application (BUG)
The `/shifts/active` endpoint should NOT require the `SAVE_DRAFTS` module. This is happening because:
- Shift routes are registered under `businessScoped` group
- The `businessScoped` group includes `SubscriptionMiddleware`
- However, the error message suggests a `ModuleGuard` is being triggered
- This might be due to a misconfigured route or middleware chain

### 3. Subscription Status Not Properly Set
The `businesses` table might not have the correct `subscription_status` and `subscription_expiry` fields set.

## Quick Fix (Immediate Solution)

Run the SQL script `fix_subscription.sql` to:

1. **Create/Update Trial Subscription**:
   ```sql
   INSERT INTO subscriptions (business_id, plan_type, status, start_date, end_date, ...)
   VALUES (1, 'TRIAL', 'ACTIVE', NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY), ...);
   ```

2. **Enable All Modules**:
   ```sql
   INSERT INTO business_modules (business_id, module, is_active, ...)
   VALUES 
       (1, 'KITCHEN_DISPLAY', true, ...),
       (1, 'TABLE_MANAGEMENT', true, ...),
       (1, 'SAVE_DRAFTS', true, ...),
       (1, 'ADVANCED_INVENTORY', true, ...);
   ```

3. **Update Business Status**:
   ```sql
   UPDATE businesses 
   SET subscription_status = 'ACTIVE', 
       subscription_expiry = DATE_ADD(NOW(), INTERVAL 14 DAY)
   WHERE id = 1;
   ```

4. **Clear Frontend Cache**:
   - Logout from the web app
   - Clear browser localStorage
   - Clear browser cache
   - Login again

## Permanent Fix (Code Changes Needed)

### Option 1: Remove Module Guard from Shift Routes (Recommended)

Shift management is a core POS feature and should NOT be gated behind the `SAVE_DRAFTS` module.

**File**: `backend/POS/cmd/server/main.go`

Change from:
```go
// Current (WRONG)
shift.RegisterShiftRoutes(businessScoped, db)  // businessScoped has SubscriptionMiddleware
```

To:
```go
// Fixed (CORRECT)
shift.RegisterShiftRoutes(protected, db)  // Only JWT + Tenant, no module guards
```

### Option 2: Create Trial Subscriptions Automatically

**File**: `backend/POS/internal/business/service.go`

Add this function to automatically create trial subscriptions when a business is created:

```go
func (s *BusinessService) CreateTrialSubscription(businessID uint) error {
    // Create trial subscription
    trial := &subscription.Subscription{
        BusinessID:           businessID,
        PlanType:             subscription.PlanTrial,
        Status:               subscription.StatusActive,
        StartDate:            time.Now(),
        EndDate:              time.Now().AddDate(0, 0, 14), // 14 days
        AmountPaid:           0,
        TransactionReference: "TRIAL_AUTO",
    }
    
    if err := s.db.Create(trial).Error; err != nil {
        return err
    }
    
    // Enable all modules for trial
    modules := []subscription.ModuleType{
        subscription.ModuleKDS,
        subscription.ModuleTables,
        subscription.ModuleDrafts,
        subscription.ModuleInventory,
    }
    
    for _, mod := range modules {
        bm := &subscription.BusinessModule{
            BusinessID: businessID,
            Module:     mod,
            IsActive:   true,
        }
        s.db.Create(bm)
    }
    
    return nil
}
```

### Option 3: Make Modules Optional for Trial Users

**File**: `backend/POS/internal/middleware/module_guard.go`

Modify the `ModuleGuard` to skip checks for trial users:

```go
func ModuleGuard(db *gorm.DB, module subscription.ModuleType) fiber.Handler {
    return func(c *fiber.Ctx) error {
        businessID := c.Locals("current_business_id").(uint)
        if businessID == 0 {
            return c.Status(400).JSON(fiber.Map{"error": "Business context required"})
        }
        
        // Check if business is on trial
        var sub subscription.Subscription
        err := db.Where("business_id = ? AND status = ?", businessID, "ACTIVE").
            First(&sub).Error
        
        if err == nil && sub.PlanType == subscription.PlanTrial {
            // Skip module check for trial users
            return c.Next()
        }
        
        // Normal module check for paid users
        if !subscription.HasModule(db, businessID, module) {
            return c.Status(403).JSON(fiber.Map{
                "error":   "Module Not Subscribed",
                "module":  module,
                "message": "This feature requires an active subscription for the " + string(module) + " module.",
            })
        }
        
        return c.Next()
    }
}
```

## Recommended Approach

1. **Immediate**: Run `fix_subscription.sql` to unblock yourself
2. **Short-term**: Move shift routes from `businessScoped` to `protected` group
3. **Long-term**: Implement automatic trial subscription creation for new businesses

## Testing After Fix

1. **Check Subscription Status**:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        -H "X-Current-Business-ID: 1" \
        http://localhost:5050/api/v1/subscription/status
   ```

2. **Test Shift Endpoint**:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        -H "X-Current-Business-ID: 1" \
        http://localhost:5050/api/v1/shifts/active
   ```

3. **Verify Modules**:
   ```sql
   SELECT * FROM business_modules WHERE business_id = 1;
   ```

## Prevention

To prevent this in the future:

1. **Seed Script**: Create a seed script that automatically sets up trial subscriptions and modules for development
2. **Business Creation Hook**: Add a post-creation hook to `CreateBusiness` that initializes trial subscription
3. **Better Error Messages**: Update error messages to distinguish between "no subscription" and "missing module"
4. **Frontend Handling**: Add better error handling in the frontend to show specific module upgrade prompts

## Additional Notes

- The `SAVE_DRAFTS` module is for saving incomplete orders as drafts
- Shift management should be a core feature, not a premium module
- Trial users should have access to all features by default
- Module guards should only apply to premium features after trial expires
