# Creator Tool -- Business Requirements Document (BRD)

## 1. Context

Creator Tool là module cho phép người dùng (Criminal) tạo vụ án logic
trên Detective Reasoning Platform.

Mục tiêu: - Tạo case hợp lệ trong ≤15 phút - Đảm bảo có thể self-solve -
Không có logic hole - Không expose culprit

------------------------------------------------------------------------

## 2. Business Objectives

### Primary Objective

Cho phép user tạo case hợp lệ với tỷ lệ publish thành công ≥60%.

### Secondary Objectives

-   Giảm case rác \<15%
-   Đảm bảo mỗi case có ít nhất 1 contradiction path
-   Tăng retention Creator ≥30%

------------------------------------------------------------------------

## 3. Scope

### In Scope

-   Wizard-based builder
-   Suspect setup
-   Statement creation
-   Clue creation
-   Contradiction mapping
-   Self-solve validation
-   Publish pipeline

### Out of Scope

-   AI auto-generate full case
-   Realtime collaboration
-   Version control case history

------------------------------------------------------------------------

## 4. Functional Requirements

### FR-01: Basic Case Info

-   Title (≥5 characters)
-   Description (≥20 characters)
-   Difficulty (Easy/Medium/Hard)
-   Category template (optional)

------------------------------------------------------------------------

### FR-02: Suspect Setup

-   ≥2 suspects required
-   Exactly 1 culprit
-   Culprit stored server-side only

------------------------------------------------------------------------

### FR-03: Statement Creation

-   ≥1 statement per suspect
-   Statement linked to suspect
-   Optional: timestamp, location

------------------------------------------------------------------------

### FR-04: Clue Creation

-   ≥2 clues required
-   Fields: title, description, optional media

------------------------------------------------------------------------

### FR-05: Contradiction Mapping

-   ≥1 contradiction required
-   Structure: Clue A → contradicts → Statement B
-   Stored in contradictions table

------------------------------------------------------------------------

### FR-06: Logical Integrity Validation

Before publish:

1.  Culprit reachable
2.  No dead graph
3.  Self-solve required

------------------------------------------------------------------------

## 5. User Flow

1.  Create Case
2.  Add Suspects
3.  Add Statements
4.  Add Clues
5.  Link Contradictions
6.  Self-Solve
7.  Publish

------------------------------------------------------------------------

## 6. Validation Rules

### VR-01: Minimum Structure

-   suspects \<2 → error
-   contradictions \<1 → error

### VR-02: Culprit Isolation

Non-culprit suspects must be logically eliminable.

### VR-03: Publish Gate

Publish enabled only if: - All required fields complete - Self-solve
successful - No validation errors

------------------------------------------------------------------------

## 7. Non-Functional Requirements

-   Save state \<300ms
-   Auto-save every 10 seconds
-   No culprit leak via API
-   Support ≥100k cases

------------------------------------------------------------------------

## 8. Error Handling

-   Delete linked clue → warning + auto-remove link
-   Remove culprit → force reselect
-   Disconnected graph → highlight node red
-   Missing contradiction → block publish

------------------------------------------------------------------------

## 9. KPIs

-   Publish rate ≥60%
-   Avg creation time ≤15 min
-   Detective solve rate 40--70%
-   Case rating ≥4/5 for ≥50% cases

------------------------------------------------------------------------

## 10. Strategic Insight

Creator Tool = CMS + Logic Compiler nhẹ.

Nếu user bình thường tạo được case hợp lệ trong 15 phút → unlock network
effect.
