# API Documentation

This document provides an overview of the APIs used in the Audition Coach application, including Server Actions, Route Handlers, and direct Supabase interactions.

## 1. Authentication

### POST /auth/signout
Signs out the current user and clears the session.

- **URL:** `/auth/signout`
- **Method:** `POST`
- **Description:** Uses Supabase Auth to sign out the user and redirects to the home page.
- **Request Parameters:** None
- **Response:** 
  - `302 Redirect` to `/`

### Sign In (Client-side)
Handled via Supabase Browser Client.

- **Method:** `supabase.auth.signInWithPassword()`
- **Description:** Authenticates a user with email and password.
- **Request Parameters:**
  - `email`: (string) User's email address
  - `password`: (string) User's password
- **Response:**
  - `data`: Auth session and user object
  - `error`: Auth error object (if any)

### Sign Up (Client-side)
Handled via Supabase Browser Client.

- **Method:** `supabase.auth.signUp()`
- **Description:** Registers a new user.
- **Request Parameters:**
  - `email`: (string) User's email address
  - `password`: (string) User's password
  - `options`: (object) Additional metadata (e.g., `full_name`)
- **Response:**
  - `data`: Auth user object
  - `error`: Auth error object (if any)

---

## 2. Performance & Analysis

### analyzePerformanceAction
A Next.js Server Action that triggers AI analysis using Gemini.

- **Function:** `analyzePerformanceAction(performanceId)`
- **File:** `apps/web/src/app/actions/performance.ts`
- **Description:** 
  1. Downloads the video from Supabase Storage.
  2. Uploads it to Google AI (Gemini).
  3. Prompts Gemini for a line-by-line acting analysis.
  4. Saves results to `performance_analysis`, `analysis_lines`, and `analysis_errors` tables.
- **Request Parameters:**
  - `performanceId`: (string) The ID of the performance to analyze.
- **Response:**
  - `success`: (boolean) Whether the analysis was triggered successfully.
  - `analysisId`: (string, optional) The ID of the created analysis record.
  - `error`: (string, optional) Error message if failed.
  - `isRetryable`: (boolean, optional) True if the error was a 503/High Demand.

### Upload Performance (Logic)
Handled in `PerformanceUploader.tsx`.

- **Description:** Two-step process: Upload video to storage, then register entry in database.
- **Storage Path:** `audition videos` bucket -> `performances/{userId}/{scriptId}/{timestamp}.{ext}`
- **Database Table:** `performance`
- **Request Parameters:**
  - `file`: (File) The video file (max 50MB).
  - `scriptId`: (string) ID of the script being practiced.
  - `userId`: (string) ID of the user.
- **Response:**
  - `id`: (string) The generated `performance_id`.

---

## 3. Data Retrieval (Supabase PostgREST)

### Fetch Scripts
- **Table:** `script`
- **Description:** Retrieves all available scripts for practice.
- **Query:** `.from('script').select('*').order('created_date_time', { ascending: false })`

### Fetch Performance History
- **Table:** `performance`
- **Description:** Retrieves user's history with completed analyses.
- **Query:** 
  ```typescript
  .from('performance')
  .select('..., performance_analysis!inner(...)')
  .eq('user_id', userId)
  .eq('performance_analysis.status', 'completed')
  ```

### Fetch Profile Stats
- **Table:** `performance_analysis`
- **Description:** Calculates total attempts and average score for the profile card.
- **Query:** `.from('performance_analysis').select('overall_score, status').eq('user_id', userId)`

---

## Database Schema (Summary)

| Table | Purpose |
| :--- | :--- |
| `script` | Contains scene contexts, categories, and dialogue scripts. |
| `performance` | Stores video URLs and metadata for each user attempt. |
| `performance_analysis` | High-level scores and director's notes for a performance. |
| `analysis_lines` | Detailed metrics (emotion, facial, etc.) for each line of dialogue. |
| `analysis_errors` | Specific mispronunciations or missing/extra words. |
