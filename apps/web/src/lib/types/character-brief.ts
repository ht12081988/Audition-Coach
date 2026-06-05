// Single source of truth for the CharacterBrief contract.
// Consumed by: buildCharacterFitBlock (prompts), buildCharacterBriefFromScript (performance.ts),
// and any UI component that displays or reads character brief data.

export type VisualBrief = {
  screen_presence_note: string;
  physical_world_fit: string;
  role_specific_physicality: string;
};

export type CharacterBrief = {
  archetype: string;
  emotional_arc: string;
  status_in_scene: string;
  energy_signature: string;
  psychological_core: string;
  physical_presence: string;
  voice_character: string;
  director_vision_note: string;
  visual_brief: VisualBrief;
};
