# Dashboard Prototype Design Document

This document outlines the plan for building a React-based dashboard prototype using Vite, Tailwind CSS, and Lucide React.

## 1. Project Overview
- **Technology Stack:** React (TypeScript), Vite, Tailwind CSS, Lucide React.
- **Goal:** Create a visually polished, functional dashboard layout with a fixed sidebar, topbar, and a grid-based content area.
- **Directory:** `frontend/`

## 2. Visual Design & Aesthetic
- **Sidebar:** Light violet/blueish background (`bg-indigo-50` or `bg-violet-50`). Fixed width, full height.
- **Main Background:** Slightly off-white/light gray (`bg-slate-50`).
- **Typography:** Clean sans-serif (Inter/system default).
- **Icons:** Lucide React for consistent, high-quality iconography.

## 3. Component Architecture

### `Layout` (Main Shell)
- **Sidebar (Left):**
  - Logo placeholder at the top.
  - Centered vertical list of navigation icons (Home, User, Team, Folder, etc.) in circular button containers.
  - Dark-mode toggle module (bottom or middle as per image reference).
- **Main Content (Right):**
  - **Topbar:**
    - Centered pill-shaped search bar with magnifying glass icon.
    - Dark rounded rectangle placeholder.
    - Bell icon (notifications).
    - User profile: Avatar, "Alex Williamson", "alex.w@example.com".
  - **Dashboard Grid:**
    - **Top-Left Slot:** Large map placeholder.
    - **Top-Right Slots:** Two vertically stacked KPI card placeholders.
    - **Bottom Slot:** Full-width data table placeholder.

## 4. Implementation Steps

### Phase 1: Initialization
- [ ] Initialize Vite project: `npm create vite@latest frontend -- --template react-ts`
- [ ] Install dependencies: `npm install -D tailwindcss postcss autoprefixer`, `npm install lucide-react`
- [ ] Configure Tailwind CSS.

### Phase 2: Core Layout
- [ ] Create `Sidebar.tsx`.
- [ ] Create `Topbar.tsx`.
- [ ] Create `Dashboard.tsx` with CSS Grid layout.
- [ ] Assemble in `App.tsx`.

### Phase 3: Styling & Refinement
- [ ] Apply specific colors and spacing.
- [ ] Add borders and placeholder text for slots.
- [ ] Ensure responsiveness (basic layout stability).

## 5. Success Criteria
- [ ] Dashboard is visually consistent with the requested description.
- [ ] Sidebar and Topbar are fully implemented with requested components.
- [ ] Content area correctly utilizes CSS Grid for the specified slots.
- [ ] Code is modular and follows React/TypeScript best practices.
