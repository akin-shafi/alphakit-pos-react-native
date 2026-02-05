# Phase 3 Implementation Plan

## Date: February 4, 2026
## Phase: 3 - Frontend Integration
## Status: 🚧 IN PROGRESS

---

## Week 3: Shift Management UI

### 1. Shift Service (Frontend)
- Create `src/services/ShiftService.ts`
- Implement `startShift`, `endShift`, `getShiftSummary`, `checkActiveShift`

### 2. Shift Context
- Update `AuthContext` or create `ShiftContext`
- Track `activeShiftId` globally

### 3. Shift Screen
- Update `src/screens/settings/ShiftManagementScreen.tsx`
- Connect to real API
- Show statistics

### 4. Shift Enforcement
- Update `CartScreen` or `POSNavigator`
- Block sales if no active shift

---

## Week 4: Draft Orders UI

### 1. Draft Service
- Create `src/services/DraftService.ts`

### 2. Cart Screen Update
- Add "Save to Draft" button
- Handle saving with table number

### 3. Draft Orders Screen
- List draft orders
- Resume draft order

---

## Week 5: Bill Management UI

### 1. Transfer Bill UI
- Select target table

### 2. Merge Bill UI
- Select bills to merge

---

## Progress Log

- [x] Created Phase 3 Plan
- [x] Located Frontend Files
- [x] Validated Backend Routes
- [x] Implemented Shift Service
- [x] Updated AuthContext
- [x] Connected ShiftManagementScreen
- [x] Enforced Shift in POSHomeScreen
