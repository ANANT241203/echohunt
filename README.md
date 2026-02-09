# EchoHunt - AI-Generated Scavenger Hunts

**EchoHunt** is a browser-based, mobile-first AR scavenger hunt game that creates **personalized quests using Gemini AI**. Unlike traditional scavenger hunts with fixed riddles, EchoHunt analyzes your environment and generates custom riddles tailored to YOUR space!

## 🎮 Features
- **🤖 AI-Generated Quests**: Gemini analyzes your room/space and creates 3-10 personalized riddles based on what it sees
- **👁️ Visual Intelligence**: Real-time camera frame analysis validates if you found the correct object
- **📱 Zero App Store**: Works entirely in the mobile browser (PWA ready)
- **🗣️ Voice Feedback**: Browser-native Text-to-Speech provides clues and encouraging hints
- **⚡ Auto Scan Mode**: Continuous scanning for a hands-free experience
- **🎨 AR Overlay**: Animated reticles and confetti celebrations

## 🎯 How It Works

1. **Setup Phase**: 
   - Point your camera around your space (bedroom, office, classroom, etc.)
   - Choose 3-10 riddles
   - Gemini AI analyzes your environment
   
2. **Quest Generation**: 
   - AI identifies objects, colors, textures in your space
   - Generates personalized riddles ordered by difficulty
   - Creates unique clues like "Find something reflective" based on what it saw
   
3. **Gameplay**: 
   - Follow the riddles to find objects
   - Scan objects with your camera
   - Get real-time AI feedback ("Get closer!", "Too dark!")
   - Celebrate with confetti when successful!

Every quest is 100% unique to your environment!

## 🚀 Quick Start (Local)

1. **Clone & Install**
   ```bash
   git clone <repo_url>
   cd echohunt
   npm install
   ```

2. **Configure API Key**
   Get a free API key from [Google AI Studio](https://aistudio.google.com/).
   Create a `.env.local` file:
   ```bash
   GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Run**
   ```bash
   npm run dev
   ```
   *Note: To test camera on mobile, you must access via HTTPS or `localhost`. If testing on a phone on the same LAN, the camera might be blocked by the browser unless you use a tunneling service like ngrok.*

## ☁️ Deployment (Free on Vercel)

This project is optimized for Vercel's zero-config deployment.

1. **Push to GitHub**: Commit this codebase to a public or private repository.
2. **Import to Vercel**: Go to [vercel.com/new](https://vercel.com/new) and select your repository.
3. **Environment Variables**:
   - In the "Configure Project" step, find the **Environment Variables** section.
   - Key: `GEMINI_API_KEY`
   - Value: `your_google_ai_studio_key`
4. **Deploy**: Click **Deploy**.
5. **Test**: Open the provided URL on your smartphone.

## 🛠 Tech Stack
- **Framework**: Next.js 16 (App Router with Turbopack)
- **AI Models**: 
  - Gemini 3 Flash (quest generation & validation)
  - Gemini 3 Pro (optional, for enhanced intelligence)
- **SDK**: `@google/generative-ai`
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **APIs**: MediaDevices (camera), Canvas (frame capture), Web Speech (TTS)

## 📄 License
MIT License
