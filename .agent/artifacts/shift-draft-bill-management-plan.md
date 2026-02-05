# POS System Enhancement Plan: Draft Orders, Bill Management & Multi-Cashier Support

## Executive Summary

This document outlines the implementation plan for enhancing the POS system with:
1. **Draft/Held Order Management** - Save incomplete orders for later completion
2. **Bill Transfer & Merge** - Move orders between tables/cashiers or combine multiple bills
3. **Multi-Cashier Stock Control** - Prevent stock discrepancies when multiple cashiers work simultaneously
4. **Enhanced Shift Management** - Proper tracking of cashier activities and accountability

---

## Current System Analysis

### Backend Current State
**Shift Management (`backend/POS/internal/shift/`)**
- ✅ Basic shift start/end functionality exists
- ✅ Tracks start cash, end cash, shift status (open/closed)
- ✅ Associates shifts with specific cashiers
- ❌ No terminal tracking
- ❌ No shift-based sales reporting
- ❌ No validation to prevent sales without active shift

**Sales Management (`backend/POS/internal/sale/`)**
- ✅ Has DRAFT, COMPLETED, VOIDED, HELD status support
- ✅ Inventory deduction on completion (prevents stock discrepancy)
- ✅ Transaction-based operations (ACID compliance)
- ✅ Supports cashier and terminal tracking
- ❌ No table/section assignment for orders
- ❌ No bill transfer/merge functionality
- ❌ No reserved stock tracking for draft orders
- ❌ Limited multi-cashier conflict handling

**Inventory Management**
- ✅ Stock adjustment with validation
- ✅ Business-level isolation
- ❌ No reservation system for draft orders
- ❌ No tracking of reserved vs available stock

### Frontend Current State
**Shift Management (`src/screens/settings/ShiftManagementScreen.tsx`)**
- ✅ UI for starting/ending shifts
- ❌ Uses mock data (not connected to backend)
- ❌ No shift requirement enforcement
- ❌ No shift summary/reporting

**Cart/Checkout Flow**
- ✅ Basic checkout with payment methods
- ❌ No "Save to Draft" option
- ❌ No way to recall/resume draft orders
- ❌ No table/customer assignment
- ❌ No bill management features

---

## Implementation Strategy

### Phase 1: Enhanced Shift Management ⭐ CRITICAL
**Goal:** Ensure all sales are properly attributed to cashier shifts

#### Backend Changes

**1.1 Update Shift Model**
```go
// backend/POS/internal/shift/model.go - ADD fields
type Shift struct {
    // ... existing fields ...
    TerminalID    *uint      `json:"terminal_id,omitempty"`  // Which device
    TotalSales    float64    `gorm:"type:decimal(12,2);default:0" json:"total_sales"`
    TransactionCount int     `gorm:"default:0" json:"transaction_count"`
    Notes         string     `json:"notes,omitempty"`
}
```

**1.2 Add Shift Services**
```go
// backend/POS/internal/shift/service.go - ADD methods
- GetShiftSummary(shiftID uint) - Returns sales, transactions during shift
- ValidateActiveShift(businessID, userID uint) - Check shift is active
- UpdateShiftMetrics(shiftID uint) - Recalculate totals from sales
```

**1.3 Middleware for Shift Validation**
```go
// backend/POS/internal/middleware/shift_guard.go - NEW FILE
func RequireActiveShift() fiber.Handler {
    // Validates cashier has active shift before allowing sales operations
    // Returns 403 if no active shift found
}
```

#### Frontend Changes

**1.4 Connect Shift Screen to Backend**
- Replace mock data with API calls
- Add shift summary display
- Show sales made during current shift
- Add alerts when shift is not active

**1.5 Enforce Shift Requirement**
- Prevent access to POS cart/checkout without active shift
- Show prominent banner when no shift is active
- Quick shift start from POS screen

---

### Phase 2: Stock Reservation System  ⭐ CRITICAL
**Goal:** Prevent stock discrepancies for draft/held orders

#### Backend Changes

**2.1 Create Stock Reservation Model**
```go
// backend/POS/internal/inventory/reservation.go - NEW FILE
type StockReservation struct {
    ID          uint      `gorm:"primaryKey"`
    ProductID   uint      `gorm:"index"`
    BusinessID  uint      `gorm:"index"`
    SaleID      uint      `gorm:"index"` // Links to draft/held sale
    Quantity    int       `json:"quantity"`
    CashierID   uint      `json:"cashier_id"`
    ExpirePeriod time.Time `json:"expire_at"` // Auto-release after X hours
    CreatedAt   time.Time
}

// Functions:
- ReserveStock(saleID, productID, quantity) error
- ReleaseReservation(saleID, productID) error
- GetAvailableStock(productID) int // CurrentStock - Reserved
- CleanExpiredReservations() // Cron job function
```

**2.2 Update Inventory Service**
```go
// backend/POS/internal/inventory/service.go - MODIFY
func GetAvailableStock(productID, businessID uint) (int, error) {
    // Current stock - reserved stock = available
}

func AdjustStock() {
    // Check available (not just current) before allowing
}
```

**2.3 Update Sale Service**
```go
// backend/POS/internal/sale/service.go - MODIFY

func AddItemToSale() {
    // When adding to DRAFT/HELD:
    // 1. Check available stock (current - reserved)
    // 2. Create reservation record
    // 3. Don't deduct inventory yet
}

func CompleteSale() {
    // When completing:
    // 1. Deduct inventory
    // 2. Delete reservation records
}

func VoidSale() {
    // Release reservations
}

func SaveToDraft() {
    // NEW: Convert cart to DRAFT status
    // Maintain reservations
}
```

---

### Phase 3: Table/Customer Assignment System
**Goal:** Support restaurant/bar table-based ordering

#### Backend Changes

**3.1 Create Table Model**
```go
// backend/POS/internal/table/model.go - NEW PACKAGE
type Table struct {
    ID          uint   `gorm:"primaryKey"`
    BusinessID  uint   `gorm:"index"`
    TableNumber string `json:"table_number"` // "T1", "VIP-3", etc
    Section     string `json:"section,omitempty"` // "Outdoor", "VIP"
    Capacity    int    `json:"capacity"`
    Status      string `gorm:"type:varchar(20);default:'available'"` // available, occupied, reserved
    CreatedAt   time.Time
    UpdatedAt   time.Time
}
```

**3.2 Update Sale Model**
```go
// backend/POS/internal/sale/model.go - ADD fields
type Sale struct {
    // ... existing fields ...
    TableID      *uint   `json:"table_id,omitempty"`
    TableNumber  string  `json:"table_number,omitempty"` // Snapshot
    OrderType    string  `gorm:"type:varchar(20);default:'dine-in'"` // dine-in, takeaway, delivery
}
```

**3.3 Table Services**
```go
// backend/POS/internal/table/service.go - NEW FILE
- CreateTable(businessID, tableNumber, section)
- ListTables(businessID)
- GetTableOrders(tableID) // Get all draft/held orders for table
- UpdateTableStatus(tableID, status)
```

---

### Phase 4: Bill Transfer & Merge  ⭐ CRITICAL
**Goal:** Allow moving orders between tables/cashiers and combining bills

#### Backend Changes

**4.1 Bill Transfer Service**
```go
// backend/POS/internal/sale/bill_transfer.go - NEW FILE

func TransferBill(saleID uint, fromTableID, toTableID uint, requestingCashierID uint) error {
    // Validation:
    // 1. Sale must be DRAFT or HELD
    // 2. Requesting cashier must have active shift
    // 3. Target table must exist
    
    // Actions:
    // 1. Update sale.TableID
    // 2. Log transfer activity
    // 3. Notify (if needed)
    
    // Stock reservations remain unchanged (same sale)
}

func MergeBills(primarySaleID uint, secondarySaleIDs []uint, targetTableID uint) error {
    // Validation:
    // 1. All sales must be DRAFT/HELD
    // 2. All must belong to same business
    // 3. Cannot merge completed sales
    
    tx := db.Begin()
    defer tx.Rollback()
    
    // Actions:
    // 1. Get primary sale
    // 2. For each secondary sale:
    //    a. Move sale_items to primary sale
    //    b. Transfer stock reservations to primary sale
    //    c. Delete secondary sale
    // 3. Recalculate primary sale totals
    // 4. Update table assignment
    // 5. Log merge activity
    
    tx.Commit()
}
```

**4.2 Activity Log Model**
```go
// backend/POS/internal/sale/activity_log.go - NEW FILE
type SaleActivityLog struct {
    ID          uint      `gorm:"primaryKey"`
    SaleID      uint      `gorm:"index"`
    BusinessID  uint      `gorm:"index"`
    ActionType  string    `json:"action_type"` // transferred, merged, voided, etc
    PerformedBy uint      `json:"performed_by"` // cashier user_id
    Details     string    `json:"details"` // JSON with from/to info
    CreatedAt   time.Time
}

func LogActivity(saleID, businessID, userID uint, actionType, details string)
func GetSaleHistory(saleID uint) []SaleActivityLog
```

---

### Phase 5: Draft Order Management UI

#### Frontend Changes

**5.1 Update Cart Screen**
```typescript
// src/screens/pos/CartScreen.tsx - ADD features

interface CartScreenProps {
  navigation: any
}

// Add state
const [tableNumber, setTableNumber] = useState<string>('')
const [customerName, setCustomerName] = useState<string>('')
const [savingDraft, setSavingDraft] = useState(false)

// Add functions
const handleSaveToDraft = async () => {
  // 1. Validate cart has items
  // 2. Show table/customer input modal
  // 3. Call API: POST /sales/draft
  // 4. Navigate back with success message
}

// Update render
// Add "Save to Draft" button alongside "Checkout"
```

**5.2 Create Draft Orders Screen**
```typescript
// src/screens/pos/DraftOrdersScreen.tsx - NEW FILE

export const DraftOrdersScreen = () => {
  // Features:
  // - List all draft/held orders
  // - Filter by cashier, table, date
  // - Actions per order:
  //   - Resume/Continue
  //   - Transfer to table
  //   - Merge with another order
  //   - Delete/Cancel
  // - Show reserved stock info
  // - Show order age/expiry
}
```

**5.3 Create Bill Management Screen**
```typescript
// src/screens/pos/BillManagementScreen.tsx - NEW FILE

export const BillManagementScreen = () => {
  // Features:
  // - Visual table layout (grid view)
  // - Show table status (available, occupied)
  // - Tap table to see orders
  // - Long-press for options:
  //   - Transfer bill
  //   - Merge with another table
  //   - View bill details
  // - Multi-select mode for merging
}
```

**5.4 Create Draft Order Service**
```typescript
// src/services/DraftOrderService.ts - NEW FILE

export class DraftOrderService {
  static async createDraft(items, tableNumber?, customerName?) {
    // POST /sales/draft
  }
  
  static async listDrafts(filters?) {
    // GET /sales?status=DRAFT,HELD
  }
  
  static async resumeDraft(saleId) {
    // GET /sales/:id
    // Load into cart
  }
  
  static async transferBill(saleId, toTableNumber) {
    // POST /sales/:id/transfer
  }
  
  static async mergeBills(primaryId, secondaryIds) {
    // POST /sales/:id/merge
  }
  
  static async deleteDraft(saleId) {
    // DELETE /sales/:id (only if DRAFT/HELD)
  }
}
```

---

### Phase 6: Backend API Endpoints

**6.1 Shift Endpoints (UPDATE)**
```
POST   /shifts/start
POST   /shifts/:id/end
GET    /shifts/active
GET    /shifts/:id/summary  ← NEW
GET    /shifts
```

**6.2 Sales Endpoints (NEW/UPDATE)**
```
POST   /sales/draft           ← NEW: Create draft order
GET    /sales/drafts          ← NEW: List all drafts (with filters)
POST   /sales/:id/resume      ← NEW: Continue editing draft
POST   /sales/:id/transfer    ← NEW: Transfer to different table
POST   /sales/:id/merge       ← NEW: Merge multiple bills
GET    /sales/:id/history     ← NEW: Activity log
DELETE /sales/:id/draft       ← NEW: Cancel draft order
```

**6.3 Table Endpoints (NEW)**
```
POST   /tables               ← Create table
GET    /tables               ← List all tables
GET    /tables/:id/orders    ← Get table's orders
PUT    /tables/:id           ← Update table
DELETE /tables/:id           ← Delete table
```

**6.4 Stock Endpoints (UPDATE)**
```
GET    /inventory/:id/available  ← NEW: Available (not reserved) stock
GET    /inventory/reservations   ← NEW: View all reservations
```

---

## Data Flow Examples

### Scenario 1: Bar Customer Orders Over Time

```
1. Cashier1 starts shift
   → POST /shifts/start {start_cash: 5000}
   → Response: {shift_id: 123, status: "open"}

2. Customer at Table 5 orders first round (2 beers)
   → Cashier adds items to cart
   → Clicks "Save to Draft"
   → Modal: "Table Number?" → "5"
   → POST /sales/draft {
       items: [{product_id: 10, quantity: 2}],
       table_number: "5"
     }
   → Backend:
     - Creates Sale (status: DRAFT, table_number: "5")
     - Creates SaleItems
     - Creates StockReservation (product: 10, qty: 2)
     - Does NOT deduct inventory
   → Response: {sale_id: 456, status: "DRAFT"}

3. 30 mins later, same customer orders food
   → Cashier opens "Draft Orders"
   → Finds Table 5 order
   → Taps "Resume"
   → Loads existing items into cart
   → Adds food items
   → Clicks "Save to Draft" again
   → PUT /sales/456 {
       items: [{product_id: 10, quantity: 2}, {product_id: 20, quantity: 1}]
     }
   → Backend:
     - Updates SaleItems
     - Creates new StockReservation for food
     - Recalculates totals

4. Customer ready to pay
   → Cashier opens draft
   → Clicks "Checkout"
   → Selects payment method
   → POST /sales/456/complete {
       payment_method: "CASH",
       amount_paid: 5000
     }
   → Backend:
     - Changes status: DRAFT → COMPLETED
     - Deducts inventory
     - Deletes all StockReservations for sale 456
     - Updates shift metrics
   → Response: Receipt
```

### Scenario 2: Merging Bills

```
Scene: Two friends at Table 1 and Table 2 want combined bill

1. Table 1 has order (sale_id: 100)
   - 3 beers, 1 burger
   - Total: ₦2500

2. Table 2 has order (sale_id: 101)
   - 2 beers, 1 pizza
   - Total: ₦3000

3. Cashier action:
   → Opens Bill Management
   → Selects Table 1 order
   → Clicks "Merge"
   → Selects Table 2 order
   → Confirms
   → POST /sales/100/merge {
       secondary_sale_ids: [101],
       target_table: "1"
     }

4. Backend process:
   tx.Begin()
   
   → Get Sale 100 and Sale 101
   → Validate both are DRAFT/HELD
   
   → Move sale_items from 101 to 100:
     UPDATE sale_items SET sale_id = 100 WHERE sale_id = 101
   
   → Transfer reservations:
     UPDATE stock_reservations SET sale_id = 100 WHERE sale_id = 101
   
   → Recalculate Sale 100:
     Subtotal: ₦5500
     Total: ₦5500
   
   → Delete Sale 101
   
   → Log activity:
     INSERT INTO sale_activity_logs {
       sale_id: 100,
       action_type: "merged",
       details: '{"merged_from": [101], "merged_by": "cashier1"}'
     }
   
   → Update table status
   
   tx.Commit()

5. Response: Updated sale 100 with all items
```

---

## Stock Discrepancy Prevention

### Problem Scenarios & Solutions

**Problem 1: Two cashiers sell last unit simultaneously**

❌ Without Reservations:
```
Stock: 1 unit
Cashier1: Checks stock (1 available) → Adds to cart
Cashier2: Checks stock (1 available) → Adds to cart
Cashier1: Completes → Stock: 0
Cashier2: Completes → Stock: -1 ❌ OVERSOLD
```

✅ With Reservations:
```
Stock: 1 unit, Reserved: 0
Cashier1: Adds to draft → Reserved: 1, Available: 0
Cashier2: Tries to add → Error: "Insufficient stock"
Cashier1: Completes → Stock: 0, Reserved: 0
```

**Problem 2: Draft orders tying up stock**

Solution: Auto-expiry reservation
```go
// Cron job runs every hour
func CleanExpiredReservations(db *gorm.DB) {
    // Delete reservations older than 4 hours for DRAFT orders
    // Notify cashier that reservation was released
    
    db.Where("created_at < ? AND sale_id IN (?)", 
        time.Now().Add(-4*time.Hour),
        db.Model(&Sale{}).Select("id").Where("status = ?", "DRAFT")
    ).Delete(&StockReservation{})
}
```

**Problem 3: Voiding completed sale**

✅ Solution: Restore stock in transaction
```go
func VoidSale() {
    tx.Begin()
    
    // 1. Get sale items
    // 2. For each item: inventory.AdjustStock(+quantity)
    // 3. Update sale status = VOIDED
    // 4. Log activity
    
    tx.Commit()
}
```

---

## Database Schema Changes

### New Tables

```sql
-- Stock Reservations
CREATE TABLE stock_reservations (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    business_id INTEGER NOT NULL,
    sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    cashier_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expire_at TIMESTAMP,
    INDEX idx_product_business (product_id, business_id),
    INDEX idx_sale (sale_id)
);

-- Tables
CREATE TABLE tables (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL,
    table_number VARCHAR(20) NOT NULL,
    section VARCHAR(50),
    capacity INTEGER DEFAULT 4,
    status VARCHAR(20) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_id, table_number)
);

-- Activity Logs
CREATE TABLE sale_activity_logs (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    business_id INTEGER NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    performed_by INTEGER NOT NULL REFERENCES users(id),
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sale (sale_id),
    INDEX idx_business_date (business_id, created_at)
);
```

### Modified Tables

```sql
-- Update shifts table
ALTER TABLE shifts ADD COLUMN terminal_id INTEGER;
ALTER TABLE shifts ADD COLUMN total_sales DECIMAL(12,2) DEFAULT 0;
ALTER TABLE shifts ADD COLUMN transaction_count INTEGER DEFAULT 0;
ALTER TABLE shifts ADD COLUMN notes TEXT;

-- Update sales table
ALTER TABLE sales ADD COLUMN table_id INTEGER REFERENCES tables(id);
ALTER TABLE sales ADD COLUMN table_number VARCHAR(20);
ALTER TABLE sales ADD COLUMN order_type VARCHAR(20) DEFAULT 'dine-in';
ALTER TABLE sales ADD COLUMN shift_id INTEGER REFERENCES shifts(id);
```

---

## Implementation Order (Recommended)

### Week 1: Foundation
- [ ] Create stock reservation model & migration
- [ ] Implement reservation service (reserve, release, available stock)
- [ ] Create table model & migration  
- [ ] Add new fields to Sale model (table_id, shift_id)
- [ ] Create activity log model & migration

### Week 2: Core Sale Logic
- [ ] Update AddItemToSale to create reservations (not deduct stock)
- [ ] Update CompleteSale to deduct stock and release reservations
- [ ] Update VoidSale to restore stock
- [ ] Implement SaveToDraft functionality
- [ ] Implement ResumeDraft functionality
- [ ] Add middleware for shift validation

### Week 3: Bill Management
- [ ] Implement TransferBill service
- [ ] Implement MergeBills service  
- [ ] Create table CRUD services
- [ ] Add activity logging to all operations
- [ ] Create API routes for bill management

### Week 4: Frontend - Shift Management
- [ ] Connect ShiftManagementScreen to API
- [ ] Add shift validation middleware on frontend
- [ ] Show shift status in POS screens
- [ ] Add shift summary reporting

### Week 5: Frontend - Draft Orders
- [ ] Add "Save to Draft" to CartScreen
- [ ] Create DraftOrdersScreen
- [ ] Implement resume draft functionality
- [ ] Add draft order indicators on POS

### Week 6: Frontend - Bill Management
- [ ] Create BillManagementScreen
- [ ] Implement table grid view
- [ ] Add transfer bill UI
- [ ] Add merge bills UI
- [ ] Create table management screen for settings

### Week 7: Polish & Testing
- [ ] Add auto-expiry cron job for reservations
- [ ] Comprehensive testing (multi-cashier scenarios)
- [ ] Add notifications for bill transfers
- [ ] Performance optimization
- [ ] Documentation

---

## Testing Checklist

### Stock Reservation Tests
- [ ] Reserve stock when adding to draft
- [ ] Release stock when deleting draft
- [ ] Prevent overselling when stock is reserved
- [ ] Auto-expire old reservations
- [ ] Handle reservation edge cases (sale deleted, product deleted)

### Multi-Cashier Tests
- [ ] Two cashiers cannot sell reserved stock
- [ ] Cashier A can resume only their drafts
- [ ] Shift requirement is enforced
- [ ] Concurrent sale completion (race conditions)

### Bill Management Tests
- [ ] Transfer bill updates all references correctly
- [ ] Merge bills combines items and reservations
- [ ] Cannot merge completed sales
- [ ] Activity log records all actions
- [ ] Table status updates correctly

### Edge Cases
- [ ] What if customer leaves without paying (draft cleanup?)
- [ ] What if cashier forgets to end shift?
- [ ] What if reservation expires mid-checkout?
- [ ] What if table is deleted with active orders?

---

## Security Considerations

1. **Authorization**
   - Only owner/manager can delete draft orders from other cashiers
   - Only owner/manager can merge bills
   - All cashiers can transfer bills (with logging)

2. **Audit Trail**
   - All bill transfers logged with who, when, why
   - All merges logged with original sale IDs
   - Void reasons required and logged

3. **Data Integrity**
   - Use database transactions for all multi-step operations
   - Foreign key constraints to prevent orphaned data
   - Soft delete for sales (keep history)

---

## Performance Considerations

1. **Indexes**
   ```sql
   CREATE INDEX idx_reservations_product ON stock_reservations(product_id, business_id);
   CREATE INDEX idx_sales_status ON sales(status, business_id);
   CREATE INDEX idx_sales_table ON sales(table_id, status);
   ```

2. **Caching**
   - Cache available stock calculations (invalidate on reservation changes)
   - Cache table status (invalidate on order status changes)

3. **Query Optimization**
   - Use joins to fetch sales with items in single query
   - Paginate draft order lists
   - Limit activity log retention (archive after 90 days)

---

## Rollback Plan

If issues arise:

1. **Phase 1 Rollback**: Disable shift requirement middleware
2. **Phase 2 Rollback**: Disable reservation system (revert to direct stock deduction)
3. **Phase 3-4 Rollback**: Hide bill management features
4. **Database Rollback**: Migrations include DOWN scripts

---

## Success Metrics

After implementation, monitor:

1. **Stock Accuracy**
   - Inventory discrepancy reports (should be zero)
   - Oversold incidents (should be zero)

2. **Operational Efficiency**
   - Average time to complete sale
   - Draft order conversion rate
   - Bill merge frequency

3. **User Adoption**
   - % of sales using draft feature
   - % of shifts closed properly
   - Table assignment usage

---

## Documentation Needs

1. **User Manual**
   - How to start/end shifts
   - How to save and resume drafts
   - How to transfer and merge bills
   - How to manage tables

2. **API Documentation**
   - Update Swagger docs with new endpoints
   - Add examples for each operation

3. **Developer Docs**
   - Stock reservation system architecture
   - Bill merge algorithm explanation
   - Database schema diagrams

---

## Conclusion

This implementation provides:

✅ **Stock Accuracy**: Reservation system prevents overselling  
✅ **Multi-Cashier Support**: Each cashier tracked with shifts and logs  
✅ **Operational Flexibility**: Draft orders, bill transfers, merges  
✅ **Audit Trail**: Complete activity logging  
✅ **Scalability**: Handles multiple terminals and cashiers  

The phased approach allows for incremental testing and reduces risk of breaking existing functionality.
