# Smooth Note Maker 📝✨

**Smooth Note Maker** is a production-ready, Google-account-only handwritten notes and diagramming application inspired by Microsoft OneNote's note-library experience and powered by Excalidraw.

All drawings, notes, and diagrams are stored directly in your own personal Google Drive (inside a visible `"Smooth Note Maker Notes"` folder) and cached locally in IndexedDB for instant loading, offline resilience, and automatic synchronization.

---

## Key Features

- 🔐 **Google-Only Authentication**: Built with NextAuth.js (Auth.js) using Google OAuth 2.0 as the exclusive sign-in provider.
- 🗂️ **Zero Database / Zero Paid Storage**: Notes are saved as valid `.excalidraw` JSON files directly into your Google Drive using the least-privileged `https://www.googleapis.com/auth/drive.file` scope.
- 📒 **OneNote-Style Note Library**:
  - Collapsible sidebar with active note highlighting, live search, and sorting (last edited, alphabetical, created).
  - Note management: New Note, Rename (inline & modal), Duplicate, Delete, Export (.excalidraw), and Drive Folder shortcut.
  - Pre-built templates: **Blank Canvas**, **Lined Notebook Paper**, **Grid Math Graph**, **Meeting Notes**, and **Brainstorm Mindmap**.
- ⚡ **700ms Debounced Autosave**:
  - Immediate local save to IndexedDB cache.
  - Automatic background synchronization to Google Drive after 700ms of inactivity.
  - Real-time status badges: `Saving locally...`, `Syncing to Google Drive...`, `Saved`, `Offline changes pending`, and `Sync failed`.
  - Manual **"Save Now"** trigger button.
- 🔌 **Offline Resilience & Sync Queue**:
  - Draw and edit freely without an internet connection.
  - Automatic FIFO sync queue uploads pending changes when your internet connection is restored.
- 🛡️ **Conflict Resolution**:
  - Detects if a note was modified remotely on another device.
  - Visual side-by-side conflict dialog with 3 options: *Keep Drive Version*, *Overwrite Drive*, or *Save as New Copy*.
- 🎨 **Full Excalidraw Drawing Suite**:
  - Handwritten strokes, shapes, text, arrows, colors, grid mode, dark mode, laser pointer, and image attachments.
  - Native file import & export.

---

## Architecture Overview

```
smooth-note-maker/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts   # NextAuth Google OAuth handler
│   │   │   └── drive/                        # Server-side Google Drive REST endpoints
│   │   │       ├── files/route.ts            # List & create notes
│   │   │       ├── files/[id]/route.ts       # Get, update, rename, delete note
│   │   │       ├── folder/route.ts           # Get or create "Smooth Note Maker Notes" folder
│   │   │       └── sync/route.ts             # Batch offline queue processor
│   │   ├── dashboard/page.tsx                # Main OneNote library & canvas workspace
│   │   ├── login/page.tsx                    # Google sign-in landing page
│   │   └── layout.tsx                        # Root layout with NextAuth & Toast providers
│   ├── components/
│   │   ├── auth/                             # LoginCard, UserMenu, AuthGuard
│   │   ├── editor/                           # ExcalidrawWrapper, EditorHeader, ConflictModal
│   │   ├── sidebar/                          # NoteSidebar, NoteList, NoteItem, SearchBar
│   │   └── ui/                               # SyncBadge, Toast, Modal, Button, Spinner, EmptyState
│   ├── hooks/                                # useNotes, useAutosave, useSyncQueue
│   ├── lib/
│   │   ├── auth/                             # NextAuth configuration & token refresh
│   │   ├── db/                               # IndexedDB storage & offline sync queue
│   │   ├── drive/                            # Google Drive REST client & operations
│   │   └── excalidraw/                       # Serializer, Validator, Templates, Export
│   └── types/                                # TypeScript interfaces
└── tests/                                    # Unit & Integration test suite
```

---

## Getting Started & Google OAuth Setup

### 1. Google Cloud Console Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., `smooth-note-maker`).
3. Navigate to **APIs & Services > Library** and enable the **Google Drive API**.
4. Navigate to **APIs & Services > OAuth consent screen**:
   - Select **External** user type and click **Create**.
   - Enter your App Name: `Smooth Note Maker` and User support email.
   - In the **Scopes** step, click **Add or Remove Scopes** and select:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
     - `https://www.googleapis.com/auth/drive.file`
   - In the **Test users** step, add your personal Google account email(s).
5. Navigate to **APIs & Services > Credentials**:
   - Click **Create Credentials > OAuth client ID**.
   - Application type: **Web application**.
   - Name: `Smooth Note Maker Web Client`.
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `https://your-deployment-url.vercel.app`
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://your-deployment-url.vercel.app/api/auth/callback/google`
   - Click **Create** and copy the **Client ID** and **Client Secret**.

---

### 2. Local Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Populate the variables in `.env.local`:

```env
NEXTAUTH_SECRET=generate_a_random_32_char_secret_with_openssl
NEXTAUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

*(You can generate `NEXTAUTH_SECRET` by running `openssl rand -base64 32` in terminal).*

---

### 3. Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 4. Running Automated Tests

```bash
# Run all Vitest unit and integration tests
npm test
```

---

### 5. Production Build & Vercel Deployment

```bash
# Verify build
npm run build
```

#### Deploying to Vercel:

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Under **Project Settings > Environment Variables**, add:
   - `NEXTAUTH_SECRET` (random 32-character string)
   - `NEXTAUTH_URL` (`https://<your-project-name>.vercel.app`)
   - `GOOGLE_CLIENT_ID` (from Google Cloud Console)
   - `GOOGLE_CLIENT_SECRET` (from Google Cloud Console)
4. Update your Google Cloud Console OAuth Credentials with your Vercel production domain in **Authorized JavaScript origins** and **Authorized redirect URIs**.
5. Click **Deploy**!

---

## Security & Privacy Highlights

- **Least-Privilege Drive Scope**: The app only asks for `drive.file` access. It can **only** read and modify files that it created itself or that the user explicitly opened with the app. It cannot view any other files in your Google Drive.
- **Server-Side Token Handling**: Google OAuth access tokens and refresh tokens are securely stored in server-side HTTP-only encrypted sessions and never sent or exposed to client-side JavaScript.
- **No Third-Party Database**: No database or external servers store user notes. Data flows directly between your browser and your Google Drive.
