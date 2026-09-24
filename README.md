# Feedants - Competition Details Feature

A dynamic, production-grade full-stack mobile feature for viewing and participating in competitions, built as part of the Feedants Technical Assignment.

---

## Technical Stack

- **Frontend Mobile:** React Native (TypeScript, Context API / Custom Hooks)
- **Backend:** Node.js, Express.js (TypeScript, Zod Validation)
- **Database:** MongoDB (Mongoose ORM)

---

## Features

- **Dynamic Competition Screen:** Fetches and renders live competition details, prize pools, timeline dates, judge information, and reward structures directly from the database.
- **Real-Time Countdown:** Live dynamic timer tracking remaining registration time.
- **State-Driven UI & CTA Logic:** Context-aware main button dynamically switching between `Register Now`, `Upload Submission`, `Registration Closed`, or `Submissions Closed` based on user status and competition lifecycle.
- **Concurrency & Race Condition Controls:** High-throughput backend endpoint preventing overbooking during peak concurrent registrations via atomic MongoDB updates.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://localhost:27017` or Atlas URI)
- Expo Go app or React Native emulator (iOS/Android)

---

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
