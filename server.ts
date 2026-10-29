import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Initialize GoogleGenAI SDK with recommended header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION = `You are the Aura Acoustic Engineer and Scandinavian Interior Design Advisor for Aura Living & Acoustics.
Your role is to offer expert consultation on:
1. Studio Acoustic Engineering: Room modes, RT60 reverberation decay, speaker decoupling, frequency response curves, acoustic wool absorption coefficients, and soundstage imaging.
2. Scandinavian Interior Architecture: Minimalist interior styling, honest raw materials (FSC-certified European white oak, Kvadrat virgin wool, unlacquered spun brass, matte stoneware ceramics, and travertine).
3. The Aura Curated Collection:
   - Onyx & Wool Studio Monitor ($480) [Acoustics]: 42Hz-24kHz, 60W RMS Class-D, turned walnut plinth, Kvadrat wool grille.
   - Koto Fluted Glass Pendant ($320) [Lighting]: 3000K warm LED, phase-cut dimmable, hand-blown fluted frosted glass, brushed brass fittings.
   - Havn Oak & Bouclé Lounge Chair ($740) [Seating]: Low-profile architectural armchair, FSC solid white oak, textured ivory wool bouclé.
   - Sandstone Ceramic Pourer Set ($115) [Tableware]: 1.2L carafe + 250ml tumblers, hand-thrown stoneware with iron speckle glaze.
   - Aether Open-Back Walnut Headphones ($390) [Acoustics]: 50mm biocellulose diaphragm, solid walnut earcups, CNC milled aluminum gimbal.
   - Strata Anodized Desk Organiser ($140) [Accessories]: Solid milled 6061 aluminium tray with cork base.
   - Solv Earthenware Fluted Vase ($95) [Tableware]: Sculptural vertical fluted terracotta with eggshell slip.
   - Krono Minimalist Brass Wall Clock ($185) [Accessories]: Silent sweep quartz movement with spun brass dial and walnut hands.

Tone & Style:
- Cultivated, precise, mindful, and architectural.
- Answer clearly and structure recommendations with spatial dimensions or material pairings.
- If Google Search data is provided or web research is utilized, integrate findings naturally and cite insights.`;

/**
 * Multi-Turn Chat Endpoint with Dynamic Model Routing & Search Grounding
 * POST /api/gemini/chat
 */
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, model: requestedModel, enableSearch, promptComplexity } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    if (!apiKey) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in environment secrets.',
      });
    }

    // Determine target model
    let targetModel = requestedModel;
    if (!targetModel || targetModel === 'auto') {
      if (promptComplexity === 'complex') {
        targetModel = 'gemini-4-argon';
      } else if (promptComplexity === 'fast') {
        targetModel = 'gemini-3.1-flash-lite';
      } else {
        targetModel = 'gemini-3.8-flash';
      }
    }

    // Prepare contents formatted for Gemini
    // Map previous turns to { role: 'user' | 'model', parts: [{ text }] }
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Configure tools: If Search Grounding is enabled or model is gemini-3.8-flash for general research
    const config: any = {
      systemInstruction: SYSTEM_INSTRUCTION,
    };

    const isSearchRequested = enableSearch !== false && targetModel === 'gemini-3.8-flash';
    if (isSearchRequested) {
      config.tools = [{ googleSearch: {} }];
    }

    // Generate content using modern @google/genai SDK
    const response = await ai.models.generateContent({
      model: targetModel,
      contents,
      config,
    });

    const responseText = response.text || '';

    // Extract Google Search grounding chunks if present
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingSources = rawChunks
      .filter((c: any) => c.web && c.web.uri)
      .map((c: any) => ({
        title: c.web.title || c.web.uri,
        uri: c.web.uri,
      }));

    return res.json({
      text: responseText,
      modelUsed: targetModel,
      groundingSources,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error generating Gemini response:', error);
    return res.status(error.status || 500).json({
      error: error.message || 'Failed to generate response from Gemini API.',
      status: error.status,
    });
  }
});

/**
 * WebSocket Server for Gemini Live API (gemini-3.8-live)
 * Path: /live
 */
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('[Live API] Client connected to WebSocket');

  if (!apiKey) {
    clientWs.send(
      JSON.stringify({
        error: 'GEMINI_API_KEY is not configured for Live API.',
      })
    );
    clientWs.close();
    return;
  }

  let session: any = null;

  try {
    session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' },
          },
        },
        systemInstruction: SYSTEM_INSTRUCTION + '\nKeep live spoken replies brief, engaging, and under 2-3 sentences.',
        outputAudioTranscription: {},
        inputAudioTranscription: {},
      },
      callbacks: {
        onmessage: (message: any) => {
          // Send audio chunks to client
          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio) {
            clientWs.send(JSON.stringify({ audio }));
          }

          // Send transcription if available
          const textPart = message.serverContent?.modelTurn?.parts?.[0]?.text;
          if (textPart) {
            clientWs.send(JSON.stringify({ text: textPart }));
          }

          // Handle interruption flag
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }

          // Send turn complete
          if (message.serverContent?.turnComplete) {
            clientWs.send(JSON.stringify({ turnComplete: true }));
          }
        },
        onerror: (err: any) => {
          console.error('[Live API Session Error]:', err);
          clientWs.send(JSON.stringify({ error: err.message || 'Live session error' }));
        },
        onclose: () => {
          console.log('[Live API Session Closed]');
        },
      },
    });

    clientWs.send(JSON.stringify({ status: 'connected', model: 'gemini-3.8-live' }));
  } catch (err: any) {
    console.error('[Live API Connect Error]:', err);
    clientWs.send(
      JSON.stringify({
        error: `Could not establish Gemini Live session: ${err.message}`,
      })
    );
    clientWs.close();
    return;
  }

  // Handle incoming audio from client
  clientWs.on('message', (data: Buffer | string) => {
    try {
      const parsed = JSON.parse(data.toString());
      if (parsed.audio && session) {
        // Client sends 16kHz PCM audio
        session.sendRealtimeInput({
          audio: {
            data: parsed.audio,
            mimeType: 'audio/pcm;rate=16000',
          },
        });
      } else if (parsed.text && session) {
        session.sendRealtimeInput({
          text: parsed.text,
        });
      }
    } catch (e) {
      console.error('[Live API Message Parse Error]:', e);
    }
  });

  clientWs.on('close', () => {
    console.log('[Live API] Client disconnected');
    if (session && typeof session.close === 'function') {
      try {
        session.close();
      } catch (e) {
        // ignore
      }
    }
  });
});

// Upgrade HTTP server to WebSocket on /live
server.on('upgrade', (request, socket, head) => {
  const { pathname } = new URL(request.url || '', `http://${request.headers.host}`);
  if (pathname === '/live') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

// Vite middleware in dev or static files in production
async function setupVite() {
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }
}

setupVite().then(() => {
  server.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
});
