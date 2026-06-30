# Real-Time Collaborative Kanban Board (Modern MEAN Stack)

A highly responsive full-stack application engineered to showcase modern web capabilities: event-driven data streaming via WebSockets, fine-grained UI reactivity using Angular 21 Signals, and server-side metrics calculations through MongoDB Aggregation Pipelines.

## ⚡ Architectural Core Concepts Covered

- **Bi-Directional Streaming (WebSockets):** Uses `socket.io` to create persistent open server channels. Task mutations (creation/status shifts) update all connected client windows simultaneously without browser reloading.
- **Fine-Grained Reactivity (Angular 21 Signals):** Completely cuts out heavy Zone.js page-scanning cycles. Local data states use `signal()` and view columns use `computed()` selectors to update precise DOM coordinates instantly.
- **Data Transformation (MongoDB Aggregations):** Replaces basic `.find()` lookups with native database analytics. The statistics pipeline performs real-time `$group` and `$sum` processing directly inside the database cluster.
- **Modern TypeScript & ESM:** Runs a completely clean modern JavaScript environment, utilizing ECMAScript Modules (`import`/`export`) natively on both tiers.

---

## 📁 Repository Structure

```text
trello-style-app/
├── backend/
│   ├── task.model.js               # Mongoose Schema
│   ├── server.js                   # Express Server & Socket.io Configuration
│   ├── server.spec.js              # Aggregation Unit Test
│   └── server.integration.spec.js  # Supertest Route Integration Suite
└── frontend/
    └── src/app/
        ├── app.config.ts           # Unified Angular Platform Bootstrapping
        ├── board.service.ts        # Socket.io Stream-to-Signal Service Channel
        ├── board.component.ts      # Standalone Kanban Column Template
        ├── board.service.spec.ts   # Vitest Asynchronous Signal Spec Mock
        └── metrics.component.ts    # Computed Signals Live Analytics Widget
```

---

## 🚀 Workspace Setup & Local Execution

### 1. Database Requirement
Ensure a standard MongoDB instance is active locally on default port `27017`.

### 2. Backend Server Execution
1. Navigate to the directory: `cd backend`
2. Install server modules: `npm install`
3. Launch the runtime engine: `node server.js`

### 3. Frontend UI Execution
1. Navigate to the directory: `cd frontend`
2. Install interface frameworks: `npm install`
3. Launch the development server: `npm start` (Runs on http://localhost:4200)

*To test real-time synchronization, open two separate browser windows side-by-side at `http://localhost:4200`.*

---

## 🧪 Automated Testing Lifecycles

This workspace completely maps and covers the system integration and isolated validation boundaries:

### Frontend Component & Service Isolation
Runs on the modern, high-performance **Vitest** browser mock testing runtime layer:
```bash
cd frontend && npm test
```

### Backend Analytics Logic Unit Suite
Evaluates the database analytics parsing rules using Node's native lightweight testing suite:
```bash
cd backend && node server.spec.js
```

### Full-Stack Network Integration Boundary Test
Launches a mock API endpoint engine via `supertest` to guarantee successful end-to-end database writing constraints:
```bash
cd backend && NODE_ENV=test node server.integration.spec.js
```
