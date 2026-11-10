---
name: nord-style
description: "UI and visual skill for nord theme design. Use when building or editing any interface: color, layout, components, motion, and page performance. Load with the core."
allowed-tools: Read Write Edit Glob Grep
---

# Skill: Nord Personal Dashboard UI Design

## 1. Design Overview

Create a modern personal productivity dashboard for one individual to manage daily tasks, schedule, habits, goals, finances, learning, and notes in a single place.

The design combines an organized dashboard structure with a calm, cool, Nord-inspired visual language. It should feel focused, approachable, lightweight, and highly organized rather than looking like a generic admin template or a corporate project-management tool.

**Design keywords:**

- Modern Personal Dashboard
- Nord Color Palette
- Calm Minimalism
- Soft Frost and Aurora Accents
- Bento-style Information Cards
- Clean Data Visualization
- Rounded UI Elements
- Editorial Typography
- Friendly Productivity Experience

The interface should prioritize information clarity while maintaining a visually pleasant, low-fatigue appearance suited to daily use.

## 2. Overall Layout

Use a desktop-first dashboard layout divided into three primary areas:

### A. Left Sidebar Navigation

A persistent vertical sidebar on the left side of the screen.

Characteristics:

- Polar Night background (`#2E3440`).
- Rounded corners, especially on the outer edges.
- Snow Storm (`#D8DEE9`) for active text and muted Polar Night gray (`#4C566A` / `#8892A6` for readable contrast) for inactive text.
- Small minimalist line icons.
- Active navigation highlighted with a Frost accent (`#88C0D0`).
- Compact spacing between navigation items.

Navigation structure:

**General**

- Dashboard
- Schedule
- Tasks
- Goals & Habits
- Finance
- Learning

**Tools**

- Notes & Journal
- Messages
- Files
- Settings

**Bottom**

- Log Out

The active navigation item should have a subtle background (`#3B4252`) with a Frost accent indicator (left bar or icon tint) to distinguish it from inactive items.

### B. Main Dashboard Content

The central content area occupies most of the available screen width.

It uses a modular grid layout containing:

- Greeting and page heading.
- Tasks overview.
- Focus time summary.
- Habit tracker.
- Goals and finance summary.
- Task list.
- Note / task details.

The layout should use different card sizes to create visual hierarchy instead of making every card identical.

### C. Right Information Panel

A narrower panel on the right side.

Contains:

- Calendar widget.
- Add Event button.
- Daily timeline.
- Upcoming events and reminders.
- Today's routine / habit schedule.

This panel should remain visually distinct while sharing the same background and design language as the main dashboard.

## 3. Visual Design System

### Color Palette (Nord)

Use the official Nord palette. A cool, light background combined with muted Nord card colors keeps the interface calm and readable.

**Nord reference**

| Group       | Token           | Hex     |
| ----------- | --------------- | ------- |
| Polar Night | nord0           | #2E3440 |
| Polar Night | nord1           | #3B4252 |
| Polar Night | nord2           | #434C5E |
| Polar Night | nord3           | #4C566A |
| Snow Storm  | nord4           | #D8DEE9 |
| Snow Storm  | nord5           | #E5E9F0 |
| Snow Storm  | nord6           | #ECEFF4 |
| Frost       | nord7           | #8FBCBB |
| Frost       | nord8           | #88C0D0 |
| Frost       | nord9           | #81A1C1 |
| Frost       | nord10          | #5E81AC |
| Aurora      | nord11 (red)    | #BF616A |
| Aurora      | nord12 (orange) | #D08770 |
| Aurora      | nord13 (yellow) | #EBCB8B |
| Aurora      | nord14 (green)  | #A3BE8C |
| Aurora      | nord15 (purple) | #B48EAD |

**Applied to the UI**

| Element                       | Color            |
| ----------------------------- | ---------------- |
| Main background               | #ECEFF4 (nord6)  |
| Secondary surfaces / panels   | #E5E9F0 (nord5)  |
| White surfaces                | #FFFFFF          |
| Sidebar                       | #2E3440 (nord0)  |
| Primary text                  | #2E3440 (nord0)  |
| Secondary text                | #4C566A (nord3)  |
| Borders / dividers            | #D8DEE9 (nord4)  |
| Tasks card (yellow)           | #EBCB8B (nord13) |
| Focus card (frost blue)       | #88C0D0 (nord8)  |
| Habits card (green)           | #A3BE8C (nord14) |
| Goals / Finance card (purple) | #B48EAD (nord15) |
| Primary accent                | #5E81AC (nord10) |
| Active nav / selected date    | #88C0D0 (nord8)  |
| Urgent / overdue              | #BF616A (nord11) |
| Warning / due soon            | #D08770 (nord12) |
| Success / completed           | #A3BE8C (nord14) |

Colors should feel soft and slightly muted, as Nord intends, never neon. Use Aurora colors to categorize information and Frost colors for interactive and structural accents.

**Contrast note:** Text on colored cards should use `#2E3440` (nord0). Never place white or Snow Storm text on Aurora or light Frost cards.

**Optional dark mode:** Swap backgrounds to nord0 / nord1 / nord2, text to nord4–nord6, and keep Aurora/Frost cards as they are with nord0 text on them.

### Typography

Use a clean modern sans-serif typeface.

Suggested fonts:

- Inter
- Manrope
- Plus Jakarta Sans

Typography hierarchy:

- Page greeting: Large, bold, approximately 28–32px.
- Section headings: 15–18px, semibold.
- Card titles: 13–15px, semibold.
- Primary statistics: 20–26px, bold.
- Supporting information: 11–12px.
- Navigation labels: 12–13px.

Use strong contrast between headings, statistics, and supporting labels.

### Shape and Spacing

- Main dashboard uses a clean grid system.
- Cards have approximately 12–18px border radius.
- Buttons use pill-shaped or rounded geometry.
- Small labels use rounded badges.
- Maintain consistent internal card padding.
- Use subtle borders (`#D8DEE9`) or minimal shadows.
- Avoid excessive visual decoration.

## 4. Dashboard Components

### A. Welcome Header

At the top of the main content:

- Personalized greeting such as "Good morning, Olivia".
- A short summary beneath the heading, e.g. "You have 5 tasks and 2 events today."
- Compact top navigation or filter controls.
- Small utility icons such as search and notifications.

The greeting should establish the page hierarchy immediately.

### B. Tasks Overview Card

A yellow (nord13) card displaying task statistics.

Information:

- Total tasks.
- Completed tasks.
- Pending / overdue tasks.
- Small vertical bar chart showing completed tasks per day over the week.

Use bold numeric values with compact labels.

### C. Focus Time Card

A Frost blue (nord8) card containing:

- Total focus hours this week.
- Average focus session length.
- Longest streak or best day.
- A compact line chart showing focus trends.
- Decorative circle or timer-ring illustration in the background.

The chart should be minimal, with thin lines and no unnecessary grid lines.

### D. Habit Tracker Card

A green (nord14) card displaying habit progress.

Include:

- Current streak and completion rate.
- Habit categories (e.g. exercise, reading, sleep, water).
- A simple geometric visualization, such as a dot grid, progress rings, or proportional bars.

Use the card's background color as its primary visual identity.

### E. Goals & Finance Card

A purple (nord15) card displaying goal and budget statistics.

Include:

- Active goals and overall progress.
- Monthly spending versus budget.
- Savings progress.
- A decorative star or abstract shape.

### F. Task List

A list-based component displaying upcoming tasks.

Each row should contain:

- Checkbox or circular status icon.
- Task title.
- Optional project / category label.
- Due date or priority badge (nord11 urgent, nord12 soon, nord14 done, nord9 normal).

Use subtle alternating Aurora/Frost tints for category icons. Keep the list compact and easy to scan.

### G. Task / Note Details

A Frost-blue or purple tinted information card displaying details about a selected task or note.

Include:

- Title.
- Due date and time.
- Category badges.
- Description or notes.
- Subtasks or checklist.

Use a structured information hierarchy instead of displaying everything as plain text.

### H. Calendar Widget

Position the calendar in the right panel.

Characteristics:

- Compact monthly calendar.
- Month and year header.
- Previous and next navigation.
- Seven-column weekday layout.
- Highlight the currently selected date with a Frost (nord8) circular background and nord0 text.
- Keep calendar typography small and clean.

### I. Daily Timeline

Below the calendar:

- Display the selected date.
- Show events and routines vertically by time.
- Use small icons or colored indicators for categories (work, health, learning, personal).
- Include event titles and short descriptions.
- Visually distinguish completed (muted green), upcoming (Frost blue), and scheduled (neutral) items.

### J. Action Buttons

Use compact rounded buttons.

Examples:

- Add Event
- Add Task
- View All
- Search
- Filter

Primary buttons use Polar Night (`#2E3440`) backgrounds with Snow Storm (`#ECEFF4`) text, while secondary actions should be visually quieter (outlined or `#E5E9F0` fill).

## 5. Decorative Visual Language

One of the defining characteristics of this design is the use of subtle decorative elements.

Incorporate:

- Abstract circles and rings.
- Geometric stars.
- Organic blobs.
- Simple rounded illustrations.
- Small colorful visual accents.

These elements should appear inside selected cards as low-contrast background decorations (use a slightly lighter or darker tint of the card color).

Important: Decorative graphics must never interfere with important data or reduce text readability.

## 6. Interaction and Motion

The interface should feel responsive without excessive animation.

Recommended interactions:

- Sidebar active-state transitions.
- Hover states on navigation items.
- Subtle card hover elevation.
- Calendar date selection.
- Interactive task list selection and check-off.
- Smooth chart rendering.
- Button hover and active states.
- Timeline item selection.

Use short transitions around 150–250ms with natural easing.

## 7. Responsive Behavior

### Desktop

- Full sidebar.
- Main dashboard content.
- Independent right information panel.
- Multi-column card layout.

### Tablet

- Sidebar becomes collapsible.
- Main content adjusts to fewer columns.
- Calendar and timeline may move below the main dashboard.

### Mobile

- Sidebar becomes a drawer or bottom navigation.
- Dashboard cards stack vertically.
- Task list becomes full width.
- Calendar and timeline become separate sections.
- Preserve readable typography and comfortable touch targets.

## 8. Design Principles

Follow these principles throughout implementation:

1. Information hierarchy comes first.
2. Use Nord Aurora colors to distinguish types of information and Frost colors for interaction.
3. Maintain a consistent spacing and border-radius system.
4. Keep charts minimal and readable.
5. Avoid excessive shadows, borders, and gradients.
6. Use decorative shapes sparingly.
7. Prioritize a calm, focused, personal experience.
8. Ensure that all components remain visually consistent.
9. Keep text contrast accessible (nord0 text on light cards, nord4–nord6 text on dark surfaces).

## 9. Expected Result

The final interface should resemble a premium modern personal productivity dashboard.

It should combine:

- The organization of a professional planning tool.
- The visual appeal of a modern productivity app.
- The calm, cool character of the Nord palette.
- The information density of an analytics interface.

The result should not look like a generic admin template. It should maintain a distinctive visual identity through its Nord color system, modular card layout, Polar Night sidebar, rounded components, and subtle decorative elements.
