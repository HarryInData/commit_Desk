# CommitDesk 📋⚡

> **Turn meeting notes into trackable work before they're forgotten.**

Work is often assigned verbally in meetings—send an email, draft an architecture, review a PR—but never makes it into Jira or another task tracker. **CommitDesk** captures those commitments before they slip away.

The app features a unified split-screen experience:
- **Chat Panel (Left)**: The primary conversational interface where you paste meeting notes, action items, or bullet lists.
- **Live Task Board (Right)**: The live result that organizes, tracks, and summarizes your commitments in real time.

---

## 🌟 Key Features

- **Zero-Setup Front-End App**: Runs entirely in the browser with no server, database, or login required.
- **Robust Local Parser (Default)**: Immediately extracts task titles, descriptions, due dates, requesters, priorities, effort estimates, and statuses using built-in linguistic heuristics.
- **Optional Gemini API Integration**: Add your own Gemini API key in Settings for deeper contextual extraction. The key stays securely in your browser's `localStorage` and can be removed at any time.
- **12 Preloaded Realistic Tasks**: Believable mix of Jira-style tickets and verbally assigned meeting actions (no placeholder or lorem ipsum content).
- **Live Summary Strip**: Instant visual stats for **Open**, **Due Today**, **Overdue**, and **Completed** tasks.
- **Dynamic Date Indicators**: Clear badges and pulsing indicators for overdue items and tasks due today.
- **Task Management**:
  - In-card status transitions (`To Do` → `In Progress` → `Done`) with immediate board updates.
  - Interactive Task Details modal to edit titles, descriptions, due dates, requesters, priorities, and effort.
  - Multi-view filtering (`All`, `To Do`, `In Progress`, `Done`, `Overdue`) and sorting (`Due Date`, `Priority`, `Effort`, `Created`).
- **Persistent State**: User-created tasks, edits, and status changes persist across browser refreshes via `localStorage`.
- **Adaptive Responsive Layout**: Split-screen on desktop; intuitive tabbed view (`Chat` / `Board`) on mobile devices.

---

## 🚀 Quick Start

### 1. Run Locally

CommitDesk requires no build step or node dependencies. You can open `index.html` directly or serve it with any static web server:

```bash
# Python
python3 -m http.server 8080

# Or Node.js
npx serve .
```

Then open your browser at:
```
http://localhost:8080/
```

### 2. Live Deployment (GitHub Pages)

To view CommitDesk via GitHub Pages:
1. Go to repository **Settings** → **Pages**.
2. Under **Build and deployment** > **Source**, select **Deploy from a branch**.
3. Choose branch `main` and folder `/ (root)`.
4. Click **Save**.

Your app will be live at:
```
https://harryindata.github.io/commit_Desk/
```

---

## 💡 How to Use

1. **Paste Meeting Notes**:
   Type or paste raw notes into the chat panel. Example formats supported:
   - *Natural language sentences*: `"Marcus asked to review PR #847 by tomorrow. It's critical, small effort."`
   - *Bullet points*:
     ```text
     - Fix timezone bug in scheduling module before Friday (urgent, Aisha)
     - Send Q3 performance metrics to stakeholders by tomorrow
     - Update onboarding flow based on UX research (David)
     ```
   - *Multi-line summaries with dates, priorities, and assignees*.

2. **Review Assistant Confirmation**:
   The assistant confirms created tasks and transparently indicates any defaulted fields (e.g., due date or effort estimate) that you can refine.

3. **Interact with the Board**:
   - Filter by status or overdue state.
   - Click any task to edit details or delete it.
   - Change task status directly via the dropdown on each card.
   - Adjust Gemini API key settings or reset data anytime using the Settings icon (⚙) in the top right.

---

## 🛠️ Technology Stack

- **HTML5**: Semantic, accessible markup.
- **CSS3**: Modern dark-mode aesthetic with CSS custom properties, glassmorphism, responsive breakpoints, and micro-animations.
- **JavaScript (ES6+)**: Vanilla client-side architecture with deterministic heuristic parsing and Google Gemini API support.
- **Storage**: Browser `localStorage` for privacy and persistence.

---

## 📄 License

MIT License. Designed and built with ❤️.
