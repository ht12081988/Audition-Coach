import type { CharacterBrief } from '@/lib/types/character-brief';

/**
 * Builds the STEP 7+8 character fit evaluation block injected into the second
 * Gemini call. The prompt is self-contained — it receives the same video file
 * URI as Call 1 and evaluates character fit independently of the line analysis.
 */
export function buildCharacterFitBlock(brief: CharacterBrief): string {
  return `
You are an expert Casting Director reviewing a self-tape audition.

STEP 7: CHARACTER FIT EVALUATION

The director has defined the following vision for this role.
Evaluate the actor's performance against each dimension.
Score each 0–100 and write one specific observation (2 sentences max).
Base your evaluation ONLY on what is visible and audible in the video.

DIRECTOR'S CHARACTER BRIEF:
──────────────────────────────────────────────────────────────
Archetype:              ${brief.archetype}
Emotional Arc:          ${brief.emotional_arc}
Status in Scene:        ${brief.status_in_scene}
Energy Signature:       ${brief.energy_signature}
Psychological Core:     ${brief.psychological_core}
Physical Presence:      ${brief.physical_presence}
Voice Character:        ${brief.voice_character}
Director's Vision:      ${brief.director_vision_note}

Visual — Screen Presence:     ${brief.visual_brief.screen_presence_note}
Visual — World Fit:           ${brief.visual_brief.physical_world_fit}
Visual — Role Physicality:    ${brief.visual_brief.role_specific_physicality}
──────────────────────────────────────────────────────────────

EVALUATION INSTRUCTIONS PER DIMENSION:

1. ARCHETYPE EMBODIMENT (0–100)
   Does the actor embody "${brief.archetype}"?
   Look for: does the performance have layers, or is it only playing the surface?
   Look for: is the character's defining contradiction present — the wound beneath
             the persona, the fear beneath the control, the truth beneath the mask?
   Flag if:  the actor plays only one layer — either all surface charm or all
             exposed emotion, with no evidence of the tension between the two.
   Flag if:  the dominant quality the director named is absent entirely.

2. EMOTIONAL ARC FIDELITY (0–100)
   The director expects this arc: "${brief.emotional_arc}"
   Look for: does the performance follow this shape — does it move through
             the emotional sequence the director described, in the right order?
   Look for: are there visible gear changes between emotional registers,
             or does the performance stay in one emotional lane throughout?
   Flag if:  the arc is flat — no discernible movement between opening
             and closing emotional state.
   Flag if:  the arc runs in reverse — the actor opens vulnerable and
             closes defended, when the brief specifies the opposite.
   Flag if:  key transitions described in the arc are skipped or rushed.

3. STATUS PORTRAYAL (0–100)
   Expected status: "${brief.status_in_scene}"
   Look for: how does the actor claim, hold, or cede control of the scene?
   Look for: are status shifts — where specified — legible and motivated,
             or do they feel accidental?
   Look for: does high status come from precision and timing rather than
             volume and physical dominance?
   Flag if:  status is established through the wrong means — shouting
             instead of silence, aggression instead of economy.
   Flag if:  status is static when the brief specifies it should shift.
   Flag if:  the actor cedes status in moments where the character
             would never surrender it.

4. ENERGY SIGNATURE MATCH (0–100)
   Expected energy: "${brief.energy_signature}"
   Look for: does the texture of the actor's presence match this descriptor
             across the full duration of the scene?
   Look for: is stillness charged, or is it simply absence of movement?
   Look for: are transitions in energy intentional and controlled,
             or reactive and unplanned?
   Flag if:  energy is consistent and predictable — the audience can
             always see what is coming next.
   Flag if:  the energy quality contradicts the brief —
             e.g. nervous when the brief says contained,
             or static when the brief says mercurial.
   Flag if:  the actor only finds the right energy register in isolated
             moments rather than sustaining it.

5. PSYCHOLOGICAL CORE VISIBILITY (0–100)
   The director states this character is driven by: "${brief.psychological_core}"
   Look for: observable signals of this inner life — pause placement,
             where eye contact breaks, where the voice shifts register,
             moments where behaviour and words do not align.
   Look for: evidence that the actor's choices are motivated by this
             specific psychology rather than a generic emotional read.
   Flag if:  the actor plays the surface behaviour without the
             motivation underneath it — anger without the shame,
             confidence without the fear, warmth without the cost.
   Flag if:  no moment in the performance suggests awareness of the
             character's psychological contradiction.
   NOTE:     Score this dimension based solely on observable signals.
             Do not infer internal states that are not evidenced in
             the video. If evidence is insufficient, note that
             explicitly in the comment.

6. PHYSICAL & VOCAL ALIGNMENT (0–100)
   Director expects physically: "${brief.physical_presence}"
   Director expects vocally:    "${brief.voice_character}"
   Look for: does the actor's use of their body match the physical
             descriptor — precision vs. looseness, expansion vs.
             contraction, stillness vs. motion?
   Look for: does the vocal rhythm, pace, and dynamic range match
             the voice descriptor — where do pauses land, how does
             volume track with dramatic intent?
   Look for: are physical and vocal choices specific and deliberate,
             or generic and habitual?
   Flag if:  physical choices are loose or expansive when the brief
             calls for precision and economy.
   Flag if:  pauses read as uncertain rather than chosen.
   Flag if:  vocal dynamics are flat — no meaningful variation in
             pace, pitch, or volume across the scene.
   Flag if:  body and voice are working against each other — e.g.
             face performing one emotional state while voice delivers
             another with no dramatic logic connecting them.

7. OVERALL CASTING FIT (0–100)
   Director's core question: "${brief.director_vision_note}"
   This is a simple average of dimensions 1–6 above. Do NOT invent a separate score.
   Calculate: Math.round((archetype + emotional_arc + status + energy + psych_core + phys_vocal) / 6)
   Write fit_vs_performance_gap: one sentence comparing character
   fit score to the actor's overall performance score and stating
   clearly what that gap means for casting.
   Write director_recommendation: one concrete next step —
   callback, redirect, redirect with specific instruction,
   or do not proceed — with the reason.

8. SCREEN PRESENCE & VISUAL CHARACTER FIT (0–100)
   Director's screen presence note: "${brief.visual_brief.screen_presence_note}"
   Director's world fit note:       "${brief.visual_brief.physical_world_fit}"
   Director's role physicality note:"${brief.visual_brief.role_specific_physicality}"

   SCOPE — evaluate ONLY the following observable qualities:

   a) CAMERA EXPRESSIVENESS
      How does the actor's face read on camera when still?
      Does the face carry subtext without the actor announcing it?
      Is there legible inner life visible between the lines,
      or does the face reset to neutral between moments?

   b) PRESENTATION REGISTER
      Does the actor's visible grooming, styling, and wardrobe
      in the self-tape align with the role world the director described?
      Does their overall visual register place the audience in
      the right context for this character?

   c) PHYSICAL PRECISION MATCH
      Based on what is visible in the frame — do the actor's
      physical choices (use of hands, posture, movement economy)
      align with the role-specific physicality the director noted?

   d) VISUAL WORLD COHERENCE
      Does the actor look like they belong in the story world
      this character inhabits, based on the director's world note?

   STRICT EXCLUSIONS — do NOT score or comment on:
   - Facial attractiveness or conventional beauty
   - Body type beyond what the role's physical logic requires
   - Age beyond what is legible on camera for this role
   - Race, ethnicity, or cultural background
   - Gender presentation beyond the director's explicit brief
   - Any characteristic not named in the director's visual brief above

   If video quality is insufficient to assess screen presence,
   return score: null and comment "Video resolution or framing
   insufficient for reliable visual assessment — recommend
   reviewing a resubmitted tape with standard self-tape lighting."

OUTPUT FORMAT — return ONLY this JSON object, no other text:

{
  "character_fit": {
    "casting_fit_score": number,
    "casting_label": string,
    "dimensions": {
      "archetype_embodiment": {
        "score": number,
        "comment": "string"
      },
      "emotional_arc_fidelity": {
        "score": number,
        "comment": "string"
      },
      "status_portrayal": {
        "score": number,
        "comment": "string"
      },
      "energy_signature_match": {
        "score": number,
        "comment": "string"
      },
      "psychological_core_visibility": {
        "score": number,
        "comment": "string"
      },
      "physical_vocal_alignment": {
        "score": number,
        "comment": "string"
      },
      "screen_presence": {
        "score": number | null,
        "comment": "string",
        "sub_scores": {
          "camera_expressiveness": number | null,
          "presentation_register": number | null,
          "physical_precision_match": number | null,
          "visual_world_coherence": number | null
        }
      }
    },
    "fit_vs_performance_gap": "string",
    "director_recommendation": "string"
  }
}

CASTING LABEL RULES:
- casting_fit_score 0–40   → "Not the right fit"
- casting_fit_score 41–60  → "Interesting but misaligned"
- casting_fit_score 61–80  → "Strong consideration"
- casting_fit_score 81–100 → "Call them back"

casting_fit_score MUST be the simple average of all 6 primary dimension scores
(archetype_embodiment + emotional_arc_fidelity + status_portrayal +
energy_signature_match + psychological_core_visibility + physical_vocal_alignment) / 6,
rounded to the nearest integer. Do NOT include screen_presence in this average.
  `;
}

/**
 * Maps a raw Supabase script row to a CharacterBrief.
 * Returns null if the script has no brief defined — which skips Call 2 entirely.
 */
export function buildCharacterBriefFromScript(script: any): CharacterBrief | null {
  if (!script?.archetype) return null;

  return {
    archetype:            script.archetype,
    emotional_arc:        script.emotional_arc        ?? '',
    status_in_scene:      script.status_in_scene      ?? '',
    energy_signature:     script.energy_signature     ?? '',
    psychological_core:   script.psychological_core   ?? '',
    physical_presence:    script.physical_presence    ?? '',
    voice_character:      script.voice_character      ?? '',
    director_vision_note: script.director_vision_note ?? '',
    visual_brief: {
      screen_presence_note:      script.screen_presence_note      ?? '',
      physical_world_fit:        script.physical_world_fit        ?? '',
      role_specific_physicality: script.role_specific_physicality ?? '',
    },
  };
}
