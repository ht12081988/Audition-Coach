'use server';

import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFile, unlink } from 'fs/promises';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
const fileManager = new GoogleAIFileManager(process.env.GOOGLE_AI_API_KEY!);

export async function analyzePerformanceAction(performanceId: string) {
  const supabase = await createClient();
  
  // 1. Get User
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // 2. Fetch Performance and Script
  const { data: performance, error: perfError } = await supabase
    .from('performance')
    .select('*, script(script)')
    .eq('id', performanceId)
    .single();

  if (perfError || !performance) throw new Error('Performance not found');

  // Update status to processing (or create initial record)
  const { error: upsertError } = await supabase
    .from('performance_analysis')
    .upsert({ 
      performance_id: performanceId, 
      user_id: user.id,
      status: 'processing' 
    });

  if (upsertError) {
    console.error('Initial upsert failed:', upsertError);
    throw new Error(`Database setup failed: ${upsertError.message}`);
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const videoUrl = performance.video_url;
    const originalScript = (performance.script as any).script;

    // Fetch video data and use GoogleAIFileManager
    const videoDataResponse = await fetch(videoUrl);
    const videoBuffer = await videoDataResponse.arrayBuffer();
    
    const tempFilePath = join(tmpdir(), `perf_${performanceId}_${Date.now()}.mp4`);
    await writeFile(tempFilePath, Buffer.from(videoBuffer));
    
    const uploadResult = await fileManager.uploadFile(tempFilePath, {
      mimeType: "video/mp4",
      displayName: `Performance ${performanceId}`,
    });

    let fileInfo = await fileManager.getFile(uploadResult.file.name);
    while (fileInfo.state === FileState.PROCESSING) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      fileInfo = await fileManager.getFile(uploadResult.file.name);
    }

    if (fileInfo.state === FileState.FAILED) {
      // Clean up before throwing
      await unlink(tempFilePath).catch(console.error);
      throw new Error("AI Video processing failed.");
    }

    const prompt = `
      You are an advanced AI acting coach and speech evaluator.
      You need to review the provided video and compare it against the Original Script.

      ORIGINAL SCRIPT:
      ${originalScript}

      TASK:
      Perform a STRICT line-by-line analysis by aligning the Original Script with the Transcribed Script from the video.

      STEP 1: LINE ALIGNMENT
      - Split both scripts into lines/sentences.
      - Align each original line with the closest matching spoken line.

      STEP 2: WORD-LEVEL COMPARISON
      For EACH aligned line:
      1. Compare ORIGINAL vs TRANSCRIPT word-by-word.
      2. Identify using word-level Levenshtein distance algorithm:
         - Mispronounced words
         - Missing words
         - Extra words

      STEP 3: HIGHLIGHTING FORMAT
      In the JSON output, use these tags within the "original" and "transcript" strings:
      - Mispronounced word → [MIS:word]
      - Missing word → [MISS:word]
      - Extra word → [EXTRA:word]

      STEP 4: PERFORMANCE SCORING (PER LINE 0-100)
      Score each line using this Professional Actor Rubric:
      - 0-25: Exploring (Disconnected, inhibited, or playing the result)
      - 26-50: Warming Up (Functional but general; "indicating" emotion)
      - 51-75: Performance Ready (Emotionally truthful, specific objectives, engaged)
      - 76-100: Director's Cut (Masterful nuance, profound truth, magnetic presence)

      SCORING CRITERIA:
      1. Emotion Alignment: How well emotional delivery matches script subtext.
      2. Facial Expressiveness: Use of micro-expressions and facial engagement.
      3. Diction & Clarity: Precision of speech and pronunciation.
      4. Pacing & Rhythm: Timing, pauses, and flow of delivery.
      5. Eye Contact: Connection to the "lens" or focus point.
      6. Intent & Subtext: Underlying meaning and motivation behind the lines.

      STEP 5: FEEDBACK (PER LINE)
      Provide 1 short strength and 1 actionable improvement.

      STEP 6: ERROR AGGREGATION
      Aggregate all mispronounced, missing, and extra words.

      OUTPUT FORMAT: JSON (Strictly follow this structure)
      {
        "overall_score": number, // 0-30: First Read, 31-60: Finding the Scene, 61-85: Performance Ready, 86-100: Casting Quality
        "metrics_avg": {
          "emotion": number,
          "facial": number,
          "diction": number,
          "pacing": number,
          "eyes": number,
          "intent": number
        },
        "line_analysis": [
          {
            "line_number": number,
            "start_time": number,
            "end_time": number,
            "original": "string with tags",
            "transcript": "string with tags",
            "scores": {
              "emotion": number,
              "facial": number,
              "diction": number,
              "pacing": number,
              "eyes": number,
              "intent": number
            },
            "feedback": {
              "strength": "string",
              "improvement": "string"
            }
          }
        ],
        "errors": {
          "mispronounced": [{ "word": "string", "line": number, "suggestion": "string" }],
          "missing": [{ "word": "string", "line": number }],
          "extra": [{ "word": "string", "line": number }]
        },
        "directors_notes": "string summary"
      }
    `;

    const result = await model.generateContent([
      prompt,
      {
        fileData: {
          fileUri: uploadResult.file.uri,
          mimeType: uploadResult.file.mimeType,
        }
      }
    ]);

    // Clean up temporary files and remote file
    await unlink(tempFilePath).catch(console.error);
    await fileManager.deleteFile(uploadResult.file.name).catch(console.error);

    const response = await result.response;
    const responseText = response.text();
    const analysis = JSON.parse(responseText);

    // 3. Save to Database in Transaction-like behavior
    // A. Update Main Analysis
    const { data: analysisRecord, error: analysisError } = await supabase
      .from('performance_analysis')
      .update({
        overall_score: Math.round(analysis.overall_score || 0),
        emotion_avg: Math.round(analysis.metrics_avg.emotion || 0),
        facial_avg: Math.round(analysis.metrics_avg.facial || 0),
        diction_avg: Math.round(analysis.metrics_avg.diction || 0),
        pacing_avg: Math.round(analysis.metrics_avg.pacing || 0),
        eyes_avg: Math.round(analysis.metrics_avg.eyes || 0),
        intent_avg: Math.round(analysis.metrics_avg.intent || 0),
        directors_notes: analysis.directors_notes,
        status: 'completed'
      })
      .eq('performance_id', performanceId)
      .select()
      .single();

    if (analysisError) throw analysisError;

    // B. Save Lines and Errors (Batch Insert)
    const lineInserts = analysis.line_analysis.map((line: any) => ({
      analysis_id: analysisRecord.id,
      line_number: line.line_number,
      start_time: line.start_time,
      end_time: line.end_time,
      original_text: line.original,
      transcript_text: line.transcript,
      score_emotion: Math.round(line.scores.emotion || 0),
      score_facial: Math.round(line.scores.facial || 0),
      score_diction: Math.round(line.scores.diction || 0),
      score_pacing: Math.round(line.scores.pacing || 0),
      score_eyes: Math.round(line.scores.eyes || 0),
      score_intent: Math.round(line.scores.intent || 0),
      strength: line.feedback.strength,
      improvement: line.feedback.improvement
    }));

    const { data: insertedLines, error: linesError } = await supabase
      .from('analysis_lines')
      .insert(lineInserts)
      .select();

    if (linesError) {
      console.error('Failed to insert lines:', linesError);
      throw linesError;
    }

    // Now map errors to the newly inserted lines
    let allErrors: any[] = [];
    if (insertedLines) {
      insertedLines.forEach((insertedLine: any) => {
        const lineNum = insertedLine.line_number;

        const mispronounced = analysis.errors?.mispronounced?.filter((e: any) => e.line === lineNum) || [];
        const missing = analysis.errors?.missing?.filter((e: any) => e.line === lineNum) || [];
        const extra = analysis.errors?.extra?.filter((e: any) => e.line === lineNum) || [];

        const lineErrorRecords = [
          ...mispronounced.map((e: any) => ({ line_id: insertedLine.id, error_type: 'mispronounced', word: e.word, suggestion: e.suggestion })),
          ...missing.map((e: any) => ({ line_id: insertedLine.id, error_type: 'missing', word: e.word })),
          ...extra.map((e: any) => ({ line_id: insertedLine.id, error_type: 'extra', word: e.word }))
        ];

        allErrors = [...allErrors, ...lineErrorRecords];
      });

      if (allErrors.length > 0) {
        await supabase.from('analysis_errors').insert(allErrors);
      }
    }

    return { success: true, analysisId: analysisRecord.id };

  } catch (err: any) {
    console.error('Analysis failed:', err);
    await supabase
      .from('performance_analysis')
      .update({ status: 'failed' })
      .eq('performance_id', performanceId);
    
    // Check for Gemini high demand error (503)
    if (err.message?.includes('503') || err.message?.includes('high demand')) {
      return { 
        success: false, 
        error: 'The AI Director is currently experiencing high demand. Please try again in a few moments.',
        isRetryable: true 
      };
    }
    
    return { success: false, error: err.message };
  }
}
