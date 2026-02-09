"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import CameraLayer from '../components/CameraLayer';
import { drawOverlay, createConfetti, Point } from './utils/canvas';
import { QUEST_STEPS, QuestStep, ScanResponse } from './types';
import { Settings, RefreshCw, SkipForward, Info } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  // Game State
  const [hasStarted, setHasStarted] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Scanning State
  const [isScanning, setIsScanning] = useState(false);
  const [autoScan, setAutoScan] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(0);
  const [feedback, setFeedback] = useState<string>("Ready to scan...");
  const [overlayMode, setOverlayMode] = useState<'searching' | 'almost' | 'success'>('searching');
  const [particles, setParticles] = useState<Point[]>([]);

  // Settings
  const [usePro, setUsePro] = useState(false);
  const [questType, setQuestType] = useState<'Indoor' | 'Outdoor'>('Indoor');
  const [showSettings, setShowSettings] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const autoScanIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const currentStep = QUEST_STEPS[currentStepIndex];

  // -- Speech Synthesis --
  const speak = useCallback((text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Stop previous
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      window.speechSynthesis.speak(utterance);
    }
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
      // Capture frame
      const offscreen = document.createElement('canvas');
      offscreen.width = 512;
      offscreen.height = 512 * (videoRef.current.videoHeight / videoRef.current.videoWidth);
      const ctx = offscreen.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, offscreen.width, offscreen.height);
      }
      const imageData = offscreen.toDataURL('image/jpeg', 0.6);

      // Call API
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData,
          stepTarget: currentStep.target,
          usePro
        })
      });

      if (!res.ok) throw new Error("Network issue");

      const data: ScanResponse = await res.json();
      
      // Handle Response
      setOverlayMode(data.overlay_mode);
      setFeedback(data.short_hint);
      
      if (data.matched) {
        speak(data.voice_line);
        setParticles(createConfetti(window.innerWidth, window.innerHeight));
        if (data.next_step_unlocked) {
           setTimeout(() => {
              if (currentStepIndex < QUEST_STEPS.length - 1) {
                setCurrentStepIndex(prev => prev + 1);
                setOverlayMode('searching');
                setFeedback("New clue active!");
                speak("Next clue unlocked.");
              } else {
                setIsCompleted(true);
                speak("Quest completed! You are amazing.");
              }
           }, 2000);
        }
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
  }, [currentStep, isScanning, lastScanTime, usePro, autoScan, currentStepIndex, speak]);

  // -- Auto Scan Loop --
  useEffect(() => {
    if (autoScan && hasStarted && !isCompleted) {
      autoScanIntervalRef.current = setInterval(() => {
        performScan();
      }, 1000);
    } else {
      clearInterval(autoScanIntervalRef.current);
    }
    return () => clearInterval(autoScanIntervalRef.current);
  }, [autoScan, hasStarted, isCompleted, performScan]);

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

  // -- Start Game --
  const handleStart = () => {
    setHasStarted(true);
    speak(`Welcome to Echo Hunt. First clue: ${currentStep.description}`);
  };

  const handleSkip = () => {
    if (currentStepIndex < QUEST_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      speak("Skipping step.");
    } else {
      setIsCompleted(true);
    }
  };

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-purple-400 mb-4">
          EchoHunt
        </h1>
        <p className="text-gray-300 mb-8 max-w-md">
          An AI-powered AR scavenger hunt. Find objects in the real world to progress.
          <br/><br/>
          Powered by Gemini 3.
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

  if (isCompleted) {
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
      <div className="absolute inset-0 z-20 flex flex-col justify-between p-4 safe-area-padding">
        
        {/* Header */}
        <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-brand-accent uppercase tracking-widest">
              Step {currentStep.id}/{QUEST_STEPS.length}
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
               <label className="text-gray-400 block mb-1">Quest Type</label>
               <div className="flex bg-black/40 rounded p-1">
                 <button 
                  onClick={() => setQuestType('Indoor')}
                  className={`flex-1 py-1 rounded ${questType === 'Indoor' ? 'bg-brand-accent text-brand-dark' : 'text-gray-400'}`}
                 >Indoor</button>
                 <button 
                  onClick={() => setQuestType('Outdoor')}
                  className={`flex-1 py-1 rounded ${questType === 'Outdoor' ? 'bg-brand-accent text-brand-dark' : 'text-gray-400'}`}
                 >Outdoor</button>
               </div>
             </div>
             <div className="mb-4">
               <label className="text-gray-400 block mb-1">AI Model</label>
               <div className="flex flex-col gap-2">
                  <button onClick={() => setUsePro(false)} className={`flex items-center gap-2 p-2 rounded border ${!usePro ? 'border-brand-accent bg-brand-accent/20' : 'border-transparent'}`}>
                    <div className={`w-3 h-3 rounded-full ${!usePro ? 'bg-brand-accent' : 'bg-gray-600'}`} />
                    <div className="text-left">
                      <div className="font-bold text-white">Gemini 3 Flash</div>
                      <div className="text-xs text-gray-400">Fast, Free</div>
                    </div>
                  </button>
                  <button onClick={() => setUsePro(true)} className={`flex items-center gap-2 p-2 rounded border ${usePro ? 'border-purple-400 bg-purple-500/20' : 'border-transparent'}`}>
                    <div className={`w-3 h-3 rounded-full ${usePro ? 'bg-purple-400' : 'bg-gray-600'}`} />
                    <div className="text-left">
                      <div className="font-bold text-white">Gemini 3 Pro</div>
                      <div className="text-xs text-gray-400">Paid, Higher IQ</div>
                    </div>
                  </button>
               </div>
             </div>
             <div className="text-xs text-gray-500 border-t border-white/10 pt-2">
               Privacy: Images are analyzed by Google Gemini and discarded immediately.
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
        <div className="flex flex-col gap-4 items-center mb-8">
          
          {/* Main Action */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => speak(currentStep.description)}
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center active:bg-white/20"
              aria-label="Repeat Clue"
            >
              <RefreshCw size={20} className="text-white" />
            </button>

            <button
              onClick={performScan}
              disabled={isScanning || autoScan}
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

            <button 
              onClick={handleSkip}
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center active:bg-white/20"
              aria-label="Skip Step"
            >
              <SkipForward size={20} className="text-white" />
            </button>
          </div>

          {/* Auto Toggle */}
          <button 
            onClick={() => setAutoScan(!autoScan)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors flex items-center gap-2 ${autoScan ? 'bg-brand-success text-brand-dark' : 'bg-white/10 text-gray-300'}`}
          >
            {autoScan ? 'Auto Scan ON' : 'Enable Auto Scan'}
          </button>

        </div>
      </div>
    </main>
  );
}