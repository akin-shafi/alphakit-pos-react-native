-- Fix Subscription and Module Issues
-- Run these SQL commands to resolve your issues

-- ============================================
-- ISSUE 1: Check your current subscription status
-- ============================================
SELECT 
    b.id AS business_id,
    b.name AS business_name,
    s.plan_type,
    s.status,
    s.start_date,
    s.end_date,
    CASE 
        WHEN s.end_date > NOW() THEN CONCAT(DATEDIFF(s.end_date, NOW()), ' days remaining')
        ELSE 'EXPIRED'
    END AS time_remaining
FROM businesses b
LEFT JOIN subscriptions s ON b.id = s.business_id
WHERE s.status IN ('ACTIVE', 'GRACE_PERIOD', 'EXPIRED')
ORDER BY s.created_at DESC
LIMIT 5;

-- ============================================
-- ISSUE 2: Check if you have a trial subscription
-- ============================================
SELECT * FROM subscriptions 
WHERE plan_type = 'TRIAL' 
ORDER BY created_at DESC 
LIMIT 1;

-- ============================================
-- SOLUTION 1: Create a trial subscription if missing
-- ============================================
-- Replace <YOUR_BUSINESS_ID> with your actual business ID (usually 1)
INSERT INTO subscriptions (
    business_id, 
    plan_type, 
    status, 
    start_date, 
    end_date, 
    amount_paid, 
    transaction_reference,
    created_at,
    updated_at
)
VALUES (
    1,  -- <YOUR_BUSINESS_ID>
    'TRIAL',
    'ACTIVE',
    NOW(),
    DATE_ADD(NOW(), INTERVAL 14 DAY),  -- 14 days trial
    0,
    'TRIAL_AUTO_GENERATED',
    NOW(),
    NOW()
)
ON DUPLICATE KEY UPDATE
    status = 'ACTIVE',
    end_date = DATE_ADD(NOW(), INTERVAL 14 DAY);

-- ============================================
-- SOLUTION 2: Update business subscription status
-- ============================================
UPDATE businesses 
SET 
    subscription_status = 'ACTIVE',
    subscription_expiry = DATE_ADD(NOW(), INTERVAL 14 DAY)
WHERE id = 1;  -- <YOUR_BUSINESS_ID>

-- ============================================
-- SOLUTION 3: Enable all basic modules for your business
-- ============================================
-- This will allow you to use all features during trial

-- Enable KITCHEN_DISPLAY module
INSERT INTO business_modules (business_id, module, is_active, created_at, updated_at)
VALUES (1, 'KITCHEN_DISPLAY', true, NOW(), NOW())
ON DUPLICATE KEY UPDATE is_active = true, updated_at = NOW();

-- Enable TABLE_MANAGEMENT module
INSERT INTO business_modules (business_id, module, is_active, created_at, updated_at)
VALUES (1, 'TABLE_MANAGEMENT', true, NOW(), NOW())
ON DUPLICATE KEY UPDATE is_active = true, updated_at = NOW();

-- Enable SAVE_DRAFTS module
INSERT INTO business_modules (business_id, module, is_active, created_at, updated_at)
VALUES (1, 'SAVE_DRAFTS', true, NOW(), NOW())
ON DUPLICATE KEY UPDATE is_active = true, updated_at = NOW();

-- Enable ADVANCED_INVENTORY module
INSERT INTO business_modules (business_id, module, is_active, created_at, updated_at)
VALUES (1, 'ADVANCED_INVENTORY', true, NOW(), NOW())
ON DUPLICATE KEY UPDATE is_active = true, updated_at = NOW();

-- ============================================
-- VERIFICATION: Check what modules you now have
-- ============================================
SELECT 
    bm.id,
    b.name AS business_name,
    bm.module,
    bm.is_active,
    bm.expiry_date,
    CASE 
        WHEN bm.expiry_date IS NULL THEN 'No expiry'
        WHEN bm.expiry_date > NOW() THEN CONCAT(DATEDIFF(bm.expiry_date, NOW()), ' days left')
        ELSE 'EXPIRED'
    END AS status
FROM business_modules bm
JOIN businesses b ON bm.business_id = b.id
WHERE bm.business_id = 1  -- <YOUR_BUSINESS_ID>
ORDER BY bm.module;

-- ============================================
-- QUICK FIX: Enable all modules for ALL businesses (DEV ONLY)
-- ============================================
-- WARNING: Only use this in development!
-- This will give all businesses access to all modules

INSERT INTO business_modules (business_id, module, is_active, created_at, updated_at)
SELECT 
    b.id,
    'KITCHEN_DISPLAY',
    true,
    NOW(),
    NOW()
FROM businesses b
WHERE NOT EXISTS (
    SELECT 1 FROM business_modules bm 
    WHERE bm.business_id = b.id AND bm.module = 'KITCHEN_DISPLAY'
);

INSERT INTO business_modules (business_id, module, is_active, created_at, updated_at)
SELECT 
    b.id,
    'TABLE_MANAGEMENT',
    true,
    NOW(),
    NOW()
FROM businesses b
WHERE NOT EXISTS (
    SELECT 1 FROM business_modules bm 
    WHERE bm.business_id = b.id AND bm.module = 'TABLE_MANAGEMENT'
);

INSERT INTO business_modules (business_id, module, is_active, created_at, updated_at)
SELECT 
    b.id,
    'SAVE_DRAFTS',
    true,
    NOW(),
    NOW()
FROM businesses b
WHERE NOT EXISTS (
    SELECT 1 FROM business_modules bm 
    WHERE bm.business_id = b.id AND bm.module = 'SAVE_DRAFTS'
);

INSERT INTO business_modules (business_id, module, is_active, created_at, updated_at)
SELECT 
    b.id,
    'ADVANCED_INVENTORY',
    true,
    NOW(),
    NOW()
FROM businesses b
WHERE NOT EXISTS (
    SELECT 1 FROM business_modules bm 
    WHERE bm.business_id = b.id AND bm.module = 'ADVANCED_INVENTORY'
);

-- ============================================
-- NOTES:
-- ============================================
-- 1. The /shifts/active endpoint should NOT require SAVE_DRAFTS module
--    This is a bug that needs to be fixed in the code
-- 
-- 2. For now, enabling SAVE_DRAFTS module will unblock you
--
-- 3. After running these scripts:
--    - Clear your browser cache/localStorage
--    - Logout and login again
--    - The subscription page should no longer appear
--
-- 4. If you still see subscription errors, check:
--    - Your business_id in the auth token
--    - The X-Current-Business-ID header in requests
--    - Backend logs for more details
