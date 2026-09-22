# Changelog

All notable changes to the **SLSU CAS Mobile** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned Features

- Hard exclusive time-slot locking engine to prevent simultaneous slot collisions under high traffic.
- Push notification triggers for appointment status updates and specialist approvals.
- Blackout date engine auto-populated from public holiday APIs and manual admin closures.
- No-show tracking and patient attendance analytics.

---

## [1.0.0] - 2026-09-21

### Added

- **Authentication & Pre-Login Experience:**
  - Sanctum-based authentication (`Api\AuthController`) supporting username-based authentication across all user roles.
  - Public availability preview endpoint (`Api\PublicController@upcomingAvailability`) displaying open capacity on the login screen.
  - Bottom-sheet modal login interface to preserve the availability preview as primary screen content.
- **Scheduling & Booking Engine:**
  - Restructured Schedule model representing `(specialist, service, date)` tuples with staff-configurable daily quotas.
  - Dynamic per-slot time capacity calculation with remaining-count badges and disabled states for filled slots.
  - Instant auto-confirmation booking logic for services with `requires_approval = false`.
  - Row-locked database transactions (`lockForUpdate`) protecting booking submissions against race conditions.
  - Patient booking flow: Service selection -> Schedule/Date -> Slot selection -> Gender/Personal detail confirmation -> Submission.
- **Specialist & Patient Workspaces:**
  - Specialist `My Schedule` screen with native date/time pickers and scoped schedule queries (`?mine=true`).
  - Specialist `Appointments` screen for managing pending requests, issuing approvals/rejections, and recording diagnostic notes (_findings_).
  - Patient `My Appointments` screen featuring booking history, cancellation controls, inline findings viewer, and an 8-criteria star rating form (`rate.tsx`).
  - Dedicated `Cancelled` status (5) distinct from `Rejected` (4) for precise status auditing.
- **Architecture & Mobile Infrastructure:**
  - Role-based tab bar layout using `options={{ href: null }}` to safely hide non-applicable screens without routing errors.
  - Role-specific home dashboards for Patients, Specialists, and Admins.
  - Global 401 response interceptor in `apiFetch` triggering automatic session clearing and redirection.
  - Enforced `ForceJsonResponse` middleware across the API route group.

### Fixed

- **Field Persistence & Models:**
  - Fixed `preferred_time` missing from `Appointment::$fillable`, which previously caused time slots to drop silently on booking.
  - Cast `quota` and numeric properties to explicit integer types on write and added `$casts` array declarations on the `Schedule` model.
  - Fixed reversed foreign/local keys on the `Specialist::user()` relationship that caused specialist names to return as `null`.
- **Database Compatibility:**
  - Switched MySQL-specific `DATE_FORMAT()` function calls in `Api\ScheduleController@availability` to PostgreSQL-compliant `TO_CHAR()`.
  - Fixed column name typo (`data` -> `date`) in `Api\ScheduleController@index` causing HTTP 500 errors.
- **Authorization & Controller Logic:**
  - Removed invalid `Schedule $schedule` route-model binding from `Api\ScheduleController@store` where no route parameter existed.
  - Refactored `Api\AppointmentController@cancel` authorization (`authorizeCancel`) to grant cancellation rights to both the booking patient and assigned specialist.
  - Added unconstrained query handling for Admin accounts (`account_type == 1`) in `Api\AppointmentController@index` to ensure clinic-wide visibility.
