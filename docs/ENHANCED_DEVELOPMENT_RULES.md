# 🛡️ Enhanced Development Rules — Locate-Family-Connect

These rules foster a robust, maintainable, and secure codebase for Locate-Family-Connect, emphasizing clarity, modularity, testability, and security best practices.

---

## 1. 🧱 Domain Modeling and Clean Code

### 1.1. 💎 Embrace Value Objects
Represent core domain concepts using dedicated value object classes.

```typescript
class EmailAddress {
  constructor(readonly value: string) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new Error('Invalid email address');
    }
  }
}
class Email {
  constructor(readonly to: EmailAddress, readonly subject: string, readonly body: string) {}
}
function sendEmail(email: Email) {}
```
**Benefits:** Type safety, explicit validation, readability, easier refactoring.

---

### 1.2. 📦 Encapsulate Collections
Wrap arrays/maps in collection classes to enforce domain-specific behavior.

```typescript
class GuardianList {
  private guardians: GuardianId[] = [];
  addGuardian(guardianId: GuardianId): void {
    if (this.guardians.includes(guardianId)) return;
    this.guardians.push(guardianId);
    this.enforceMaximumGuardians();
  }
  getGuardians(): GuardianId[] { return [...this.guardians]; }
  private enforceMaximumGuardians() {
    if (this.guardians.length > 5) throw new Error('Maximum number of guardians reached.');
  }
}
```
**Benefits:** Control, semantics, reduced side effects.

---

### 1.3. 🚶‍♂️ Navigate with Delegation, Not Deep Chains
Follow the Law of Demeter; avoid long method chains.

```typescript
class PostalCode { /* ... */ }
class Address { /* ... */ }
class UserProfile { /* ... */ }
class User { /* ... */ }
const zipCode = user.getPostalCode();
```
**Benefits:** Lower coupling, more resilient, easier to test.

---

### 1.4. ✍️ Speak Clearly: No Abbreviations
Use full, descriptive names for all identifiers.

```typescript
const userId: UserId = '...';
const locationHistory = getLocationHistory(userId, startDate, endDate);
```
**Benefits:** Readability, less ambiguity, faster comprehension.

---

### 1.5. ✂️ Small and Singular Classes
Limit classes to max 50 lines and two instance variables.

```typescript
class GeocodingService { /* ... */ }
class LocationRepository { /* ... */ }
```
**Benefits:** Cohesion, low coupling, testability, maintainability.

---

## 2. 🗺️ Logical Flows and Architectural Clarity

### 2.1. 🪜 Flatten Logic: One Indentation Level
Extract inner blocks into helper functions for clarity.

### 2.2. 🎯 Single Responsibility per File
Each file/module should represent a single concept/service.

### 2.3. 🏷️ Explicit Interface Definitions
Use the `I` prefix for interfaces only if a concrete class with the same name exists.

### 2.4. 🚦 Role-Based Logic Separation
Organize code by user role (guardian, student, developer) in distinct directories.

---

## 3. 🧪 Testability and Developer Guidance

### 3.1. ✅ Design for Testability
Use dependency injection, avoid hidden dependencies.

### 3.2. 🧠 Domain Logic First, Adapters Later
Keep business logic pure; use adapters for external APIs.

### 3.3. 🧭 Code as a Guide
Write self-explanatory code with clear, short methods.

---

## 4. 🔒 Security and Trust by Design

### 4.1. 🛡️ Validate All Inputs and Outputs
Validate every request/response with Zod schemas and enforce RLS policies.

### 4.2. 🔑 Secure Critical Logic with SECURITY DEFINER
Sensitive logic (e.g., location sharing) must be in PostgreSQL functions with `SECURITY DEFINER` and JWT validation.

---

## 5. 📜 API Route Documentation

### 5.1. 🔑 Public Routes
- **/login** — Login page (public)
- **/register** — User registration (public)
- **/password-recovery** — Password recovery (public)

### 5.2. 🔐 Protected Routes
- **/dashboard** — Main dashboard (all authenticated users)
- **/student/dashboard** — Student dashboard (students only)
- **/student-dashboard** — Redirect to `/student/dashboard` (students only)
- **/guardian/dashboard** — Guardian dashboard (parents/guardians only)
- **/student/map/:id** — Student map view (students only, param: student ID)

### 5.3. 👨‍💻 Developer Routes
- **/webhook-admin** — Webhook admin (developers only)
- **/developer-flow** — Developer flow (developers only)
- **/api-docs** — API documentation (developers only, protected by Basic Auth)

### 5.4. 🔄 Redirect and Compatibility Routes
- **/** — Home: redirects to `/dashboard` if authenticated, `/login` if not
- **/webhook-admin** — Redirects to `/admin/webhook` (compatibility)
- **\*** — 404 page for unmatched routes

---

## 6. 🛡️ Route Security Components
- `AuthenticatedRoute`: Protects routes by user type
- `DeveloperRoute`: Restricts access to developer-only routes
- `RouterProvider`: React Router v6 manager
- `createBrowserRouter`: React Router v6 router creator

---

## 7. 🔐 Security Notes
- All protected routes are validated via `AuthenticatedRoute`
- Developer routes are restricted to users with type `developer`
- Redirects use React Router's `Navigate`
- The root route (`/`) handles loading and redirection logic

---

**By following these rules, Locate-Family-Connect ensures a codebase that is robust, secure, maintainable, and easy to extend for all user roles and business needs.** 