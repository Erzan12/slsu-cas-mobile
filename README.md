# 🏥 SLSU CAS Mobile (v1.0.0)

A mobile-first companion application for the **Southern Leyte State University Clinic Appointment System (SLSU CAS)**. Built with **Expo** and **React Native**, consuming the existing **Laravel + PostgreSQL** backend over a token-authenticated JSON API.

SLSU CAS digitizes the university clinic's appointment workflow — patients book consultations, dressing, certificates, and other medical services online instead of walking in; specialists manage daily availability; findings and post-visit ratings are captured digitally.

---

## 🚀 Key Features in v1.0.0

- **🔓 Public Availability Preview:** Pre-login screen doubles as a live availability preview, allowing anyone to view open clinic capacity over the next few days. Logging in is handled seamlessly via a bottom-sheet modal.
- **🛡️ Smart Capacity & Quota Protection:** Prevents appointment pile-ups by auto-computing a fair per-slot capacity based on daily specialist quotas. Full time slots are displayed, disabled, and labeled with remaining counts.
- **⚡ Instant Auto-Confirmations:** Appointments confirm immediately upon booking unless a specific service is explicitly flagged as `requires_approval`.
- **🩺 Complete Specialist Workflow:** Specialists can declare availability per service, manage incoming requests, approve/reject bookings, and log diagnostic findings directly from their mobile devices.
- **⭐ Patient Feedback & Visit Ledger:** Patients can track booking history, review specialist notes/findings, cancel pending or approved appointments, and submit post-visit ratings across 8 service-quality criteria.
- **🔒 Role-Based Navigation & Session Security:** Dedicated tab layouts for Patient, Specialist, and Admin. Expired or revoked tokens trigger graceful automatic logouts to prevent uncaught runtime errors.

---

## 🛠️ Tech Stack & Architecture

| Layer                 | Technology                               |
| :-------------------- | :--------------------------------------- |
| **Mobile App**        | Expo (Expo Router, TypeScript)           |
| **Navigation**        | `expo-router` (File-based routing)       |
| **Date/Time Pickers** | `@react-native-community/datetimepicker` |
| **Auth Storage**      | `expo-secure-store`                      |
| **Icons**             | `@expo/vector-icons` (`Ionicons`)        |
| **Backend API**       | Laravel (PHP)                            |
| **Database**          | PostgreSQL                               |
| **API Auth**          | Laravel Sanctum (Bearer Tokens)          |

---

## 📂 Project Structure

```text
slsu-cas-mobile/
├── app/
│   ├── (auth)/
│   │   └── login.tsx           # Public availability preview + bottom-sheet login modal
│   ├── (tabs)/
│   │   ├── _layout.tsx         # Tab bar layout & role-based visibility (href: null pattern)
│   │   ├── index.tsx           # Home — Role-specific dashboard
│   │   ├── book.tsx            # Patient — Service -> Schedule -> Slot -> Confirm
│   │   ├── my-appointments.tsx # Patient — History, cancel, view findings, rate
│   │   ├── my-schedule.tsx     # Specialist — Create & view own availability
│   │   └── appointments.tsx    # Specialist — Approve/reject, record findings
│   ├── appointment/
│   │   └── [id]/
│   │       └── rate.tsx        # 8-criteria star rating screen
│   └── _layout.tsx             # Root layout — AuthProvider + auth-gated routing
├── api/
│   ├── client.ts                # apiFetch() / apiFetchPublic(), 401 auto-logout handler
│   └── types.ts                 # Shared API response contracts & interfaces
├── hooks/
│   └── useAuth.tsx              # Auth context — Login, logout, persisted session state
├── components/
├── constants/
└── app.json
```

---

## 🔑 Roles & Tab Visibility Matrix

| Tab                 | Admin | Specialist | Patient |
| :------------------ | :---- | :--------- | :------ |
| **Home**            | ✅    | ✅         | ✅      |
| **Book**            | ❌    | ❌         | ✅      |
| **My Appointments** | ❌    | ❌         | ✅      |
| **My Schedule**     | ❌    | ✅         | ✅      |
| **Appointments**    | ❌    | ✅         | ✅      |

```text
Note: Heavy administrative CRUD operations (managing services, specialists, and patient registers) remain on the web dashboard for v1.0.0. The Admin mobile experience provides a read-only, clinic-wide summary.
```

---

## 🔄 Appointment Lifecycle States

---

## 🗺️ Roadmap & Future Improvements

- **🔒 Hard Slot-Locking:** Upgrade soft per-slot capacity pooling to true exclusive time-slot locking if concurrency demands it.
- **🔔 Push Notifications:** Automated reminders for upcoming appointments and real-time alerts for approval/rejection events.
- **🗓️ Blackout & Holiday Integration:** Automatic blocking of clinic hours on national holidays via integration with holiday APIs, alongside manual admin closure toggles.
- **📊 Analytics & Export Tools:** Admin CSV export for date-range appointment logs and a dedicated findings/ratings analytical dashboard.

---

## 🔗 Related Mobile Systems

This project is part of a unified suite of university mobile applications built on a shared architectural pattern (Laravel + Sanctum + Expo):

1. **QCAMS Mobile** — QR Code Attendance Management System
2. **SLSU CAS Mobile** - University Clinic Appointment System
3. **Livestock Profiling & Tagging System** - Agricultural Management System

## 👤 Author
**Erzan**
* **GitHub: https://github.com/Erzan12**
* **Portfolio: https://erzan-dev.vercel.app/**
