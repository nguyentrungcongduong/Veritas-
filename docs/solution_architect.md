# Solution Architecture: The "Dual Identity" System
*Project: Veritas - The Daily Deduction*

## 1. Core Concept: Dual Track
Instead of a rigid class choice (Detective vs. Criminal), every user embodies a **Dual Identity**.
- **Fame (Thám tử):** Increased by accurately solving cases, writing robust analytical deductions, and identifying contradictions.
- **Infamy (Tội phạm):** Increased by creating complex cases that stump investigators, adding misleading evidence, and outsmarting the community.

## 2. Context-Based Role Switching
The system adapts the interface based on the user's current activity, driven by a `ModeToggle` (Context Provider).

*   **Detective Mode:**
    *   **Trigger:** User clicks "ENTER THE AGENCY" or views active cases.
    *   **Theme:** Light/Off-white background, classic noir typewriter fonts, clear visibility (focus on logic).
    *   **Role:** Investigator.
*   **Criminal Mode:**
    *   **Trigger:** User clicks "PLAN A HEIST" or enters the Creator Tool.
    *   **Theme:** Dark/Charcoal/Black background, cryptic or chaotic aesthetics, hidden elements (focus on deception).
    *   **Role:** Mastermind.

## 3. Dynamic Visual Cues
Depending on which stat is higher (`Fame` > `Infamy` or vice versa), the dashboard greets the user differently:

*   **The Law (Fame Dominant):**
    *   Greeting: *"Welcome back, Agent [Name]. 12 unsolved cases await your logic."*
    *   Avatar: Blue/Silver border.
*   **The Crime (Infamy Dominant):**
    *   Greeting: *"Greetings, Mastermind. Your latest heist has fooled 85% of investigators."*
    *   Avatar: Red border or a subtle static/glitch effect.

## 4. UI/UX "The Dossier" Profile Page
The user profile is not a standard web page; it is a **Dossier File** (Hồ sơ lưu trữ) featuring an interactive 3D CSS Flip Card:
*   **Front (The Law):** Detective Badge, Case solving history, Fame score.
*   **Back (The Crime):** Wanted Poster, Created cases statistics, Infamy score.

## 5. Technical Implementation Blueprint

### Database (Laravel)
Create a new table `user_stats` linked to the `users` table:
```php
Schema::create('user_stats', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->integer('fame')->default(0);
    $table->integer('infamy')->default(0);
    $table->timestamps();
});
```
*Permissions check can leverage these stats to determine unlockable features (e.g., must have 100 Fame to access Tier 2 evidence).*

### Frontend State (Next.js & React)
Use `Zustand` or React Context to hold the current `mode` (detective | criminal).
```tsx
type AppMode = 'detective' | 'criminal';
const useModeStore = create<{ mode: AppMode, setMode: (m: AppMode) => void }>(...)
```
Conditionally apply Tailwind classes (or use a data-theme attribute on `<html>`) based on this state.

---
*End of Blueprint. "Sếp" approved!*
