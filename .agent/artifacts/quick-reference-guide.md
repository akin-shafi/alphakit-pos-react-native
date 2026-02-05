# Quick Reference Guide: POS Enhancement Features

## 🎯 Key Features Being Added

### 1. **Draft/Held Orders** (Save for Later)
**Problem**: Bar customers don't order everything at once  
**Solution**: Cashier can save incomplete orders and add items later

```
Customer Timeline:
8:00 PM → Orders 2 beers → Saved to Draft
8:30 PM → Orders snacks → Add to existing draft  
9:00 PM → Ready to pay → Complete the order
```

### 2. **Stock Reservation System** (No Discrepancies)
**Problem**: Multiple cashiers might oversell limited stock  
**Solution**: When items added to draft, stock is "reserved" not "sold"

```
Before (❌):
Beer stock: 1
Cashier 1 adds to cart → Shows available
Cashier 2 adds to cart → Shows available  
Both checkout → Oversold!

After (✅):
Beer stock: 1
Cashier 1 adds to draft → Reserved: 1, Available: 0
Cashier 2 tries to add → Error: "Out of stock"
```

### 3. **Table Assignment**
**Problem**: Hard to track which order belongs to which table  
**Solution**: Assign orders to table numbers

```
Table T-5 → Order #123 (Draft)
Table VIP-1 → Order #124 (Draft)
Table T-8 → Order #125 (Completed)
```

### 4. **Bill Transfer** (Move Orders)
**Problem**: Customer moves from Table 1 to Table 2  
**Solution**: Transfer the order to new table

```
Before: Table 1 → Order #100
Action: Transfer Order #100 to Table 3
After:  Table 3 → Order #100
```

### 5. **Bill Merge** (Combine Orders)
**Problem**: Friends at different tables want one bill  
**Solution**: Merge multiple orders into one

```
Before:
Table 1 → Order #100 (₦2,500)
Table 2 → Order #101 (₦3,000)

Action: Merge Orders 100 + 101

After: 
Table 1 → Order #100 (₦5,500) [contains all items]
Table 2 → Empty
```

### 6. **Enhanced Shift Management**
**Problem**: Cannot track which cashier made which sale  
**Solution**: Require active shift for all sales operations

```
Cashier Flow:
1. Start Shift → Enter starting cash
2. Process Sales → All sales linked to shift
3. End Shift → Report: Total sales, transactions, ending cash
```

---

## 📊 How It Prevents Stock Discrepancies

### Current Flow (Can cause issues):
```
Add to Cart → Check Stock → Complete Sale → Deduct Stock
                ↑
        Multiple cashiers can 
        check at same time!
```

### New Flow (Problem solved):
```
Add to Draft → Reserve Stock → Complete Sale → Deduct Stock & Release Reservation
                     ↓
              Stock becomes unavailable
              to other cashiers immediately!
```

### Example Scenario:

```
🍺 Product: Beer (Stock: 5 units)

Timeline:
---------
10:00 AM - Cashier A: Adds 3 beers to Table 1 draft
           → Reserved: 3, Available: 2

10:05 AM - Cashier B: Adds 2 beers to Table 2 draft  
           → Reserved: 5, Available: 0

10:10 AM - Cashier C: Tries to add 1 beer
           → ❌ Error: "Insufficient stock"

10:15 AM - Customer Table 1 completes payment
           → Stock: 2, Reserved: 2, Available: 0

10:20 AM - Customer Table 2 completes payment
           → Stock: 0, Reserved: 0, Available: 0
```

✅ **No overselling occurred!**

---

## 🔄 User Workflows

### Workflow A: Save to Draft & Resume

```
┌─────────────────┐
│ 1. Add items    │
│    to cart      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. Click        │
│ "Save to Draft" │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. Enter table  │
│    number (T-5) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ✅ Draft saved  │
│ Stock reserved  │
└─────────────────┘

... Later ...

┌─────────────────┐
│ 4. Open "Draft  │
│    Orders"      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 5. Find Table   │
│    T-5 order    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 6. Tap "Resume" │
│    Cart loads!  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 7. Add more     │
│    items        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 8. Checkout &   │
│    Complete     │
└─────────────────┘
```

### Workflow B: Merge Bills

```
Scenario: Table 1 (₦2,500) + Table 2 (₦3,000) → One bill

┌─────────────────┐
│ 1. Open "Bill   │
│    Management"  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. Select       │
│    Table 1      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. Click        │
│    "Merge"      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. Select       │
│    Table 2      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 5. Confirm      │
│    merge        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ✅ Table 1 now  │
│ has all items   │
│ Total: ₦5,500   │
└─────────────────┘
```

---

## 🗄️ Database Changes Summary

### New Tables (3)

**1. stock_reservations**
```
Tracks reserved stock for draft orders
Prevents overselling
Auto-expires after 4 hours
```

**2. tables**
```
Represents physical tables/sections
Allows table assignment to orders
Tracks table status (available, occupied)
```

**3. sale_activity_logs**
```
Audit trail for all actions
Who transferred/merged/voided
When and why
```

### Modified Tables (2)

**shifts** (Add fields)
```
+ terminal_id
+ total_sales  
+ transaction_count
+ notes
```

**sales** (Add fields)
```
+ table_id
+ table_number
+ order_type (dine-in, takeaway)
+ shift_id
```

---

## 🔌 New API Endpoints

### Shift Management
```
GET    /shifts/:id/summary        # Shift sales report
```

### Draft Orders
```
POST   /sales/draft                # Create draft order
GET    /sales/drafts               # List all drafts
POST   /sales/:id/resume           # Resume editing
DELETE /sales/:id/draft            # Cancel draft
```

### Bill Management
```
POST   /sales/:id/transfer         # Move to different table
POST   /sales/:id/merge            # Combine multiple bills
GET    /sales/:id/history          # View activity log
```

### Tables
```
POST   /tables                     # Create table
GET    /tables                     # List all tables
GET    /tables/:id/orders          # Table's orders
PUT    /tables/:id                 # Update table
DELETE /tables/:id                 # Delete table
```

### Stock
```
GET    /inventory/:id/available    # Available stock (excluding reserved)
GET    /inventory/reservations     # View all reservations
```

---

## 📱 New Frontend Screens

### 1. Enhanced Shift Management Screen
**Features:**
- Connected to real API (no more mock data)
- Shows shift summary (sales, transactions)
- Prevents POS access without active shift

### 2. Draft Orders Screen  
**Features:**
- List all saved drafts
- Filter by table, cashier, date
- Resume, transfer, merge, delete actions
- Shows how long draft has been waiting

### 3. Bill Management Screen
**Features:**
- Visual table grid layout
- Table status indicators
- Quick access to table orders
- Transfer and merge flows

### 4. Updated Cart Screen
**Features:**
- "Save to Draft" button added
- Table number input
- Customer name input (optional)

---

## 🛡️ Security & Permissions

| Action | Cashier | Manager | Owner |
|--------|---------|---------|-------|
| Create draft | ✅ | ✅ | ✅ |
| Resume own draft | ✅ | ✅ | ✅ |
| Resume other's draft | ❌ | ✅ | ✅ |
| Delete own draft | ✅ | ✅ | ✅ |
| Delete other's draft | ❌ | ✅ | ✅ |
| Transfer bill | ✅ | ✅ | ✅ |
| Merge bills | ❌ | ✅ | ✅ |
| View activity log | ❌ | ✅ | ✅ |

**All actions are logged for audit purposes!**

---

## ⚡ Performance Optimizations

1. **Database Indexes**
   - Reservations indexed by product + business
   - Sales indexed by status + business
   - Activity logs indexed by sale + date

2. **Caching**
   - Available stock calculations cached
   - Table status cached
   - Invalidated on relevant changes

3. **Query Optimization**
   - Single query for sales + items (JOIN)
   - Pagination for long lists
   - Archive old activity logs after 90 days

---

## 🧪 Testing Scenarios

### Multi-Cashier Race Condition
```
Test: Two cashiers try to sell last beer simultaneously
Expected: One succeeds, one gets "out of stock" error
```

### Draft Expiry
```
Test: Draft saved at 10:00 AM, still there at 2:00 PM?
Expected: Reservation auto-released after 4 hours
```

### Bill Merge Integrity
```
Test: Merge Table 1 + Table 2, then void the result
Expected: All items restored to inventory correctly
```

### Shift Enforcement
```
Test: Cashier tries to checkout without starting shift
Expected: Error "Please start your shift first"
```

---

## 📈 Rollout Plan (7 Weeks)

| Week | Focus | Deliverables |
|------|-------|--------------|
| 1 | Foundation | Database schema, models, migrations |
| 2 | Core Logic | Reservation system, draft save/resume |
| 3 | Bill Mgmt | Transfer, merge, activity logging |
| 4 | Shift UI | Connect frontend to shift API |
| 5 | Draft UI | Draft orders screen, save/resume flow |
| 6 | Bill UI | Table grid, transfer/merge interfaces |
| 7 | Polish | Testing, cron jobs, documentation |

---

## 🎓 Training Requirements

### For Cashiers
- How to start/end shifts
- How to save orders to draft
- How to resume draft orders
- How to assign table numbers

### For Managers
- How to transfer bills between tables
- How to merge multiple bills
- How to view activity logs
- How to manage tables

### For Owners
- Understanding stock reservation system
- Reading shift reports
- Analyzing draft order patterns
- Managing permissions

---

## ❓ FAQs

**Q: What happens if draft order is never completed?**  
A: Reservation auto-expires after 4 hours, stock becomes available again

**Q: Can I merge a completed sale?**  
A: No, only DRAFT or HELD orders can be merged

**Q: What if I transfer bill to wrong table?**  
A: Transfer again to correct table, all actions are logged

**Q: Can two cashiers work on same draft?**  
A: Only if manager/owner, cashiers can only resume their own drafts

**Q: What if customer leaves without paying?**  
A: Delete/cancel the draft order, stock is automatically released

**Q: Does this work offline?**  
A: Draft creation works offline, sync when online (future enhancement)

---

## 🚀 Benefits Summary

### For Business Owners
✅ **Zero stock discrepancies** - Reservation system prevents overselling  
✅ **Complete audit trail** - Know who did what, when  
✅ **Better cash control** - Shift-based accountability  
✅ **Increased sales** - Customers can order incrementally  

### For Cashiers
✅ **Easier workflow** - Save orders and come back later  
✅ **Less errors** - System prevents common mistakes  
✅ **Flexible service** - Transfer/merge bills as needed  
✅ **Clear responsibilities** - Shift-based work tracking  

### For Customers
✅ **Better service** - Order at their own pace  
✅ **Flexible billing** - Merge tables, split bills (future)  
✅ **Faster checkout** - Prepared orders ready to pay  

---

## 📞 Support & Documentation

- **Full Implementation Plan**: `shift-draft-bill-management-plan.md`
- **API Documentation**: Auto-generated Swagger docs
- **User Manual**: To be created in Week 7
- **Video Tutorials**: To be created in Week 7

---

**Ready to implement? Follow the 7-week rollout plan!** 🎉
