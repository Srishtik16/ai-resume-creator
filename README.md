# ResuAI - AI-Powered LaTeX Resume Creator

![ResuAI Preview](https://via.placeholder.com/800x400?text=ResuAI+Application+Preview)

ResuAI is a professional, Overleaf-style resume editor that leverages **Google gemini-1.5-flash** to generate and refine LaTeX resumes. It features a split-pane IDE interface, real-time PDF compilation, and multimodal upload capabilities to convert existing resumes (PDF/DOCX) into LaTeX code.

## 🚀 Features
- **Overleaf-Like Interface**: Split-screen code editor (CodeMirror) and real-time PDF preview.
- **AI-Powered Generation**: Chat with Gemini to generate resume sections or refine content.
- **Multimodal Upload**: Upload existing PDFs or Word docs; Gemini accepts the file directly to generate a LaTeX replica.
- **Real-Time Compilation**: Backend Go service compiles LaTeX to PDF using `pdflatex` on the fly.
- **Professional Dark Mode**: Polished UI with a custom design system.

---

## 🏗 System Architecture

### Code Flow Diagram
```mermaid
graph TD
    User[User] -->|Interacts| UI[Frontend (React/Vite)]
    UI -->|1. /compile (LaTeX)| API[Backend API (Go/Fiber)]
    UI -->|2. /generate (Prompt)| API
    UI -->|3. /upload (File)| API
    
    API -->|Generate Latex| Gemini[Google Gemini AI]
    API -->|Compile PDF| Latex[PDFLaTeX CLI]
    
    Gemini -->|Returns LaTeX| API
    Latex -->|Returns PDF Bytes| API
    API -->|Returns JSON/PDF| UI
```

---

## 📂 Folder Structure & File Description

```
ai_resume_creator/
├── backend/                   # Backend Application (Go)
│   ├── handlers/
│   │   └── handlers.go        # HTTP Controllers: Handles /compile, /generate, /upload requests
│   ├── services/
│   │   ├── ai_service.go      # AI Logic: Communicates with Google 'gemini-1.5-flash' model
│   │   └── compiler.go        # Compiler Logic: Executes 'pdflatex' command on system
│   ├── Dockerfile             # Multi-stage Docker build: Go Builder + Ubuntu with TeXLive
│   ├── main.go                # Entry point: Sets up simple dependency injection, CORS, and Routes
│   ├── go.mod                 # Go dependencies definition
│   └── .env                   # Local Env vars (GEMINI_API_KEY, PORT)
│
├── frontend/                  # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── editor/
│   │   │   │   ├── CodeEditor.tsx # CodeMirror implementation for LaTeX editing
│   │   │   │   └── Preview.tsx    # PDF Viewer component with loading states
│   │   │   └── Layout.tsx         # Main Layout: Navbar, Toolbar, Split-Pane
│   │   ├── App.tsx            # Main Application Logic (State Management, API Calls)
│   │   ├── index.css          # Global Design System (Tailwind v4 + Variables)
│   │   └── main.tsx           # React Entry point
│   ├── vite.config.ts         # Vite Configuration (Railway host allowlist)
│   ├── postcss.config.js      # PostCSS config for Tailwind CSS
│   ├── package.json           # Frontend dependencies and scripts
│   └── .env                   # Frontend Env vars (VITE_API_BASE_URL)
│
├── .gitignore                 # Global Git Ignore rules
└── README.md                  # Project Documentation
```

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4 + PostCSS
- **Editor**: CodeMirror 6 (with legacy LaTeX mode)
- **Icons**: Lucide React

### Backend
- **Language**: Go (Golang) 1.25
- **Router**: Chi Router
- **PDF Engine**: TeX Live (`pdflatex`)
- **AI Model**: Google Gemini (`gemini-1.5-flash`) via `google-generative-ai-go` SDK

---

## ⚡ Deployment

### 1. Prerequisites
- **Frontend**: Node.js & npm
- **Backend**: Go 1.25+, `pdflatex` installed (TeX Live)

### 2. Running Locally
1.  **Backend**:
    ```bash
    cd backend
    mv .env.example .env # Add your GEMINI_API_KEY
    go run main.go
    ```
    *Server starts on localhost:8080*

2.  **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    *App starts on localhost:5173*

### 3. Cloud Deployment (Railway)
- **Backend Service**:
    - Build from `/backend`.
    - Dockerfile handles installing Go and LaTeX.
    - Set `GEMINI_API_KEY` in Railway variables.
- **Frontend Service**:
    - Build from `/frontend`.
    - Set `VITE_API_BASE_URL` to your deployed backend URL.
    - Railway automatically detects Vite and runs it using the custom `start` script.

*See `DEPLOYMENT.md` for full detailed deployment/security guide.*
