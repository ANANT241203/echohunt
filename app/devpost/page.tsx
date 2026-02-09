import React from 'react';
import Link from 'next/link';

export default function DevpostPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans scrolling-page">
      <header className="bg-blue-600 text-white p-8">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-block bg-white/20 px-3 py-1 rounded mb-4 text-sm font-bold hover:bg-white/30">← Back to App</Link>
          <h1 className="text-4xl font-bold mb-2">EchoHunt</h1>
          <p className="text-xl text-blue-100">The world's first Gemini-powered AR Scavenger Hunt.</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-8 space-y-12">
        
        <section>
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">Project Description</h2>
          <p className="text-lg leading-relaxed text-gray-700">
            EchoHunt is a mobile-first web application that creates <strong>personalized AI-generated scavenger hunts</strong> using the power of the Gemini AI. 
            Unlike traditional scavenger hunt apps that rely on GPS or pre-defined lists, EchoHunt uses <strong>Dynamic Visual Intelligence</strong>.
            <br/><br/>
            <strong>How it works:</strong>
            <br/>
            1. Point your camera around your space (home, office, classroom, etc.)
            <br/>
            2. Gemini AI analyzes your environment and generates 3-10 personalized riddles based on what it sees
            <br/>
            3. The AI creates unique clues tailored to YOUR specific location
            <br/>
            4. Hunt for objects as Gemini provides real-time feedback ("Getting warmer!", "Too dark!")
            <br/><br/>
            Every quest is completely unique and dynamically generated. The app features animated AR-style overlays, voice feedback, 
            and runs entirely in the browser with no app store download required. Each player gets their own personalized treasure hunt!
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">How we used Gemini 3</h2>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <ul className="list-disc pl-5 space-y-3">
              <li>
                <strong>Dynamic Quest Generation:</strong> We use <code>Gemini 3 Flash</code> to analyze a snapshot of the user's environment and generate 3-10 personalized riddles. 
                The AI identifies available objects, colors, textures, and materials, then creates creative clues ordered from easiest to hardest.
              </li>
              <li>
                <strong>Real-time Visual Validation:</strong> During gameplay, Gemini 3 analyzes camera frames to verify if the user found the correct object. 
                The model identifies objects, lighting conditions, and provides contextual hints ("Get closer", "Too dark").
              </li>
              <li>
                <strong>Structured JSON Output:</strong> We rely on Gemini's strict JSON schema generation for both quest creation and validation. 
                The API returns typed responses with <code>matched</code>, <code>confidence</code>, <code>hints</code>, and <code>voice_lines</code>, ensuring deterministic game behavior.
              </li>
              <li>
                <strong>Multi-modal Intelligence:</strong> The same AI that generates the quest also validates player progress, creating a cohesive and intelligent game experience.
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">Demo Script (90s)</h2>
          <div className="font-mono text-sm bg-gray-900 text-green-400 p-6 rounded-xl overflow-x-auto">
            [0:00] INTRO<br/>
            "This is EchoHunt. The world's first AI-generated AR scavenger hunt, powered by Gemini."<br/><br/>
            [0:10] SETUP<br/>
            "I tap Start Quest. The app asks me to point my camera around my room."<br/>
            "I select 5 riddles and tap Generate Quest."<br/>
            "Gemini AI analyzes my environment... and creates personalized riddles just for my space!"<br/><br/>
            [0:30] GAMEPLAY<br/>
            "First clue: 'Find something with visible text.' I point at a blank wall."<br/>
            "I tap Scan. Gemini speaks: 'I don't see any text here.'"<br/>
            "I move to a book. I enable Auto Scan for continuous checking."<br/><br/>
            [0:50] SUCCESS<br/>
            "Gemini recognizes the text! Confetti explodes. Voice: 'Perfect! Next clue unlocked.'"<br/>
            "The AI generated riddle: 'Find something reflective' - it saw my mirror earlier!"<br/><br/>
            [1:10] TECH<br/>
            "Two Gemini calls: First analyzes the room and generates custom riddles. Second validates in real-time."<br/>
            "Strict JSON schemas ensure reliable game logic. Works on any mobile browser."<br/><br/>
            [1:25] CLOSE<br/>
            "EchoHunt: Every hunt is unique. Your space. Your quest."
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">Architecture</h2>
          <div className="bg-gray-100 p-6 rounded-xl space-y-4">
            <div>
              <h3 className="font-bold text-lg mb-2">Phase 1: Quest Generation</h3>
              <pre className="text-sm overflow-x-auto">
{`User Camera → Capture Environment Snapshot
           → /api/generate-quest
           → Gemini AI (analyzes scene)
           → Returns 3-10 personalized riddles
           → Game starts with custom quest`}
              </pre>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Phase 2: Real-time Gameplay</h3>
              <pre className="text-sm overflow-x-auto">
{`User Camera → Capture Frame
           → /api/scan + Current Riddle
           → Gemini AI (validates object)
           → Returns: matched, confidence, hints, voice
           → UI updates + TTS speaks feedback
           → Confetti on success → Next riddle`}
              </pre>
            </div>
            <p className="text-sm text-gray-600 border-t pt-3">
              <strong>Tech Stack:</strong> Next.js 16 (App Router), Gemini 3 Flash/Pro, 
              Browser MediaDevices API, Canvas API, Web Speech API (TTS), Tailwind CSS
            </p>
          </div>
        </section>

      </main>

      <footer className="bg-gray-100 text-center p-8 text-gray-500">
        Built for the Gemini 3 Hackathon. MIT License.
      </footer>
    </div>
  );
}