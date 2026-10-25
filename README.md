# Project Blackout: AI Cyber-Forensics Incident Room

> **An interactive, procedural detective & cyber-forensics investigation game powered by Google Gemini, React, Express, and MongoDB.**

![Project Blackout Banner](https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80)

---

## 🔍 Overview

**Project Blackout** places you in the command terminal as a digital forensics investigator responding to high-stakes cyber breaches, unauthorized neural weights exfiltrations, and corporate espionage.

Unlike static mystery games, each case is procedurally synthesized on-the-fly using **Google Gemini 3.5 Flash**:
- **Dynamic Suspect Dossiers**: Multi-layered backgrounds, motives, and timeline-based alibis.
- **Forensic Clue Discovery**: Interactive memory dumps, encrypted badge logs, and compromised tokens. Uncovering clues awards **+5 investigation points**.
- **Tactical Decryption Hints**: Unlock progressive hints when stuck at a strategic penalty of **-10 points**.
- **Anti-Cheat Security**: The secret culprit identity and canonical solution explanation are strictly concealed on the server until formal indictment is executed.
- **Deduction & Indictment Verdict**: Compare your forensic reasoning against the truth, reveal the culprit, and review a full rating debrief.

---

## 🛠️ Technology Stack

### Frontend (`client/`)
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 (Atmospheric Cyber-Noir theme, glow utilities, scanlines)
- **Icons**: Lucide React
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios

### Backend (`server/`)
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **AI SDK**: `@google/genai` (Google Gen AI SDK with candidate fallback handling)
- **Validation**: Zod (Schema validation for generative outputs)
- **Environment & Security**: CORS, dotenv, robust DNS SRV fallback for Windows/Node 24 OpenSSL support

---

## 📐 Game Mechanics & Difficulty Scaling

| Protocol Tier | Suspects | Clues | Hints | Base Rating |
| :--- | :---: | :---: | :---: | :---: |
| **Standard Audit (Easy)** | 3 | 5 | 2 | 100 PTS |
| **Deep Threat (Medium)** | 4 | 7 | 3 | 150 PTS |
| **Blackout Protocol (Hard)** | 5 | 9 | 3 | 200 PTS |

### Scoring Matrix
$$\text{Final Score} = \max\Big(0, \text{Base Points} + (\text{Clues Discovered} \times 5) - (\text{Hints Used} \times 10)\Big)$$
- **Correct Indictment**: Retains full difficulty base score + all clue discovery bonuses.
- **Failed Indictment**: 0 base score (retaining any earned clue bonuses minus hint penalties).
- **Floor Guarantee**: Minimum score is always $\ge 0$.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster URI)
- [Google Gemini API Key](https://aistudio.google.com/)

---

### 1. Environment Configuration

Copy the example environment configuration into `server/.env`:

```bash
cd server
cp .env.example .env
```

Ensure your `server/.env` contains the required keys:

```ini
# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:5173

# Database Connection (MongoDB Local or Atlas)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ai_mystery_room?retryWrites=true&w=majority

# Google Gemini API
GEMINI_API_KEY=AIzaSy...
```

---

### 2. Backend Setup & Startup

From the project root:

```bash
cd server
npm install
npm run dev
```

The backend server will start on `http://localhost:5000` with hot-reloading via `nodemon`.
- Health check available at: `http://localhost:5000/health`

---

### 3. Frontend Setup & Startup

In a second terminal window:

```bash
cd client
npm install
npm run dev
```

The client will start on `http://localhost:5173`. Open your browser and navigate to `http://localhost:5173` to launch your first investigation!

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/cases` | Synthesize and persist a mystery case via Gemini. |
| `GET` | `/api/cases` | Retrieve recent case logs for the case archive. |
| `GET` | `/api/cases/:id` | Fetch active case dossier (culprit and solution hidden). |
| `POST` | `/api/cases/:id/clues/:clueId/discover` | Mark clue as discovered (+5 points). |
| `POST` | `/api/cases/:id/hints` | Unlock next tactical hint (-10 points). |
| `POST` | `/api/cases/:id/accuse` | Submit formal indictment, calculate score, and reveal verdict. |
| `GET` | `/api/cases/:id/result` | Retrieve full post-case debrief and explanation. |

---

## 🔒 Anti-Cheat & Narrative Integrity
1. **Server-Side Secrecy**: The Mongoose schema marks `culpritId` and `solutionExplanation` with `{ select: false }`, guaranteeing that inspecting client network tabs will never reveal the answer before an accusation is submitted.
2. **Deterministic Verification**: Accusation evaluation is strictly performed server-side by comparing the player's chosen suspect ID against the secret database field.
3. **Idempotent Rewards**: Repeated discovery calls on an already uncovered clue yield zero duplicate points.

---

## 🏆 Project Structure

```
ai-mystery-room/
├── SPEC.md                  # Comprehensive architectural specification
├── README.md                # Project documentation and quickstart guide
├── client/                  # Frontend Vite React Application
│   ├── src/
│   │   ├── components/      # UI components (Navbar, HUD widgets)
│   │   ├── pages/           # Views (Home, CreateCase, InvestigationRoom, CaseResult)
│   │   ├── services/        # Axios API client (api.js)
│   │   ├── App.jsx          # Route declarations
│   │   └── index.css        # Tailwind CSS and cyber-noir theme styles
│   └── vite.config.js       # Vite configuration with Tailwind CSS plugin
└── server/                  # Backend Express.js REST API
    ├── src/
    │   ├── config/          # MongoDB connection with DNS SRV fallback (db.js)
    │   ├── controllers/     # Case business logic & scoring (caseController.js)
    │   ├── models/          # Mongoose schema with anti-cheat protection (Case.js)
    │   ├── routes/          # REST route endpoints (caseRoutes.js)
    │   ├── services/        # Google Gen AI integration with Zod schemas (geminiService.js)
    │   └── index.js         # Server entry point & CORS configuration
    ├── .env                 # Server environment variables
    └── package.json         # Backend dependencies & scripts
```
