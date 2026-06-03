/**
 * Utility for calculating advanced performance metrics from line-by-line analysis.
 */

export interface AnalysisLine {
  id: string;
  line_number: number;
  score_emotion: number;
  score_facial: number;
  score_diction: number;
  score_pacing: number;
  score_eyes: number;
  score_intent: number;
  original_text: string;
  analysis_errors?: {
    error_type: 'mispronounced' | 'missing' | 'extra';
  }[];
}

export interface PerformanceStats {
  stabilityScore: number;
  wordIntegrityRate: number;
  focusFatigue: number;
  emotionalArcData: { line: number; intensity: number }[];
  dictionEmotionCorrelation: number;
  beatBalance: {
    intent: number;
    emotion: number;
    visual: number;
  };
  staminaData: { line: number; value: number }[];
}

export function calculatePerformanceStats(lines: AnalysisLine[]): PerformanceStats {
  if (!lines || lines.length === 0) {
    return {
      stabilityScore: 0,
      wordIntegrityRate: 0,
      focusFatigue: 0,
      emotionalArcData: [],
      dictionEmotionCorrelation: 0,
      beatBalance: { intent: 0, emotion: 0, visual: 0 },
      staminaData: []
    };
  }

  // 1. Stability Score (Standard Deviation of scores)
  const totalScores = lines.map(l => (l.score_emotion + l.score_intent + l.score_facial) / 3);
  const mean = totalScores.reduce((a, b) => a + b, 0) / totalScores.length;
  const variance = totalScores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / totalScores.length;
  const stdDev = Math.sqrt(variance);
  const stabilityScore = Math.max(0, Math.min(100, 100 - (stdDev * 2.5))); // Normalized

  // 2. Word Integrity Rate (WIR)
  let totalWords = 0;
  let totalErrors = 0;
  lines.forEach(line => {
    const words = line.original_text.split(/\s+/).filter(w => w.length > 0).length;
    totalWords += words;
    totalErrors += (line.analysis_errors?.length || 0);
  });
  const wordIntegrityRate = totalWords > 0 
    ? Math.max(0, Math.min(100, ((totalWords - totalErrors) / totalWords) * 100))
    : 100;

  // 3. Focus Fatigue (First 25% vs Last 25%)
  const quarter = Math.max(1, Math.floor(lines.length * 0.25));
  const startLines = lines.slice(0, quarter);
  const endLines = lines.slice(-quarter);
  const startAvg = startLines.reduce((a, b) => a + (b.score_eyes + b.score_facial) / 2, 0) / quarter;
  const endAvg = endLines.reduce((a, b) => a + (b.score_eyes + b.score_facial) / 2, 0) / quarter;
  const focusFatigue = startAvg > 0 ? ((startAvg - endAvg) / startAvg) * 100 : 0;

  // 4. Emotional Arc Data
  const emotionalArcData = lines.map(l => ({
    line: l.line_number,
    intensity: (l.score_emotion + l.score_intent) / 2
  }));

  // 5. Diction vs Emotion Correlation (Pearson)
  const emotionArr = lines.map(l => l.score_emotion);
  const dictionArr = lines.map(l => l.score_diction);
  const dictionEmotionCorrelation = calculateCorrelation(emotionArr, dictionArr);

  // 6. Beat Balance (Structural averages)
  const beatBalance = {
    intent: lines.reduce((a, b) => a + b.score_intent, 0) / lines.length,
    emotion: lines.reduce((a, b) => a + b.score_emotion, 0) / lines.length,
    visual: lines.reduce((a, b) => a + (b.score_facial + b.score_eyes) / 2, 0) / lines.length
  };

  // 7. Stamina Data (Per-line visual focus)
  const staminaData = lines.map(l => ({
    line: l.line_number,
    value: (l.score_facial + l.score_eyes) / 2
  }));

  return {
    stabilityScore,
    wordIntegrityRate,
    focusFatigue,
    emotionalArcData,
    dictionEmotionCorrelation,
    beatBalance,
    staminaData
  };
}

function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 2) return 1;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
  const sumX2 = x.reduce((a, b) => a + b * b, 0);
  const sumY2 = y.reduce((a, b) => a + b * b, 0);

  const num = n * sumXY - sumX * sumY;
  const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  if (den === 0) return 0;
  return num / den;
}
