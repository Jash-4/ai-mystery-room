# AI Mystery Room - Project Specification & Architecture Document

## 1. Executive Summary & Overview
**AI Mystery Room** is an interactive, AI-driven detective investigation web application. Powered by Google's Gemini generative AI models, each case is procedurally generated with a rich mystery narrative, distinct suspects, contextual alibis, dynamic clues, and subtle hints. Players explore the crime scene, inspect clues, interrogate suspect dossiers, request strategic hints, and ultimately submit their final deduction and accusation to solve the mystery.

---

## 2. System Architecture

The application adopts a decoupled client-server architecture:

```mermaid
graph TD
    Client["Client (React + Vite + Tailwind CSS)"] -->|REST API Requests (JSON)| Server["Server (Express.js REST API)"]
    Server -->|Prompt & Structured Generation| Gemini["Google Gemini API (@google/genai)"]
    Server -->|Persistence & Queries| Mongo[("MongoDB (Mongoose)")]
    
    subgraph "Client Security Boundary"
        Client
    end
    
    subgraph "Server Trust Boundary"
        Server
        Mongo
        Gemini
    end
```

- **Frontend (Client)**: Single Page Application (SPA) built with React and Vite, styled using Tailwind CSS and Lucide React icons, managed with React Router.
- **Backend (Server)**: Node.js with Express.js providing robust REST API endpoints, JSON request validation via Zod, and data modeling via Mongoose.
- **AI Engine**: Google Gemini via the official `@google/genai` SDK, leveraging structured JSON schemas to ensure high narrative coherence, distinct suspect profiles, and solvable deduction paths.
- **Database**: MongoDB with Mongoose ODM storing generated cases, live game states, clue discovery flags, hint statuses, and player accusation verdicts.

---

## 3. Technology Stack

### Frontend (`client/`)
- **Runtime / Framework**: React 18+ / React 19, Vite
- **Styling**: Tailwind CSS (with utility classes and custom theme extensions for atmospheric dark noir / investigation aesthetics)
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Routing**: React Router DOM (v6 / v7)

### Backend (`server/`)
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database & ODM**: MongoDB & Mongoose
- **AI SDK**: `@google/genai` (Google Gen AI SDK)
- **Validation**: Zod (strict schema validation for AI outputs & API payloads)
- **Environment & Middleware**: `dotenv`, `cors`, `morgan` / logging

---

## 4. User Journey & Core Game Loop

1. **Premise & Difficulty Selection**:
   - Player visits the landing view and initiates a new case.
   - Player inputs a mystery theme/premise (e.g., "Cyberpunk heist in Neo-Kyoto", "Victorian Manor poisoned tea", "Space station sabotage") or selects a random archetype.
   - Player selects difficulty: **Easy**, **Medium**, or **Hard**.
2. **Gemini-Powered Mystery Generation**:
   - Backend calls Gemini with structured schemas to create consistent suspects, hidden secrets, cohesive timeline alibis, clues, and progressive hints.
   - Server securely stores the `culpritId` and `solutionExplanation` in MongoDB.
3. **Investigation & Clue Discovery**:
   - Player reviews the Case Dossier and suspect profiles.
   - Player explores and unlocks clues on the Clue Discovery Board, earning investigation points (+5 per clue).
4. **Hint Acquisition**:
   - When stuck, the player can unlock progressive hints from the Hint Drawer at a score penalty (-10 per hint).
5. **Suspect Accusation**:
   - Player transitions to the Accusation View, picks the prime suspect, and submits their logical deduction / reasoning.
6. **Final Verdict & Debrief**:
   - The server evaluates the accusation against the secret `culpritId`, calculates the final score, reveals the true solution, and presents a complete debrief breakdown.

---

## 5. Page & View Breakdown

### 1. Home / Landing View (`/`)
- Atmospheric noir / detective aesthetic with briefing headline.
- Overview of game mechanics, difficulty tiers, and scoring system.
- Direct CTA: **"Start New Investigation"**.
- Recent solved cases or case archive preview.

### 2. Create Mystery View (`/create`)
- Custom theme/premise input field with quick-select prompt ideas (e.g., "Art Gallery Heist", "Luxury Yacht Murder", "Library Secret Society").
- Difficulty Selector:
  - **Easy**: 3 suspects, 5 clues, 2 hints | Base score: 100 points
  - **Medium**: 4 suspects, 7 clues, 3 hints | Base score: 150 points
  - **Hard**: 5 suspects, 9 clues, 3 hints | Base score: 200 points
- Interactive generation loader displaying real-time AI generation status steps (e.g., "Analyzing crime scene...", "Fabricating alibis...", "Planting forensic clues...").

### 3. Investigation Room View (`/case/:id`)
- **Case Header & Dossier**: Title, premise briefing, difficulty badge, active score tracker, and case status.
- **Suspect Cards**: Interactive cards displaying avatar, role, bio, alibi, and motive. Ability to tag suspects (e.g., "Suspicious", "Cleared").
- **Clue Discovery Board**: Interactive grid/cards of discovered and undiscovered clues. Clicking an undiscovered clue reveals its forensic report and awards discovery points.
- **Hint Request Drawer / Panel**: Allows the detective to unlock progressive hints, showing the cost in points before confirmation.
- **Action Bar**: Fixed navigation with quick access to the "Make Accusation" desk.

### 4. Accusation View (`/case/:id/accuse`)
- Formal accusation interface.
- Culprit selection carousel or radio cards with suspect avatars and summaries.
- Mandatory deduction text box: "State your line of reasoning and conclusive evidence".
- Final warning modal to prevent accidental submissions.

### 5. Results View (`/case/:id/result`)
- Case Outcome Banner: **SOLVED - Case Closed** or **FAILED - Suspect Acquitted**.
- Culprit Revelation: Identity of the real culprit vs. the player's accused suspect.
- Comprehensive Solution Explanation: Full canonical narrative of how the crime occurred.
- Score Breakdown Card:
  - Base difficulty points
  - Clues discovered bonus (+5 pts each)
  - Hints used penalty (-10 pts each)
  - Accusation accuracy bonus/penalty
  - Final total score (guaranteed $\ge 0$)
- Options: "Review Case Archive" or "Solve Another Mystery".

---

## 6. Database Model (`Case`)

The MongoDB Mongoose schema defines the full lifecycle of a mystery case:

```typescript
interface ISuspect {
  id: string;              // e.g. "suspect-1"
  name: string;
  role: string;
  bio: string;
  alibi: string;
  motive: string;
}

interface IClue {
  id: string;              // e.g. "clue-1"
  title: string;
  description: string;
  discovered: boolean;
}

interface IHint {
  id: string;              // e.g. "hint-1"
  text: string;
  used: boolean;
}

interface IAccusation {
  accusedSuspectId?: string;
  reason?: string;
  isCorrect?: boolean;
  submittedAt?: Date;
}

interface ICase {
  title: string;
  premise: string;
  difficulty: 'easy' | 'medium' | 'hard';
  suspects: ISuspect[];
  clues: IClue[];
  hints: IHint[];
  culpritId: string;                 // Strictly confidential on server
  solutionExplanation: string;       // Strictly confidential on server
  accusation?: IAccusation;
  score: number;                     // Default: Base score for difficulty
  status: 'investigating' | 'solved' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 7. API Contracts

### 1. `POST /api/cases`
- **Description**: Generates a mystery via Gemini API, configures base score, and saves case in database.
- **Request Body**:
  ```json
  {
    "premise": "A high-stakes wine auction murder at a French chateau",
    "difficulty": "medium"
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "case": {
      "id": "664fa1...",
      "title": "The Poisoned Vintage",
      "premise": "...",
      "difficulty": "medium",
      "score": 150,
      "status": "investigating",
      "suspects": [...],
      "clues": [...],
      "hints": [...]
    }
  }
  ```
  *(Note: `culpritId` and `solutionExplanation` are excluded from the response)*

### 2. `GET /api/cases/:id`
- **Description**: Fetches active case state for the investigation room.
- **Security**: Must exclude `culpritId` and `solutionExplanation` while `status === 'investigating'`.
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "case": {
      "_id": "664fa1...",
      "title": "The Poisoned Vintage",
      "premise": "...",
      "difficulty": "medium",
      "status": "investigating",
      "score": 155,
      "suspects": [...],
      "clues": [...],
      "hints": [...]
    }
  }
  ```

### 3. `POST /api/cases/:id/clues/:clueId/discover`
- **Description**: Marks a specific clue as discovered and awards +5 score points.
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "clueId": "clue-2",
    "discovered": true,
    "score": 160,
    "message": "Clue analyzed and logged to dossier."
  }
  ```

### 4. `POST /api/cases/:id/hints`
- **Description**: Unlocks the next available unused hint and deducts 10 points (score floor: 0).
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "hint": {
      "id": "hint-1",
      "text": "Check the wine cellar entry log timestamps closely against the dinner toast.",
      "used": true
    },
    "score": 150,
    "remainingHints": 2
  }
  ```

### 5. `POST /api/cases/:id/accuse`
- **Description**: Evaluates accused suspect against server-held `culpritId`, updates case status (`solved` or `failed`), records accusation details, calculates final score, and reveals culprit & full explanation.
- **Request Body**:
  ```json
  {
    "accusedSuspectId": "suspect-2",
    "reason": "The broken glass in the cellar matches the vintage bottle only suspect-2 had access to."
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "isCorrect": true,
    "status": "solved",
    "finalScore": 170,
    "culpritId": "suspect-2",
    "solutionExplanation": "The sommelier substituted the 1945 Bordeaux with a poisoned decanter...",
    "accusation": {
      "accusedSuspectId": "suspect-2",
      "reason": "...",
      "isCorrect": true,
      "submittedAt": "2026-10-25T11:30:00.000Z"
    }
  }
  ```

### 6. `GET /api/cases/:id/result`
- **Description**: Fetches complete post-investigation debrief including revealed culprit and explanation.
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "case": {
      "_id": "664fa1...",
      "title": "...",
      "difficulty": "medium",
      "status": "solved",
      "score": 170,
      "culpritId": "suspect-2",
      "solutionExplanation": "...",
      "accusation": { ... },
      "suspects": [...],
      "clues": [...],
      "hints": [...]
    }
  }
  ```

---

## 8. Game Logic & Scaling Rules

| Difficulty | Suspect Count | Clue Count | Hint Count | Base Score |
| :--- | :---: | :---: | :---: | :---: |
| **Easy** | 3 | 5 | 2 | 100 pts |
| **Medium** | 4 | 7 | 3 | 150 pts |
| **Hard** | 5 | 9 | 3 | 200 pts |

### Scoring Formula:
$$\text{Final Score} = \max(0, \text{Base Score} + (\text{Discovered Clues} \times 5) - (\text{Used Hints} \times 10) + \text{Accusation Result})$$
- **Correct Accusation**: Preserves all earned points.
- **Incorrect Accusation**: Imposes a 50-point penalty on final score (cannot drop below 0).
- **Minimum Score Floor**: $0$ points.

---

## 9. Anti-Cheat & Security Policy

1. **Information Concealment**:
   - The Mongoose schema query projection strictly omits `-culpritId -solutionExplanation` on all read endpoints (`GET /api/cases/:id`) until the case status is officially updated to `'solved'` or `'failed'` via `POST /api/cases/:id/accuse`.
2. **Deterministic Server-Side Verification**:
   - The server validates the accusation against the secret stored `culpritId`.
   - The client never performs or dictates the correctness check.
3. **Idempotent Actions**:
   - Discovering an already discovered clue yields no additional score points.
   - Hint requests unlock hints sequentially and deduct points only when a new hint is revealed.
   - Once an accusation is submitted, the case is sealed and further clue discovery or hint requests are rejected.
