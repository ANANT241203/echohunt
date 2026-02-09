"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import CameraLayer from '../components/CameraLayer';
import { drawOverlay, createConfetti, Point } from './utils/canvas';
import { QUEST_STEPS, QuestStep, ScanResponse } from './types';
import { Settings, RefreshCw, SkipForward, Info } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  // Game State
  const [gamePhase, setGamePhase] = useState<'intro' | 'setup' | 'playing' | 'completed'>('intro');
  const [questSteps, setQuestSteps] = useState<QuestStep[]>(QUEST_STEPS);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [numRiddles, setNumRiddles] = useState(3);
  const [isGeneratingQuest, setIsGeneratingQuest] = useState(false);

  // Scanning State
  const [isScanning, setIsScanning] = useState(false);
  const [autoScan, setAutoScan] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(0);
  const [feedback, setFeedback] = useState<string>("Ready to scan...");
  const [overlayMode, setOverlayMode] = useState<'searching' | 'almost' | 'success'>('searching');
  const [particles, setParticles] = useState<Point[]>([]);

  // Settings
  const [showSettings, setShowSettings] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const autoScanIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const currentStep = questSteps[currentStepIndex];

  // -- Speech Synthesis --
  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel(); // Stop previous
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1;
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve(); // Resolve even on error
        window.speechSynthesis.speak(utterance);
      } else {
        resolve();
      }
    });
  }, []);

  // -- Capture & API Call --
  const performScan = useCallback(async () => {
    // Safety checks: Video must exist, not currently scanning, and have valid dimensions
    if (!videoRef.current || isScanning) return;
    if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) return;

    const now = Date.now();
    if (now - lastScanTime < 900) return; // Throttle

    setIsScanning(true);
    setLastScanTime(now);

    try {
      // Capture frame with optimized compression
      const offscreen = document.createElement('canvas');
      offscreen.width = 384;
      offscreen.height = 384 * (videoRef.current.videoHeight / videoRef.current.videoWidth);
      const ctx = offscreen.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, offscreen.width, offscreen.height);
      }
      const imageData = offscreen.toDataURL('image/jpeg', 0.5);

      // Call API
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData,
          stepTarget: currentStep.target
        })
      });

      if (!res.ok) throw new Error("Network issue");

      const data: ScanResponse = await res.json();
      
      // Handle Response
      setOverlayMode(data.overlay_mode);
      setFeedback(data.short_hint);
      
      if (data.matched) {
        setParticles(createConfetti(window.innerWidth, window.innerHeight));
        setAutoScan(false); // Pause auto-scan during transition
        
        // Wait for success voice to finish, then proceed
        speak(data.voice_line).then(() => {
          if (data.next_step_unlocked) {
            // Add small delay for confetti effect, then transition
            setTimeout(async () => {
              if (currentStepIndex < questSteps.length - 1) {
                const nextIndex = currentStepIndex + 1;
                setCurrentStepIndex(nextIndex);
                setOverlayMode('searching');
                setFeedback("New clue active!");
                await speak("Next clue unlocked.");
                // Speak the new riddle
                await speak(questSteps[nextIndex].description);
              } else {
                setGamePhase('completed');
                await speak("Quest completed! You are amazing.");
              }
            }, 1000);
          }
        });
      } else {
        // Only speak hint if manual scan or if feedback changes significantly (simplified here)
        if (!autoScan) speak(data.voice_line);
      }

    } catch (err) {
      console.error(err);
      setFeedback("Connection error. Retrying...");
      speak("Network issue.");
    } finally {
      setIsScanning(false);
    }
  }, [currentStep, isScanning, lastScanTime, autoScan, currentStepIndex, speak]);

  // -- Auto Scan Loop --
  useEffect(() => {
    if (autoScan && gamePhase === 'playing') {
      autoScanIntervalRef.current = setInterval(() => {
        performScan();
      }, 3000);
    } else {
      clearInterval(autoScanIntervalRef.current);
    }
    return () => clearInterval(autoScanIntervalRef.current);
  }, [autoScan, gamePhase, performScan]);

  // -- Animation Loop --
  useEffect(() => {
    const render = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
           // Ensure canvas size matches window
           if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
             canvas.width = window.innerWidth;
             canvas.height = window.innerHeight;
           }
           drawOverlay(ctx, canvas.width, canvas.height, overlayMode, particles);
        }
      }
      animationRef.current = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationRef.current!);
  }, [overlayMode, particles]);

  // -- Generate Quest --
  const handleGenerateQuest = async () => {
    if (!videoRef.current) return;
    if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
      setErrorMsg("Camera not ready. Please wait...");
      return;
    }

    setIsGeneratingQuest(true);
    setErrorMsg(null);

    try {
      // Capture environment with optimized compression
      const offscreen = document.createElement('canvas');
      offscreen.width = 384;
      offscreen.height = 384 * (videoRef.current.videoHeight / videoRef.current.videoWidth);
      const ctx = offscreen.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, offscreen.width, offscreen.height);
      }
      const imageData = offscreen.toDataURL('image/jpeg', 0.5);

      // Call API
      const res = await fetch('/api/generate-quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData,
          numRiddles
        })
      });

      if (!res.ok) throw new Error("Failed to generate quest");

      const data = await res.json();
      setQuestSteps(data.quest_steps);
      setGamePhase('playing');
      await speak(`Welcome to Echo Hunt. First clue: ${data.quest_steps[0].description}`);

    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to generate quest. Please try again.");
    } finally {
      setIsGeneratingQuest(false);
    }
  };

  // -- Start Game --
  const handleStart = () => {
    setGamePhase('setup');
  };

  const handleSkip = () => {
    if (currentStepIndex < questSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      speak("Skipping step.");
    } else {
      setGamePhase('completed');
    }
  };

  if (gamePhase === 'intro') {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-purple-400 mb-4">
          EchoHunt
        </h1>
        <p className="text-gray-300 mb-8 max-w-md">
          An AI-powered AR scavenger hunt. The AI will analyze your environment and create a personalized treasure hunt just for you!
          <br/><br/>
          Powered by Gemini AI.
        </p>
        <button 
          onClick={handleStart}
          className="bg-brand-accent text-brand-dark font-bold py-4 px-8 rounded-full text-xl shadow-lg hover:scale-105 transition-transform"
        >
          Start Quest
        </button>
        <div className="mt-8 text-xs text-gray-500">
           Requesting Camera Access. No images are stored.
        </div>
        <Link href="/devpost" className="mt-4 text-brand-accent underline">
          Project Details (Devpost)
        </Link>
      </div>
    );
  }

  if (gamePhase === 'setup') {
    return (
      <main className="relative h-screen w-screen overflow-hidden bg-black">
        {/* Background Camera */}
        <CameraLayer 
          onRef={(ref) => (videoRef.current = ref)} 
          onError={setErrorMsg} 
        />

        {/* Setup Overlay */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-black/70">
          <div className="bg-brand-dark/95 p-8 rounded-3xl border border-white/20 max-w-md w-full text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Setup Your Quest</h2>
            <p className="text-gray-300 mb-6">
              Point your camera around the room. The AI will analyze your environment and create personalized riddles!
            </p>
            
            <div className="mb-6">
              <label className="text-gray-400 block mb-3 font-bold">Number of Riddles</label>
              <div className="flex items-center justify-center gap-4">
                <button 
                  onClick={() => setNumRiddles(Math.max(3, numRiddles - 1))}
                  className="w-12 h-12 rounded-full bg-white/10 text-white text-2xl font-bold hover:bg-white/20"
                  disabled={numRiddles <= 3}
                >
                  -
                </button>
                <span className="text-5xl font-bold text-brand-accent w-16">{numRiddles}</span>
                <button 
                  onClick={() => setNumRiddles(Math.min(10, numRiddles + 1))}
                  className="w-12 h-12 rounded-full bg-white/10 text-white text-2xl font-bold hover:bg-white/20"
                  disabled={numRiddles >= 10}
                >
                  +
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Min: 3 | Max: 10</p>
            </div>

            {errorMsg && (
              <div className="bg-red-500/90 text-white p-3 rounded-lg mb-4 text-sm">
                {errorMsg}
              </div>
            )}

            <button
              onClick={handleGenerateQuest}
              disabled={isGeneratingQuest}
              className={`w-full py-4 rounded-full font-bold text-lg transition-all ${
                isGeneratingQuest 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-brand-accent text-brand-dark hover:scale-105 shadow-lg'
              }`}
            >
              {isGeneratingQuest ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
                  Generating Quest...
                </span>
              ) : (
                'Generate Quest!'
              )}
            </button>

            <button
              onClick={() => setGamePhase('intro')}
              className="mt-4 text-gray-400 underline text-sm"
            >
              ← Back
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (gamePhase === 'completed') {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-4xl text-brand-success font-bold mb-4">Quest Complete!</h1>
        <p className="text-white mb-8">You found all the items. Great job!</p>
        <button 
          onClick={() => window.location.reload()}
          className="border-2 border-brand-accent text-brand-accent py-3 px-6 rounded-full"
        >
          Play Again
        </button>
        <Link href="/devpost" className="mt-8 text-gray-400 underline">
          About this project
        </Link>
      </div>
    );
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Background Camera */}
      <CameraLayer 
        onRef={(ref) => (videoRef.current = ref)} 
        onError={setErrorMsg} 
      />

      {/* AR Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-10 pointer-events-none"
      />

      {/* UI Overlay */}
      <div className="absolute inset-0 z-20 flex flex-col justify-between p-4 pb-20 safe-area-padding">
        
        {/* Header */}
        <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-brand-accent uppercase tracking-widest">
              Step {currentStep.id}/{questSteps.length}
            </span>
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 bg-white/10 rounded-full">
              <Settings size={20} className="text-white" />
            </button>
          </div>
          <h2 className="text-xl font-bold text-white shadow-black drop-shadow-md">
            {currentStep.description}
          </h2>
          <div className="text-sm text-gray-300 mt-1 flex items-center gap-2">
            <Info size={14} />
            {feedback}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute top-24 right-4 bg-brand-dark/90 p-4 rounded-xl border border-white/20 w-64 text-sm">
             <div className="mb-4">
               <label className="text-gray-400 block mb-2 font-bold">Quest Info</label>
               <div className="bg-black/40 p-3 rounded">
                 <div className="text-white font-bold">{questSteps.length} Riddles</div>
                 <div className="text-xs text-gray-400 mt-1">AI-generated for your space</div>
               </div>
             </div>
             <div className="text-xs text-gray-500 border-t border-white/10 pt-2">
               Privacy: Images are analyzed by Gemini AI and discarded immediately.
             </div>
          </div>
        )}

        {/* Error Toast */}
        {errorMsg && (
          <div className="bg-red-500/90 text-white p-3 rounded-lg text-center mx-4">
            {errorMsg}
          </div>
        )}

        {/* Footer Controls */}
        <div className="w-full px-4 mb-10">
          {/* Centered Layout - Main Scan only */}
          <div className="flex flex-col items-center gap-3">
            {/* Main Scan Button */}
            <button
              onClick={performScan}
              disabled={isScanning}
              className={`
                w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all
                ${isScanning 
                  ? 'border-gray-500 bg-gray-800 scale-95' 
                  : 'border-brand-accent bg-brand-accent/20 hover:bg-brand-accent/30 shadow-[0_0_30px_rgba(56,189,248,0.3)]'
                }
              `}
            >
              {isScanning ? (
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/10" />
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}