# DocForge AI Workspace

Welcome to the **DocForge AI** workspace. DocForge AI is a premium, production-ready SaaS platform designed to transform raw, unstyled text or Markdown into professional-grade, beautifully formatted documents (PDF, DOCX, HTML, EPUB, etc.) leveraging AI-driven layout engines.

This workspace contains both the visual design specifications and the functional codebase implementation.

---

## 📂 Workspace Structure

The workspace is organized into two primary sections:

1. **[`docforge-ai`](file:///c:/Users/User/Desktop/DocForge/docforge-ai)**: The main software application containing the Next.js frontend and Express/TypeScript backend.
2. **[`stitch_docforge_ai_document_suite`](file:///c:/Users/User/Desktop/DocForge/stitch_docforge_ai_document_suite)**: The high-fidelity design specifications, logo files, and UI mocks exported from the Stitch design system.

### Directory Mapping

```text
DocForge/
├── docforge-ai/                              # Application Implementation (Scaffold)
│   ├── frontend/                             # Next.js App Router (Tailwind CSS, React 18)
│   └── backend/                              # TypeScript Express API (Prisma ORM, PostgreSQL)
│
├── stitch_docforge_ai_document_suite/         # Design Specs & Mockups (Stitch exports)
│   ├── docforge/
│   │   └── DESIGN.md                         # Core Design System, Tokens, Colors, & Rules
│   ├── docforge_ai_logo/                     # Brand Identity Assets
│   ├── docforge_ai_landing_page/             # Landing Page Screens & Design System Mocks
│   ├── docforge_ai_dashboard/                # User Workspace & Template Manager Mocks
│   ├── docforge_ai_document_editor/          # Synchronized Editor & Live Preview Mocks
│   └── docforge_ai_templates_integrations/   # Template Selection & Integration Panel Mocks
│
├── docforge_ai_project_prd.md                # Project Product Requirements Document (PRD)
└── README.md                                 # Workspace Hub Guide (This file)
```

---

## 🏛️ Architecture & Stack (under `docforge-ai/`)

### Frontend (`/frontend`)
* **Framework**: React 18 & Next.js 16.2 (App Router)
* **Styling**: Tailwind CSS v3 & PostCSS
* **Key Routes**:
  * `(marketing)`: Product landing page presenting the vision and features.
  * `dashboard`: User's workspace listing documents, metrics, and activities.
  * `editor`: Synchronized editor workspace featuring a real-time Markdown/Rich Text formatting interface.
  * `templates`: Standardized templates catalog (e.g. manuals, research papers, resumes).

### Backend (`/backend`)
* **Runtime & Framework**: Node.js, Express, TypeScript, and TSX (development runtime)
* **Database & ORM**: PostgreSQL via Prisma ORM
* **Architecture**: Modular service-based architecture containing routing layers, controllers, and services grouped under modules:
  * `auth`: User authentication and JWT verification.
  * `documents`: Core document editing, updates, and draft retrieval.
  * `templates`: Document template storage and creation.
  * `exports`: PDF/DOCX render engines and custom stylesheets configuration.
  * `integrations`: Sync status with Drive, Slack, GitHub, and Notion.

---

## 🎨 Design System & Aesthetics

The visual system is engineered for a premium, developer-friendly, yet designer-quality output. It balances extreme utility with a modern, glassmorphic layout.

* **Primary Colors**: Indigo (`#4F46E5` / `#3525cd`) and Violet (`#712ae2`) accents for AI-enhanced tools.
* **Neutral Palette**: Clean background tints (`#F8FAFC`) with soft white containers (`#FFFFFF`) to establish clear hierarchy.
* **Typography**: **Manrope** for strong, premium headings, and **Inter** for crisp, highly readable body copy.
* **Shape Language**: Smooth rounded corners (12px to 24px) paired with subtle 1px slate borders.
* **Depth & Elevation**: Soft ambient shadows and semi-transparent backdrops with 12px blur layers.

> For complete token configurations and spacing rules, check the **[Stitch DESIGN.md](file:///c:/Users/User/Desktop/DocForge/stitch_docforge_ai_document_suite/docforge/DESIGN.md)**.

---

## 🚀 Setup & Installation

### Prerequisites
* **Node.js** (v18.x or higher)
* **npm** (v9.x or higher)
* **PostgreSQL** instance

### 1. Install Dependencies
Run the installation command in the `docforge-ai` directory to install dependencies for both workspaces:
```bash
cd docforge-ai
npm install
```

### 2. Configure Environment Variables
Copy the backend example configurations and edit the variables as required:
```bash
cd docforge-ai/backend
cp .env.example .env
```
Inside the `docforge-ai/backend/.env` file, configure your PostgreSQL database connection URI and custom JWT secret:
```env
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/docforge"
JWT_SECRET="your-jwt-secret-here"
```

### 3. Database Migration
Generate the Prisma client and apply the migrations using Prisma CLI inside the backend directory:
```bash
cd docforge-ai/backend
npx prisma generate
npx prisma migrate dev
```

---

## 💻 Running the Application

You can control both workspaces from the `docforge-ai` directory using npm workspace commands:

### Running Frontend
Runs the Next.js dev server on [http://localhost:3000](http://localhost:3000):
```bash
cd docforge-ai
npm run dev
# or
npm run dev --workspace frontend
```

### Running Backend
Runs the Express server with file watching on [http://localhost:4000](http://localhost:4000):
```bash
cd docforge-ai
npm run dev --workspace backend
```

---

## 🧪 Development Scripts (in `docforge-ai/`)

The workspace provides the following scripts configured in `package.json`:

* **`npm run dev`**: Starts the frontend dev server.
* **`npm run build`**: Triggers a production Next.js build compilation.
* **`npm run start`**: Launches the built production Next.js server.
