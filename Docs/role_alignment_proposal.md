# Proposal: Director's Character Fit Analysis

This proposal outlines the implementation plan for the **Director's Character Fit Analysis** feature. 

Unlike general look-alike matching, this feature directly measures how well an actor’s visual presence, physicality, vocal profile, and performance energy align with the **specific character requirements defined by the director** when uploading a script.

---

## 1. How Character Requirements are Defined

When a director uploads a script to the platform, they will define the character's profile. We propose adding the following fields to the `script` table:

* **`character_name`**: Name of the role (e.g., "Detective Miller").
* **`character_description`**: General description of personality, traits, and energy (e.g., "A cynical, world-weary detective who has seen too much. Calm exterior but carries deep emotional tension.").
* **`physicality_requirements`**: Expected body language, posture, and physical traits (e.g., "Rigid, guarded posture; minimal waste movement; intense and direct eye contact.").
* **`vocal_requirements`**: Expected tone, pacing, and pitch of voice (e.g., "Low, gravelly, slow delivery, speaking in quiet but commanding tones.").

---

## 2. Recommended Evaluation Parameters & Scoring

We recommend evaluating the audition across **4 Core Parameters**. Each parameter receives a score from `0` to `100` and detailed, actionable AI feedback matching the director's instructions:

| Parameter | What the AI Analyzes | Example Director Definition | Actionable AI Feedback Example |
| :--- | :--- | :--- | :--- |
| **1. Visual & Castability Fit** | Face shape, expression baseline, age range, styling, and general casting compatibility. | "Weathered, rugged look, late 30s/40s." | **Score: 78%**<br>"Your facial structure and short beard fit the rugged aesthetic. However, the bright, casual modern hoodie distracts from the noir style; consider a dark trench coat or collared shirt." |
| **2. Physicality & Posture** | Body language, posture, hand gestures, shoulder positioning, and movement speed. | "Rigid, closed posture, defensive or guarded stance." | **Score: 55%**<br>"You are leaning forward and moving your hands too expressively. For Detective Miller, pull your shoulders back, cross your arms, and maintain a still, tense posture." |
| **3. Vocal Characterization** | Speech pacing, pitch, resonance, volume dynamics, and tone (e.g., gravelly, breathy). | "Low, gravelly voice with a slow, deliberate pace." | **Score: 90%**<br>"Excellent control. You kept your pitch low and spoke at a measured, slow rate (110 words/min), which perfectly captures the detective's cold cynicism." |
| **4. Character Essence (Subtext)** | Emotional consistency, subtext delivery, micro-expressions, and eye contact connection. | "Cynical, distant, holding back anger under a calm surface." | **Score: 68%**<br>"Your emotional intensity was high, but it felt too overtly angry. The director requested a 'calm exterior holding back anger'. Try narrowing your eyes slightly and speaking with less volume but more intensity." |

---

## 3. Database Schema Modifications

To store these parameters and display them, we propose the following changes:

### Update `script` Table
```sql
ALTER TABLE script 
ADD COLUMN character_name VARCHAR(255),
ADD COLUMN character_description TEXT,
ADD COLUMN physicality_requirements TEXT,
ADD COLUMN vocal_requirements TEXT;
```

### Create `character_fit_analysis` Table
Stores the results of the alignment analysis.
```sql
CREATE TABLE character_fit_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    performance_id UUID REFERENCES performance(id) ON DELETE CASCADE,
    overall_fit_score INTEGER CHECK (overall_fit_score BETWEEN 0 AND 100),
    
    -- Visual Fit
    visual_score INTEGER CHECK (visual_score BETWEEN 0 AND 100),
    visual_feedback TEXT,
    
    -- Physicality Fit
    physicality_score INTEGER CHECK (physicality_score BETWEEN 0 AND 100),
    physicality_feedback TEXT,
    
    -- Vocal Fit
    vocal_score INTEGER CHECK (vocal_score BETWEEN 0 AND 100),
    vocal_feedback TEXT,
    
    -- Essence/Subtext Fit
    essence_score INTEGER CHECK (essence_score BETWEEN 0 AND 100),
    essence_feedback TEXT,
    
    director_verdict TEXT, -- E.g., "Strong Callback Potential", "Needs Adjustment"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Backend & Prompt Logic

When the server action `analyzePerformanceAction` runs, it will extract the script's character definitions and inject them into the Gemini prompt:

```typescript
const prompt = `
  You are an expert Casting Director evaluating a screen test performance.
  Review the provided video and evaluate how closely the actor's physical presence, body language, vocal delivery, and emotional subtext align with the Director's Character Specifications.

  DIRECTOR'S CHARACTER SPECIFICATIONS:
  - Role: ${characterName}
  - Description: ${characterDescription}
  - Physicality / Posture Requirements: ${physicalityRequirements}
  - Vocal Requirements: ${vocalRequirements}

  Evaluate the performance across these 4 parameters on a scale of 0 to 100, providing actionable, detailed feedback for each:
  1. Visual & Castability Fit (facial matching, styling, age range)
  2. Physicality & Posture (postural stillness, gestures, body language)
  3. Vocal Characterization (pitch, pacing, resonance, volume)
  4. Character Essence (emotional subtext, micro-expressions, inner life)

  Also provide an overall casting verdict (e.g. 'Strong Callback Potential' or 'Needs Adjustment').

  Output the results strictly in JSON format matching this structure:
  {
    "overall_fit_score": number,
    "visual": { "score": number, "feedback": "string" },
    "physicality": { "score": number, "feedback": "string" },
    "vocal": { "score": number, "feedback": "string" },
    "essence": { "score": number, "feedback": "string" },
    "director_verdict": "string"
  }
`;
```

---

## 5. UI/UX Concept (Castability Dashboard)

We suggest creating a dedicated **"Director's Fit"** panel in the Analysis screen:

1. **Role Spec Card (Top Left)**:
   * A premium editorial-style summary of what the director wanted (e.g., *"Role: Detective Miller. Vibe: Cynical Noir, Low Gravelly Voice"*).
2. **Overall Character Fit Meter (Center)**:
   * A large, clean circular progress gauge showing the **Overall Fit Score** (e.g., `78% Match`).
   * Below it, the **AI Verdict**: *"Strong Callback Potential"* or *"Needs Alignment on Stature & Wardrobe"*.
3. **Four-Parameter Score Cards (Bottom)**:
   * Displaying the 4 parameters in a grid with custom status indicators:
     * **Vocal Characterization** `90%` — Green status with positive feedback.
     * **Physicality & Posture** `55%` — Amber status, highlighting that the actor was "too expressive with hand gestures."
4. **Interactive "Adjust Your Rehearsal" Playbook (Right Column)**:
   * A list of actionable fixes to help the actor increase their score:
     * 👕 *Wardrobe*: "Swap the casual hoodie for a darker jacket."
     * 🧘 *Body Language*: "Keep hand movements minimal and drop your chin to look more threatening."
