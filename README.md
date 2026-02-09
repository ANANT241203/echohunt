# EchoHunt - Gemini 3 Hackathon Project

**EchoHunt** is a browser-based, mobile-first AR scavenger hunt game. It uses the **Gemini 3 API** (specifically `gemini-3-flash-preview`) to "see" the world through your camera and verify if you have found the quest items.

## 🎮 Features
- **Visual Intelligence**: Uses Gemini 3 Vision to analyze camera frames in real-time.
- **Zero App Store**: Works entirely in the mobile browser (PWA ready).
- **Voice Feedback**: Browser-native Text-to-Speech reads clues and hints.
- **Auto Scan Mode**: Optional mode that uses Gemini's low-latency thinking config to scan continuously.

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
- **Framework**: Next.js 14 (App Router)
- **AI Model**: Google Gemini 3 Flash Preview
- **SDK**: `@google/genai`
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## 📄 License
MIT License
