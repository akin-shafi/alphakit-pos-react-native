# Subscription System Implementation Plan

## Overview
Transform the POS application into a subscription-based model with Monthly, Quarterly, and Annual plans.

---

## 1. Subscription Plans

### Plan Structure
```
MONTHLY:
  - Duration: 30 days
  - Price: [Your pricing - e.g., $29/month]
  - Best for: Small businesses testing the system

QUARTERLY:
  - Duration: 90 days (3 months)
  - Price: [Your pricing - e.g., $75/quarter] (Save ~13%)
  - Best for: Established small businesses

ANNUAL:
  - Duration: 365 days (12 months)
  - Price: [Your pricing - e.g., $250/year] (Save ~28%)
  - Best for: Growing businesses
```

### Free Trial (Optional)
- 14-day free trial for new businesses
- Full access to all features
- No credit card required during trial
- Auto-expires after 14 days unless upgraded

---

## 2. Database Schema Changes

### New Table: `subscriptions`
```sql
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES businesses(id),
    plan_type VARCHAR(20) NOT NULL, -- 'TRIAL', 'MONTHLY', 'QUARTERLY', 'ANNUAL'
    status VARCHAR(20) NOT NULL, -- 'ACTIVE', 'EXPIRED', 'CANCELLED', 'GRACE_PERIOD'
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    auto_renew BOOLEAN DEFAULT false,
    payment_method VARCHAR(50), -- 'CARD', 'BANK_TRANSFER', 'PAYSTACK', etc.
    transaction_reference VARCHAR(255),
    amount_paid DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_business ON subscriptions(business_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);
```

### New Table: `subscription_history`
```sql
CREATE TABLE subscription_history (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER REFERENCES subscriptions(id),
    business_id INTEGER REFERENCES businesses(id),
    event_type VARCHAR(50) NOT NULL, -- 'CREATED', 'RENEWED', 'CANCELLED', 'EXPIRED', 'UPGRADED', 'DOWNGRADED'
    old_plan VARCHAR(20),
    new_plan VARCHAR(20),
    amount DECIMAL(12,2),
    payment_reference VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Update `businesses` Table
```sql
ALTER TABLE businesses 
ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'TRIAL',
ADD COLUMN subscription_expires_at TIMESTAMP,
ADD COLUMN trial_started_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN total_users_limit INTEGER DEFAULT 3, -- Based on plan
ADD COLUMN total_products_limit INTEGER DEFAULT 100; -- Based on plan
```

---

## 3. Subscription Status Flow

```
NEW BUSINESS
    ↓
TRIAL (14 days)
    ↓
    ├─→ ACTIVE (Subscribed)
    │       ↓
    │   [Renews] → ACTIVE
    │       ↓
    │   [Payment Fails] → GRACE_PERIOD (7 days)
    │       ↓
    │   [Payment Success] → ACTIVE
    │       ↓
    │   [Grace Period Ends] → EXPIRED
    │
    └─→ EXPIRED (Trial ends without payment)
        ↓
    LOCKED (Cannot access POS features)
```

---

## 4. Feature Access Based on Subscription

### ACTIVE Subscription
✅ Full POS functionality
✅ Unlimited sales
✅ Full inventory management
✅ All reports
✅ User management (up to plan limit)
✅ Data export

### GRACE_PERIOD (7 days after expiry)
✅ View-only access to data
✅ Can view reports
✅ Can export data
❌ Cannot create new sales
❌ Cannot add/edit products
❌ Cannot add new users

### EXPIRED/LOCKED
✅ View subscription page
✅ Can resubscribe
❌ All POS features locked
❌ Cannot access inventory
❌ Cannot view reports
⚠️ Data preserved for 30 days

---

## 5. Backend Implementation

### 5.1. New Package: `internal/subscription/`

**model.go**
```go
type Subscription struct {
    ID                   uint      `gorm:"primaryKey" json:"id"`
    BusinessID           uint      `json:"business_id"`
    PlanType             string    `json:"plan_type"` // TRIAL, MONTHLY, QUARTERLY, ANNUAL
    Status               string    `json:"status"`    // ACTIVE, EXPIRED, CANCELLED, GRACE_PERIOD
    StartDate            time.Time `json:"start_date"`
    EndDate              time.Time `json:"end_date"`
    AutoRenew            bool      `json:"auto_renew"`
    PaymentMethod        string    `json:"payment_method"`
    TransactionReference string    `json:"transaction_reference"`
    AmountPaid           float64   `json:"amount_paid"`
    CreatedAt            time.Time `json:"created_at"`
    UpdatedAt            time.Time `json:"updated_at"`
}

type SubscriptionPlan struct {
    Type          string  `json:"type"`
    Name          string  `json:"name"`
    DurationDays  int     `json:"duration_days"`
    Price         float64 `json:"price"`
    Currency      string  `json:"currency"`
    Features      []string `json:"features"`
    UserLimit     int     `json:"user_limit"`
    ProductLimit  int     `json:"product_limit"`
}
```

**service.go**
```go
// GetActivePlans returns available subscription plans
func GetActivePlans() []SubscriptionPlan

// CreateSubscription creates a new subscription after payment
func CreateSubscription(db *gorm.DB, businessID uint, planType string, paymentRef string) (*Subscription, error)

// CheckSubscriptionStatus checks if subscription is active
func CheckSubscriptionStatus(db *gorm.DB, businessID uint) (*Subscription, error)

// RenewSubscription renews an existing subscription
func RenewSubscription(db *gorm.DB, subscriptionID uint, paymentRef string) error

// CancelSubscription cancels a subscription
func CancelSubscription(db *gorm.DB, subscriptionID uint) error

// CheckAndUpdateExpiredSubscriptions - Cron job to check expired subscriptions
func CheckAndUpdateExpiredSubscriptions(db *gorm.DB) error
```

**controller.go**
```go
// GET /api/v1/subscription/plans
func GetPlansHandler(c *fiber.Ctx) error

// GET /api/v1/subscription/status
func GetSubscriptionStatusHandler(c *fiber.Ctx) error

// POST /api/v1/subscription/create
func CreateSubscriptionHandler(c *fiber.Ctx) error

// POST /api/v1/subscription/verify-payment
func VerifyPaymentHandler(c *fiber.Ctx) error

// POST /api/v1/subscription/cancel
func CancelSubscriptionHandler(c *fiber.Ctx) error
```

### 5.2. Middleware: Subscription Check

**middleware/subscription.go**
```go
func RequireActiveSubscription() fiber.Handler {
    return func(c *fiber.Ctx) error {
        businessID := c.Locals("business_id").(uint)
        
        subscription, err := subscription.CheckSubscriptionStatus(db, businessID)
        if err != nil {
            return c.Status(403).JSON(fiber.Map{
                "error": "No active subscription found"
            })
        }
        
        if subscription.Status == "EXPIRED" {
            return c.Status(403).JSON(fiber.Map{
                "error": "Subscription expired",
                "subscription": subscription
            })
        }
        
        if subscription.Status == "GRACE_PERIOD" {
            // Allow read-only access
            if c.Method() != "GET" {
                return c.Status(403).JSON(fiber.Map{
                    "error": "Subscription in grace period - read-only access",
                    "subscription": subscription
                })
            }
        }
        
        return c.Next()
    }
}
```

### 5.3. Apply Middleware to Protected Routes

```go
// Protected routes requiring active subscription
posRoutes := api.Group("/pos", jwtware.New(...), RequireActiveSubscription())
posRoutes.Post("/sales", sale.CreateSaleHandler)
posRoutes.Post("/products", product.CreateProductHandler)
// ... other write operations

// Always accessible routes
api.Get("/subscription/status", GetSubscriptionStatusHandler)
api.Get("/subscription/plans", GetPlansHandler)
api.Post("/subscription/create", CreateSubscriptionHandler)
```

---

## 6. Frontend Implementation

### 6.1. New Screens

**`src/screens/subscription/SubscriptionPlansScreen.tsx`**
- Display available plans (Monthly, Quarterly, Annual)
- Show pricing and features comparison
- "Choose Plan" button for each plan
- Highlight recommended plan (Annual with best savings)

**`src/screens/subscription/PaymentScreen.tsx`**
- Payment method selection (Card, Bank Transfer, etc.)
- Integration with Paystack/Flutterwave
- Payment confirmation

**`src/screens/subscription/SubscriptionStatusScreen.tsx`**
- Current plan details
- Expiry date countdown
- Renewal button
- Cancel subscription option
- View payment history

**`src/screens/subscription/SubscriptionExpiredScreen.tsx`**
- Shown when subscription expires
- "Renew Now" CTA
- Display what they're missing
- Option to export data

### 6.2. Context: Subscription Context

**`src/contexts/SubscriptionContext.tsx`**
```typescript
interface SubscriptionContextType {
  subscription: Subscription | null
  isActive: boolean
  isExpired: boolean
  isGracePeriod: boolean
  daysRemaining: number
  checkSubscription: () => void
  renewSubscription: (planType: string) => void
}
```

### 6.3. Subscription Guards

**`src/components/SubscriptionGuard.tsx`**
```typescript
// Wraps protected screens
// Redirects to subscription page if expired
<SubscriptionGuard>
  <POSHomeScreen />
</SubscriptionGuard>
```

### 6.4. UI Components

**Subscription Banner**
- Show at top of app when:
  - < 7 days remaining
  - In grace period
  - Expired
- Color-coded warnings (yellow → orange → red)

**Feature Lock Overlay**
- Shows on expired features
- "Upgrade to access" message
- Link to subscription page

---

## 7. Payment Integration

### Recommended: Paystack (for African markets)

**Setup:**
1. Create Paystack account
2. Get API keys (Public & Secret)
3. Install Paystack SDK

**Flow:**
```
User selects plan
    ↓
Frontend initiates payment
    ↓
Paystack checkout opens
    ↓
User completes payment
    ↓
Paystack webhook → Backend
    ↓
Backend verifies payment
    ↓
Create/Update subscription
    ↓
Send confirmation email
    ↓
User redirected to app (active subscription)
```

**Backend Webhook Handler:**
```go
// POST /api/v1/webhooks/paystack
func HandlePaystackWebhook(c *fiber.Ctx) error {
    // Verify webhook signature
    // Extract payment reference
    // Verify payment with Paystack API
    // Create/Update subscription
    // Return 200 OK
}
```

---

## 8. Cron Job: Subscription Monitor

**Purpose:** Automatically check and update expired subscriptions

**Schedule:** Run every hour

**Implementation:**
```go
// cmd/cron/subscription_monitor.go
func main() {
    db := database.Connect()
    
    ticker := time.NewTicker(1 * time.Hour)
    defer ticker.Stop()
    
    for range ticker.C {
        log.Println("Running subscription check...")
        
        // 1. Find subscriptions expiring today
        // 2. Send reminder emails
        // 3. Update ACTIVE → GRACE_PERIOD (if expired)
        // 4. Update GRACE_PERIOD → EXPIRED (if grace period ended)
        
        subscription.CheckAndUpdateExpiredSubscriptions(db)
    }
}
```

---

## 9. Notifications & Emails

### Email Triggers

1. **Trial Started**
   - Welcome email
   - Trial expiry: 14 days

2. **7 Days Before Expiry**
   - Renewal reminder
   - "Renew now and save X%"

3. **1 Day Before Expiry**
   - Urgent reminder
   - One-click renewal link

4. **Subscription Expired**
   - Grace period notification
   - "You have 7 days to renew"

5. **Grace Period Ending**
   - Final reminder
   - Data will be locked in X days

6. **Subscription Renewed**
   - Thank you email
   - Receipt/Invoice

### Push Notifications (Mobile App)
- Same triggers as emails
- In-app notification badges

---

## 10. User Roles & Subscription

**Owner Only:**
- Can view/manage subscription
- Can add payment methods
- Can cancel subscription

**Managers/Cashiers:**
- Cannot access subscription settings
- Can see subscription status
- Notified when subscription expires

---

## 11. Data Retention Policy

**Active Subscription:**
- Unlimited data retention

**Expired (0-30 days):**
- Data preserved, read-only access
- Can export all data

**Expired (30-60 days):**
- Data archived (compressed)
- Requires support to restore

**Expired (60+ days):**
- Data permanently deleted
- Clear notice sent at 30 days

---

## 12. Implementation Phases

### Phase 1: Database & Backend Core (Week 1)
- [ ] Create subscription tables
- [ ] Build subscription service layer
- [ ] Create subscription middleware
- [ ] API endpoints for subscription management

### Phase 2: Payment Integration (Week 2)
- [ ] Integrate Paystack
- [ ] Payment verification
- [ ] Webhook handling
- [ ] Test payment flows

### Phase 3: Frontend UI (Week 3)
- [ ] Subscription context
- [ ] Subscription screens
- [ ] Payment screen
- [ ] Subscription guards
- [ ] Warning banners

### Phase 4: Cron Jobs & Automation (Week 4)
- [ ] Subscription monitor cron
- [ ] Email notifications
- [ ] Auto-renewal logic
- [ ] Grace period handling

### Phase 5: Testing & Launch (Week 5)
- [ ] End-to-end testing
- [ ] Trial period testing
- [ ] Expiry flow testing
- [ ] Payment testing (test mode)
- [ ] Documentation

---

## 13. Migration Strategy for Existing Users

**Option A: Grandfather existing businesses**
- Give current users lifetime free access
- Or: Give 3 months free, then require subscription

**Option B: Grace period for all**
- Set all existing businesses to 30-day grace period
- Send announcement email
- Offer discount for early adopters

**Recommended: Option B with incentive**
```
Subject: Important Update - Subscription Plans Launched!

Hello [Business Name],

We're excited to announce our new subscription plans! 

As a valued early user, we're giving you:
✅ 30 days to choose your plan
✅ 20% lifetime discount if you subscribe within 14 days
✅ All your data safely preserved

Choose your plan: [Link]
```

---

## 14. Pricing Recommendations (Adjust based on market)

### Nigeria (₦)
- **Monthly:** ₦5,000/month
- **Quarterly:** ₦13,500/quarter (10% off)
- **Annual:** ₦48,000/year (20% off)

### USD ($)
- **Monthly:** $15/month
- **Quarterly:** $40/quarter (11% off)
- **Annual:** $144/year (20% off)

---

## 15. Next Steps

1. **Review this plan** - Confirm pricing and features
2. **Choose payment provider** - Paystack, Flutterwave, or Stripe
3. **Set implementation timeline** - Which phase to start?
4. **Decide on existing users** - Migration strategy?

**Ready to start implementation?** Let me know which phase you'd like to begin with!
