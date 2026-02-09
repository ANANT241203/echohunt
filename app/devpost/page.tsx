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
            EchoHunt is a mobile-first web application that gamifies the world around you using the power of the Gemini 3 API. 
            Unlike traditional scavenger hunt apps that rely on GPS or rigid QR codes, EchoHunt uses <strong>Visual Intelligence</strong>. 
            Players are given vague clues ("Find something reflective", "Find something red") and must use their camera to find matching real-world objects.
            <br/><br/>
            The app features a "live" feel with an animated AR-style overlay. As users scan their environment, Gemini analyzes the video frames in real-time, 
            providing spoken feedback ("Getting warmer!", "Too dark, try again") and unlocking the next stage upon success.
            It's built to be accessible, running entirely in the browser with no app store download required.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">How we used Gemini 3</h2>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Multimodal Vision:</strong> We utilize <code>gemini-3-flash-preview</code> to analyze JPEG frames captured from the user's camera. The model identifies objects, lighting conditions, and colors instantly.
              </li>
              <li>
                <strong>Structured JSON Output:</strong> We rely on Gemini's strict JSON schema generation to drive the game logic. The API returns flags for <code>matched</code>, <code>confidence</code>, and UI states like <code>overlay_mode</code>, ensuring the frontend behaves deterministically.
              </li>
              <li>
                <strong>Thinking Config:</strong> We use the new thinking configuration to optimize for minimal latency, ensuring the game feels responsive even on mobile networks.
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">Demo Script (60s)</h2>
          <div className="font-mono text-sm bg-gray-900 text-green-400 p-6 rounded-xl overflow-x-auto">
            [0:00] INTRO<br/>
            "This is EchoHunt. A browser-based AR game powered by Gemini 3."<br/><br/>
            [0:10] GAMEPLAY<br/>
            "I tap Start. The clue is 'Find something with visible text'. I point my phone at a blank wall."<br/>
            "I tap Scan. Gemini sees nothing and speaks: 'I don't see any words here.'"<br/>
            "I move to a book. I enable Auto Scan. The app snapshots every second."<br/><br/>
            [0:30] SUCCESS<br/>
            "Gemini recognizes the text! Confetti explodes on screen. The voice says: 'Great read! Next clue unlocked.'"<br/><br/>
            [0:45] TECH<br/>
            "We're using Gemini 3 Flash for sub-second vision analysis with zero cost. It's strictly JSON-typed for robust game states."<br/><br/>
            [0:55] CLOSE<br/>
            "EchoHunt: The world is your playground."
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">Architecture</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm">
{`graph TD
    User[User / Mobile Browser] -->|Video Stream| Canvas
    User -->|Tap Scan| NextJS[Next.js Server API]
    NextJS -->|Frame + Prompt| Gemini[Gemini 3 Flash API]
    Gemini -->|JSON Response| NextJS
    NextJS -->|Game State| User
    User -->|TTS Feedback| Speakers`}
          </pre>
        </section>

      </main>

      <footer className="bg-gray-100 text-center p-8 text-gray-500">
        Built for the Gemini 3 Hackathon. MIT License.
      </footer>
    </div>
  );
}