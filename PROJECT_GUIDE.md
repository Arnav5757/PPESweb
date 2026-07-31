# PROJECT_GUIDE.md

# Pareek Public English School ERP

> Production-grade School Management & Student Portal built with the MERN Stack.

---

# Project Vision

The objective of this project is to develop a modern, scalable, and maintainable School ERP that provides a premium public website together with a complete management system for administrators, teachers, students, and (in future) parents.

The project should demonstrate professional software engineering practices while remaining practical for a real educational institution.

---

# Tech Stack

## Frontend

* React
* Vite
* Tailwind CSS
* React Router
* Framer Motion

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcrypt

## Development Tools

* Git
* GitHub
* VS Code
* Postman
* MongoDB Atlas

---

# Project Modules

## Public Website

* Home
* About
* Admissions
* Gallery
* Contact

## Student Portal

* Login
* Dashboard
* Profile
* Notices
* Gallery
* Attendance *(Planned)*
* Results *(Planned)*

## Admin Dashboard

* Dashboard
* Student Management
* Notice Management
* Gallery Management
* Admission Management
* Analytics

## Future Modules

* Teacher Portal
* Parent Portal
* Attendance System
* Results Management
* Assignments
* Events Calendar
* Timetable
* Document Management

---

# Frontend Architecture

```
src/

assets/
    images/
    icons/

components/
    Navbar/
    Hero/
    Highlights/
    InfoSection/
    Footer/
    ui/

pages/

layouts/

contexts/

hooks/

services/

utils/

constants/

routes/

App.jsx
main.jsx
```

---

# Backend Architecture

```
school-backend/

config/

controllers/

middleware/

models/

routes/

utils/

server.js
```

---

# Coding Conventions

## React

* Functional Components only
* Hooks only
* No Class Components
* Small focused components
* One responsibility per component
* Prefer composition over inheritance

---

## Naming

Components

```
Hero.jsx
Navbar.jsx
GalleryCard.jsx
```

Hooks

```
useAuth.js
useScroll.js
```

Services

```
noticeService.js
galleryService.js
```

Contexts

```
AuthContext.jsx
```

Constants

```
navigation.js
colors.js
sections.js
```

---

## Folder Rules

Pages compose components.

Components never contain routing logic.

Layouts define page structure.

Services contain API calls.

Contexts manage global state.

Utilities contain helper functions only.

Constants store reusable values.

---

# UI & UX Guidelines

The design language should resemble:

* Apple
* Stripe
* Linear
* Modern university websites

Characteristics:

* Minimal
* Elegant
* Spacious
* Professional
* Accessible
* Responsive

Avoid:

* Heavy gradients
* Neon colors
* Excessive animations
* Glassmorphism overload
* Fake statistics
* Unrealistic content

---

# Color Palette

Primary

```
#2563EB
```

Text

```
#0F172A
```

Muted

```
#64748B
```

Background

```
#FFFFFF
```

Surface

```
#F8FAFC
```

Border

```
#E2E8F0
```

Error

```
#DC2626
```

Success

```
#16A34A
```

---

# Typography

Primary Font

Modern sans-serif (Inter or similar).

Hierarchy

* H1
* H2
* H3
* Body
* Caption

Maintain consistent spacing and readable typography.

---

# Component Rules

Every component should:

* Have one responsibility
* Be reusable where appropriate
* Avoid duplicated styling
* Use semantic HTML
* Support accessibility
* Remain lightweight

Do not create reusable components unless multiple pages require them.

---

# Routing Rules

Public pages use PublicLayout.

Portal pages use PortalLayout.

Admin pages use AdminLayout.

Avoid business logic inside routing.

---

# API Conventions

RESTful naming.

Examples:

GET /api/notices

POST /api/notices

PUT /api/notices/:id

DELETE /api/notices/:id

GET /api/students

POST /api/students

Never change API contracts without approval.

---

# Backend Rules

Use:

Models

↓

Controllers

↓

Routes

↓

Middleware

Keep server.js minimal.

Environment variables must be stored in `.env`.

Never hardcode:

* MongoDB URI
* JWT Secret
* Passwords

---

# Authentication Rules

JWT based authentication.

Role Based Access Control.

Roles:

* Admin
* Student

Future:

* Teacher
* Parent

Authentication logic should remain outside presentation components.

---

# State Management

Global state belongs inside Context.

Component state remains local whenever possible.

Avoid prop drilling.

---

# Error Handling

Always provide:

* Loading state
* Empty state
* Error state

Never fail silently.

---

# Performance Rules

Prefer readability first.

Optimize only when necessary.

Avoid premature optimization.

Reuse components whenever practical.

---

# Accessibility

Support:

* Keyboard navigation
* Focus states
* ARIA attributes
* Semantic HTML

Accessibility is required, not optional.

---

# Development Roadmap

## Phase 1

Public Website

* Premium Navbar
* Hero
* Why Choose Us
* Director Message
* Dynamic Notice Board
* Gallery
* Contact
* Footer

---

## Phase 2

Authentication

Student Login

Admin Login

Role Based Access

---

## Phase 3

Admin ERP

Student Management

Admission Workflow

Notice Management

Gallery Management

Analytics Dashboard

---

## Phase 4

Student Portal

Profile

Attendance

Results

Assignments

Downloads

Settings

---

## Phase 5

Teacher Portal

Attendance

Assignments

Marks Upload

Student Communication

---

## Phase 6

Advanced Features

Parent Portal

Email Notifications

Document Upload

Excel Import/Export

Activity Logs

ID Card Generator

Performance Analytics

---

# Current Phase

Current milestone:

**Phase 1 – Public Website Modernization**

Primary objective:

Deliver a premium, responsive, production-quality school website before expanding the ERP.

---

# Future Features

* Teacher Portal
* Parent Portal
* Attendance Management
* Results Management
* Assignment Module
* Calendar
* Timetable
* Document Management
* Activity Logs
* Notifications
* Search
* PDF Generation
* Excel Import/Export

Implement only after the previous phases are complete.

---

# Things That Must Not Change Without Approval

* Existing backend API contracts
* MongoDB schema structure
* Authentication flow
* Folder architecture
* Routing architecture
* Design language
* Navigation structure
* Environment variable usage
* Naming conventions

Do not introduce breaking changes or unnecessary dependencies.

---

# Development Principles

Before writing code:

1. Understand the existing implementation.
2. Reuse existing components where possible.
3. Refactor only when it improves maintainability.
4. Preserve working functionality.
5. Keep components focused and readable.
6. Avoid unnecessary complexity.

Every change should improve the project without compromising stability or maintainability.
