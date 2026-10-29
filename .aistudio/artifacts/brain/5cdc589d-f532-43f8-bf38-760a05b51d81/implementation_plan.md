# Aura Studio AI Concierge — Multi-Turn Chat, Real-Time Voice & Search Grounding

Integrate an intelligent Acoustic Engineer and Scandinavian Interior Design Advisor into the Aura Living & Acoustics platform. This upgrade introduces:
1. **Multi-Turn Chatbot** with scrollable thread, persona system instructions, and dynamic model routing (Gemini 3.1 Flash Lite for quick queries, Gemini 3.8 Flash for general tasks, and Gemini 4 Argon for complex architectural sound planning).
2. **Google Search Grounding** using `gemini-3.8-flash` with the `googleSearch` tool to fetch live, accurate external design, acoustics, and product trends with clickable citation sources.
3. **Real-Time Voice Conversations** powered by `gemini-3.8-live` (Live API) via a full-stack WebSocket audio bridge, enabling seamless two-way voice dialogue with live audio visualizer feedback.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The AI features are packaged as a floating, collapsible **Studio Concierge** widget on the storefront, allowing users to effortlessly switch between text chat, search-grounded consultations, and real-time voice conversations without interrupting catalog browsing.

- **Confirmed Decision 1 (Integration)**: Floating interactive concierge with text and real-time voice modes.
- **Confirmed Decision 2 (Persona)**: Acoustic engineer and Scandinavian interior design advisor specializing in room resonance, acoustic materials (wool, oak, travertine), luminaire placement, and product recommendations.
- **Confirmed Decision 3 (Model Strategy)**: Automatic complexity routing with manual override toggle (`gemini-3.1-flash-lite`, `gemini-3.8-flash` with Google Search, `gemini-4-argon`).

---

### 1. Overview & Core Concept

- **What It Does**:
  - **Conversational Design & Acoustic Advisor**: Engages customers in multi-turn dialogues regarding speaker placement, reverberation times, material pairings, and collection details.
  - **Live Web Research & Search Grounding**: Researches modern design trends, acoustics whitepapers, and Scandinavian design history using Gemini 3.8 Flash with Google Search grounding, rendering verified source cards with titles and URLs.
  - **Real-Time Hands-Free Voice Mode**: Connects directly to `gemini-3.8-live` over WebSocket to capture microphone audio and stream back low-latency vocal responses with interactive audio spectrum feedback.
  - **Developer Inspector Telemetry**: Every AI query, model token duration, search source citation, and voice session event streams into the live Developer Inspector so recruiters can review prompt engineering and API telemetry.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Floating Trigger**: A sleek stone & bronze concierge button in the bottom-left corner with quick access to both Text Chat and Voice Mode.
  2. **Chat Interface**:
     - Header with persona indicator ("Aura Studio Advisor · Acoustic & Design Concierge") and Model Switcher pill tabs (`Auto`, `3.8 Flash + Search`, `3.1 Lite`, `4 Argon`).
     - Scrollable message thread with customer messages, assistant answers formatted with Markdown, and Search Grounding source citations with links.
     - Quick prompt suggestions ("How should I position the Onyx speaker?", "Explain Kvadrat acoustic wool benefits", "Find recent trends in Scandinavian lighting").
     - Clear conversation button and message input with microphone toggle.
  3. **Live Voice Mode**:
     - Dedicated voice overlay with an organic, pulsating acoustic wave visualizer.
     - Live transcription of spoken input and vocal responses from Gemini 3.8 Live.
     - Instant mute, interrupt, and return-to-chat controls.

- **Visual Identity & Theme**:
  - Consistent with Scandinavian minimalism: `#FAFAF9` canvas, stone-900 typography, subtle amber accents (`#D97706`), zero-pill metadata discipline, and clean hairline dividers.
  - Grounding sources rendered as clean text links with domain favicon/icons, avoiding garish badges.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full-Stack Express Server with Server-Side Gemini API**
  - *Chosen Approach*: Transition dev server to Express entry point (`server.ts` with Vite middleware in dev and static serving in prod), hosting `/api/gemini/chat`, `/api/gemini/search`, and WebSocket `/live` for Live API audio streaming.
  - *Why*: Satisfies the strict architectural constraint that Gemini API keys must never be exposed to the browser, while enabling low-latency WebSocket audio streaming for `gemini-3.8-live`.
- **Decision 2: Intelligent Model Routing with User Visibility**
  - *Chosen Approach*: Auto-routes simple queries ("What's in stock?", "Dimensions?") to `gemini-3.1-flash-lite`, general design and live research queries to `gemini-3.8-flash` with Google Search, and complex architectural math (e.g. room RT60 decay time calculation) to `gemini-4-argon`. Users can also explicitly pick the model.
  - *Why*: Balances speed, search recency, and deep reasoning while giving technical recruiters a direct look at multi-model orchestration.
- **Decision 3: Dual-Mode Audio Resilience**
  - *Chosen Approach*: Full WebSocket `gemini-3.8-live` audio pipeline with an intelligent browser fallback mode (Web Speech API + server TTS/generateContent) if microphoning is restricted in evaluation sandboxes.
  - *Why*: Guarantees zero runtime crashes while providing authentic Live API implementation.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                   AURA CONCIERGE FRONTEND (REACT 19)                   │
│  ┌───────────────────────┐  ┌───────────────────┐  ┌────────────────┐  │
│  │ Multi-Turn Chat View  │  │ Search Citations  │  │ Live Voice UI  │  │
│  └───────────┬───────────┘  └─────────┬─────────┘  └───────┬────────┘  │
│              │                        │                    │           │
│              ▼                        ▼                    ▼           │
│         HTTP /api/gemini/chat                   WebSocket /live        │
└──────────────────┬─────────────────────────────────────────┬───────────┘
                   │                                         │
                   ▼                                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   FULL-STACK SERVER (server.ts)                        │
│                                                                        │
│   • GoogleGenAI Client initialized with process.env.GEMINI_API_KEY     │
│   • Search Grounding: ai.models.generateContent + { googleSearch: {} } │
│   • Live API: ai.live.connect({ model: "gemini-3.8-live", ... })       │
│   • Telemetry Logger: Feeds request stats to Developer Inspector       │
└────────────────────────────────────────────────────────────────────────┘
```

- **API Contracts**:
  - `POST /api/gemini/chat`:
    - Body: `{ messages: { role: 'user' | 'model', content: string }[], model?: string, enableSearch?: boolean }`
    - Response: `{ text: string, modelUsed: string, groundingChunks?: { web: { uri: string, title: string } }[] }`
  - `WS /live`:
    - Client sends 16kHz PCM audio buffer
    - Server streams 24kHz PCM audio chunks from `gemini-3.8-live`

---

### 5. Implementation Steps

1. **Dependencies & Server Architecture**:
   - Install `ws` and `@types/ws` for WebSocket Live API support.
   - Configure `server.ts` with Express, WebSocket server, and Vite middlewares.
   - Update `package.json` scripts (`"dev": "tsx server.ts"`).
2. **Server-Side Gemini Integration**:
   - Initialize `@google/genai` client on the server with `User-Agent: 'aistudio-build'`.
   - Implement `/api/gemini/chat` supporting `gemini-3.8-flash` (with `googleSearch: {}`), `gemini-3.1-flash-lite`, and `gemini-4-argon`.
   - Implement `/live` WebSocket route bridging client microphone PCM audio with `ai.live.connect({ model: "gemini-3.8-live" })`.
3. **Frontend Concierge Component**:
   - Build `StudioConcierge.tsx` with floating toggle, multi-turn chat scrollable thread, quick prompt chips, model selector, and markdown rendering.
   - Display Google Search Grounding sources with clean link chips.
   - Build `VoiceModal.tsx` with real-time audio visualizer, mute, and live status.
4. **Integration & Telemetry**:
   - Connect Concierge events into `api.ts` and `DeveloperInspector.tsx` so recruiters see model queries and response latencies in real time.
   - Verify build compilation and test all handlers.
