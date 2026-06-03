'use client';

import { useState, useRef, useEffect } from 'react';
import { Video, Trash2, Play, Pause, Upload, CheckCircle, Loader2, Info, Volume2, VolumeX, Film, Mic2, Eye, BarChart2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Portal from '@/components/ui/Portal';


import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { analyzePerformanceAction } from '@/app/actions/performance';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

type PerformanceUploaderProps = {
  scriptId: string | null;
  userId: string;
};

export default function PerformanceUploader({ scriptId, userId }: PerformanceUploaderProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [performanceId, setPerformanceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    // Reset success state when script changes
    setUploadSuccess(false);
    setError(null);
    setCurrentTime(0);
    setDuration(0);
  }, [scriptId]);

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  const COMPRESSION_THRESHOLD = 30 * 1024 * 1024; // 30MB - only compress if larger than this

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('video/')) {
        setError('Please upload a valid video file.');
        return;
      }

      if (selectedFile.size > MAX_FILE_SIZE) {
        const sizeInMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
        setError(`File size exceeds 100MB (your file is ${sizeInMB}MB). Please upload a smaller video.`);
        toast.error('File too large', {
          description: `Your video is ${sizeInMB}MB. Maximum allowed is 100MB.`,
        });
        // Reset input so user can try again
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setUploadSuccess(false);
      setError(null);
    }
  };

  const handleRemove = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setIsPlaying(false);
    setUploadSuccess(false);
    setError(null);
    setCurrentTime(0);
    setDuration(0);
    setShowDeleteConfirm(false);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const loadFFmpeg = async () => {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    const ffmpeg = new FFmpeg();
    ffmpegRef.current = ffmpeg;

    ffmpeg.on('progress', ({ progress }) => {
      setCompressionProgress(Math.round(progress * 100));
    });

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    setFfmpegLoaded(true);
  };

  const compressVideo = async (inputFile: File): Promise<Blob> => {
    setIsCompressing(true);
    setCompressionProgress(0);
    try {
      if (!ffmpegLoaded) {
        await loadFFmpeg();
      }
      const ffmpeg = ffmpegRef.current!;
      const inputName = 'input.mp4';
      const outputName = 'output.mp4';

      await ffmpeg.writeFile(inputName, await fetchFile(inputFile));

      // Compression settings: 720p, H.264, reduced quality for faster upload
      // -vf "scale=-2:720" ensures height is 720 and width is proportional
      await ffmpeg.exec([
        '-i', inputName,
        '-vf', 'scale=-2:720',
        '-c:v', 'libx264',
        '-crf', '28',
        '-preset', 'veryfast',
        '-c:a', 'aac',
        '-b:a', '128k',
        outputName
      ]);

      const data = await ffmpeg.readFile(outputName);
      return new Blob([data as any], { type: 'video/mp4' });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async () => {
    if (!file || !scriptId) return;

    setIsUploading(true);
    setError(null);

    try {
      let fileToUpload: File | Blob = file;

      // Compress if file is larger than threshold
      if (file.size > COMPRESSION_THRESHOLD) {
        toast.info('Optimizing video', {
          description: 'Compressing your performance for faster upload...',
        });
        fileToUpload = await compressVideo(file);
        console.log('Compressed size:', (fileToUpload.size / (1024 * 1024)).toFixed(2), 'MB');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${scriptId}/${Date.now()}.${fileExt}`;
      const filePath = `performances/${fileName}`;

      // Upload to bucket "audition videos"
      const bucketName = 'audition videos';

      console.log('Attempting upload to bucket:', bucketName);
      console.log('File path:', filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, fileToUpload);

      if (uploadError) {
        console.error('Storage upload error details:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      // Insert transaction into performance table
      const { data: perfData, error: dbError } = await supabase
        .from('performance')
        .insert({
          user_id: userId,
          script_id: scriptId,
          video_url: publicUrl,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setPerformanceId(perfData.id);
      setUploadSuccess(true);
      toast.success('Performance submitted successfully!', {
        description: 'Your rehearsal has been saved. Analysis is ready.',
      });
      // handleRemove(); // Persist video as requested
    } catch (err: any) {
      console.error('Upload error:', err);
      const message = err.message || 'Failed to upload performance.';
      setError(message);
      toast.error('Submission failed', {
        description: message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewAnalysis = async () => {
    if (!performanceId) return;

    setAnalysisStep(0);
    setStepProgress(0);
    setIsAnalyzing(true);
    try {
      const result = await analyzePerformanceAction(performanceId);
      if (result.success) {
        router.push(`/analysis?id=${performanceId}`);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      const isHighDemand = err.message?.includes('high demand') || err.message?.includes('503');

      if (!isHighDemand) {
        console.error('Analysis trigger failed:', err);
      }

      toast.error(isHighDemand ? 'AI Director Busy' : 'Analysis failed', {
        description: err.message || 'Could not start AI analysis. Please try again.'
      });
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest p-1 rounded-[3rem] shadow-[0_32px_64px_-20px_rgba(0,0,0,0.06)] border border-outline-variant/20 h-full flex flex-col overflow-hidden">
      {!previewUrl ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative group aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-surface-container-high flex flex-col items-center justify-center p-12 text-center cursor-pointer hover:bg-surface-container transition-colors duration-500"
        >
          {/* Abstract Background Decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>

          {/* Upload Interaction Area */}
          <div className="relative z-10 flex flex-col items-center max-w-xs">
            <h3 className="text-2xl font-headline font-bold text-on-surface mb-4">Capture Your Performance</h3>
            <p className="text-on-surface-variant font-body mb-8 leading-relaxed">
              Upload your rehearsal to receive AI-driven subtext analysis and vocal coaching. <br />Note: Maximum file size is upto 100 MB.
            </p>

            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-on-primary shadow-xl group-hover:scale-110 transition-transform duration-500">
              <Upload size={32} strokeWidth={1.5} />
            </div>

          </div>

          {/* Drop Zone Visual State */}
          <div className="absolute inset-4 border-2 border-dashed border-outline-variant rounded-[1.5rem] opacity-40 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="video/*"
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-black group/preview">
          <video
            ref={videoRef}
            src={previewUrl!}
            className="w-full h-full object-contain"
            muted={isMuted}
            onEnded={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onClick={togglePlay}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col gap-6 pointer-events-auto">

              {/* Progress Bar Container */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-white/90 text-sm font-manrope font-bold tracking-tight">
                  <span className="bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">{formatTime(currentTime)}</span>
                  <span className="bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">{formatTime(duration)}</span>
                </div>

                <div className="relative group/slider h-2 flex items-center">
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={currentTime}
                    onChange={handleProgressChange}
                    className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-primary group-hover/slider:h-2 transition-all"
                    style={{
                      background: `linear-gradient(to right, #00488D ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) ${(currentTime / duration) * 100}%)`
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-6">
                  <button
                    onClick={togglePlay}
                    className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                  </button>
                </div>

                <div className="h-8 w-[1px] bg-white/10 self-center hidden sm:block"></div>

                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-14 h-14 rounded-full bg-red-500/10 backdrop-blur-md text-red-100 flex items-center justify-center hover:bg-red-500/20 transition-colors border border-red-500/10"
                    title="Remove Video"
                  >
                    <Trash2 size={24} />
                  </button>

                  <button
                    onClick={uploadSuccess ? handleViewAnalysis : handleSubmit}
                    disabled={isUploading || isCompressing || !scriptId}
                    className={`h-14 px-10 rounded-full font-headline font-black flex items-center gap-3 shadow-[0_20px_40px_-15px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none ${uploadSuccess
                      ? 'bg-primary text-on-primary shadow-primary/20'
                      : 'bg-white text-primary'
                      }`}
                  >
                    {isUploading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : isCompressing ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                        <span className="tabular-nums">{compressionProgress}%</span>
                      </div>
                    ) : uploadSuccess ? (
                      <Info size={20} />
                    ) : (
                      <CheckCircle size={20} />
                    )}
                    <span>
                      {isCompressing
                        ? 'Optimizing...'
                        : isUploading
                          ? 'Uploading...'
                          : uploadSuccess
                            ? 'View Analysis'
                            : 'Submit'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Compression Progress Bar Overlay (Subtle) */}
          {isCompressing && (
            <div className="absolute top-0 left-0 right-0 h-1 z-20">
              <motion.div
                className="h-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${compressionProgress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>
          )}

          {/* Delete Confirmation Overlay */}
          {showDeleteConfirm && (
            <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-300">
              <div className="w-20 h-20 mb-8 rounded-full bg-red-500/20 text-red-100 flex items-center justify-center">
                <Trash2 size={40} />
              </div>
              <h3 className="text-2xl font-headline font-bold text-white mb-4">Discard Video?</h3>
              <p className="text-slate-300 font-body mb-10 leading-relaxed">
                This will permanently remove the video selection. You will need to re-upload if you change your mind.
              </p>
              <div className="flex flex-col w-full gap-4">
                <button
                  onClick={handleRemove}
                  className="w-full bg-red-500 text-white py-4 rounded-full font-headline font-bold hover:bg-red-600 transition-colors"
                >
                  Yes, Remove
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full bg-white/10 text-white py-4 rounded-full font-headline font-bold hover:bg-white/20 transition-colors border border-white/10"
                >
                  Keep Video
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute top-8 left-8 right-8 p-4 bg-red-500/90 text-white rounded-2xl text-sm font-medium backdrop-blur-md">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Full Screen Loading Overlay for Analysis - Using Portal to escape stacking contexts */}
      <Portal>
        <AnimatePresence>
          {isAnalyzing && (
            <AnalysisLoadingOverlay
              step={analysisStep}
              stepProgress={stepProgress}
              onStepChange={setAnalysisStep}
              onProgressChange={setStepProgress}
            />
          )}
        </AnimatePresence>
      </Portal>
      {/* Compression Loading Overlay removed as per user request for continuity */}
    </div>
  );
}

// ─── Analysis step definitions ────────────────────────────────────────────────
const ANALYSIS_STEPS = [
  {
    icon: Film,
    label: 'Uploading to AI Engine',
    detail: 'Securely streaming your rehearsal to the Gemini processing cluster.',
    duration: 18, // seconds this step takes
    color: 'from-violet-500 to-purple-600',
    glow: 'shadow-purple-500/30',
  },
  {
    icon: Mic2,
    label: 'Transcribing Dialogue',
    detail: 'Extracting every spoken word and mapping it to the script lines.',
    duration: 22,
    color: 'from-sky-500 to-blue-600',
    glow: 'shadow-blue-500/30',
  },
  {
    icon: Eye,
    label: 'Reading Micro-Expressions',
    detail: 'Scanning facial cues, eye contact, and body language frame-by-frame.',
    duration: 25,
    color: 'from-emerald-500 to-teal-600',
    glow: 'shadow-teal-500/30',
  },
  {
    icon: BarChart2,
    label: 'Scoring Performance Metrics',
    detail: 'Calculating emotion, diction, pacing, and intent scores per line.',
    duration: 18,
    color: 'from-amber-500 to-orange-600',
    glow: 'shadow-orange-500/30',
  },
  {
    icon: Sparkles,
    label: 'Compiling Director\'s Report',
    detail: 'Assembling insights and crafting your personalised coaching feedback.',
    duration: 7,
    color: 'from-rose-500 to-pink-600',
    glow: 'shadow-rose-500/30',
  },
];

type AnalysisLoadingOverlayProps = {
  step: number;
  stepProgress: number;
  onStepChange: (s: number) => void;
  onProgressChange: (p: number) => void;
};

function AnalysisLoadingOverlay({ step, stepProgress, onStepChange, onProgressChange }: AnalysisLoadingOverlayProps) {
  // Drive the step timer
  useEffect(() => {
    const totalSteps = ANALYSIS_STEPS.length;
    if (step >= totalSteps) return;

    const stepDuration = ANALYSIS_STEPS[step].duration * 1000; // ms
    const tickInterval = 50; // ms
    const ticks = stepDuration / tickInterval;
    let tick = 0;

    const timer = setInterval(() => {
      tick += 1;
      const pct = Math.min((tick / ticks) * 100, 100);
      onProgressChange(pct);

      if (tick >= ticks) {
        clearInterval(timer);
        if (step < totalSteps - 1) {
          onStepChange(step + 1);
          onProgressChange(0);
        }
      }
    }, tickInterval);

    return () => clearInterval(timer);
  }, [step]);

  const current = ANALYSIS_STEPS[Math.min(step, ANALYSIS_STEPS.length - 1)];
  const CurrentIcon = current.icon;
  const totalSeconds = ANALYSIS_STEPS.reduce((a, s) => a + s.duration, 0);
  const elapsedSeconds = ANALYSIS_STEPS.slice(0, step).reduce((a, s) => a + s.duration, 0)
    + (current.duration * stepProgress) / 100;
  const overallPct = Math.min((elapsedSeconds / totalSeconds) * 100, 99);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-3xl flex flex-col items-center justify-center px-6"
    >
      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-lg bg-white/[0.06] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-xl"
      >
        {/* Animated icon */}
        <div className="flex items-center justify-center mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ scale: 0.6, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.6, opacity: 0, rotate: 20 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className={`w-24 h-24 rounded-full bg-gradient-to-br ${current.color} flex items-center justify-center shadow-2xl ${current.glow}`}
            >
              <CurrentIcon size={44} className="text-white" strokeWidth={1.5} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Step label & detail */}
        <div className="text-center mb-8 min-h-[5rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-headline font-black text-white tracking-tight mb-2">
                {current.label}
              </h2>
              <p className="text-sm text-slate-300 font-body leading-relaxed">
                {current.detail}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Current step progress bar */}
        <div className="mb-8">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${current.color}`}
              style={{ width: `${stepProgress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[11px] font-manrope font-bold text-white/40 tracking-widest uppercase">
            <span>Step {step + 1} of {ANALYSIS_STEPS.length}</span>
            <span>{Math.round(stepProgress)}%</span>
          </div>
        </div>

        {/* Steps list */}
        <div className="space-y-3">
          {ANALYSIS_STEPS.map((s, i) => {
            const StepIcon = s.icon;
            const isComplete = i < step;
            const isActive = i === step;
            return (
              <motion.div
                key={i}
                initial={false}
                animate={{ opacity: isComplete || isActive ? 1 : 0.3 }}
                className="flex items-center gap-4"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${isComplete
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : isActive
                    ? `bg-gradient-to-br ${s.color} text-white shadow-lg ${s.glow}`
                    : 'bg-white/10 text-white/30'
                  }`}>
                  {isComplete ? (
                    <CheckCircle size={16} strokeWidth={2.5} />
                  ) : (
                    <StepIcon size={14} strokeWidth={isActive ? 2 : 1.5} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-headline font-bold truncate transition-colors duration-300 ${isActive ? 'text-white' : isComplete ? 'text-emerald-400' : 'text-white/30'
                    }`}>
                    {s.label}
                  </p>
                  {isActive && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.4 }}
                      className={`h-0.5 mt-1 rounded-full bg-gradient-to-r ${s.color}`}
                    />
                  )}
                </div>
                {isComplete && (
                  <span className="text-[10px] font-manrope font-black text-emerald-400 tracking-widest uppercase">Done</span>
                )}
                {isActive && (
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="flex gap-1"
                  >
                    {[0, 1, 2].map(d => (
                      <motion.span
                        key={d}
                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.18 }}
                        className="w-1.5 h-1.5 bg-white/60 rounded-full"
                      />
                    ))}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Overall progress footer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 w-full max-w-lg text-center"
      >
        <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-2">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500"
            animate={{ width: `${overallPct}%` }}
            transition={{ ease: 'linear', duration: 0.1 }}
          />
        </div>
        <p className="text-xs font-manrope font-bold text-white/30 tracking-widest uppercase">
          Overall · {Math.round(overallPct)}% complete
        </p>
      </motion.div>
    </motion.div>
  );
}

