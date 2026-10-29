import { float32To16BitPCM, arrayBufferToBase64, base64ToArrayBuffer, pcm16BitToAudioBuffer } from './audioUtils';

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  groundingSources?: GroundingSource[];
  isError?: boolean;
}

export type GeminiModelType = 'auto' | 'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon';

export interface SendChatParams {
  messages: { role: 'user' | 'assistant'; content: string }[];
  model?: GeminiModelType;
  enableSearch?: boolean;
}

export interface ChatResponse {
  text: string;
  modelUsed: string;
  groundingSources: GroundingSource[];
  timestamp: string;
}

/**
 * Send chat to server proxy /api/gemini/chat
 */
export async function sendChatMessage(params: SendChatParams): Promise<ChatResponse> {
  const lastMsg = params.messages[params.messages.length - 1]?.content || '';
  
  // Complexity heuristic for automatic routing
  let promptComplexity = 'general';
  if (
    lastMsg.toLowerCase().includes('reverberation') ||
    lastMsg.toLowerCase().includes('rt60') ||
    lastMsg.toLowerCase().includes('calculation') ||
    lastMsg.toLowerCase().includes('frequency response') ||
    lastMsg.toLowerCase().includes('flutter echo') ||
    lastMsg.toLowerCase().includes('acoustic engineering')
  ) {
    promptComplexity = 'complex';
  } else if (
    lastMsg.toLowerCase().includes('stock') ||
    lastMsg.toLowerCase().includes('price') ||
    lastMsg.toLowerCase().includes('dimension') ||
    lastMsg.toLowerCase().includes('sku')
  ) {
    promptComplexity = 'fast';
  }

  const response = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: params.messages,
      model: params.model === 'auto' ? undefined : params.model,
      enableSearch: params.enableSearch !== false,
      promptComplexity,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

/**
 * Live Audio Session Manager for Gemini 3.8 Live API
 */
export class LiveVoiceSession {
  private ws: WebSocket | null = null;
  private inputAudioCtx: AudioContext | null = null;
  private outputAudioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private nextStartTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private isMuted = false;

  private onStatusChange?: (status: 'connecting' | 'connected' | 'speaking' | 'disconnected' | 'error', errorMsg?: string) => void;
  private onTranscription?: (text: string, isUser: boolean) => void;
  private onVolumeChange?: (level: number) => void;

  constructor(callbacks: {
    onStatusChange?: (status: 'connecting' | 'connected' | 'speaking' | 'disconnected' | 'error', errorMsg?: string) => void;
    onTranscription?: (text: string, isUser: boolean) => void;
    onVolumeChange?: (level: number) => void;
  }) {
    this.onStatusChange = callbacks.onStatusChange;
    this.onTranscription = callbacks.onTranscription;
    this.onVolumeChange = callbacks.onVolumeChange;
  }

  public async start(): Promise<void> {
    try {
      this.onStatusChange?.('connecting');

      // Setup audio contexts
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.inputAudioCtx = new AudioCtx({ sampleRate: 16000 });
      this.outputAudioCtx = new AudioCtx({ sampleRate: 24000 });

      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // Connect WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.setupMicStream();
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.error) {
            this.onStatusChange?.('error', msg.error);
            return;
          }
          if (msg.status === 'connected') {
            this.onStatusChange?.('connected');
          }
          if (msg.audio) {
            this.playAudioChunk(msg.audio);
          }
          if (msg.text) {
            this.onTranscription?.(msg.text, false);
          }
          if (msg.interrupted) {
            this.stopPlayback();
          }
        } catch (e) {
          console.error('[LiveClient] Message error:', e);
        }
      };

      this.ws.onerror = (e) => {
        console.error('[LiveClient] WebSocket error:', e);
        this.onStatusChange?.('error', 'Connection to live server failed.');
      };

      this.ws.onclose = () => {
        this.onStatusChange?.('disconnected');
        this.cleanup();
      };
    } catch (err: any) {
      console.error('[LiveClient] Start error:', err);
      this.onStatusChange?.('error', err.message || 'Microphone access denied or audio initialization failed.');
      this.cleanup();
    }
  }

  private setupMicStream(): void {
    if (!this.inputAudioCtx || !this.mediaStream || !this.ws) return;

    const source = this.inputAudioCtx.createMediaStreamSource(this.mediaStream);
    // Buffer size 2048 gives ~128ms chunk latency at 16kHz
    const processor = this.inputAudioCtx.createScriptProcessor(2048, 1, 1);
    this.scriptProcessor = processor;

    source.connect(processor);
    processor.connect(this.inputAudioCtx.destination);

    processor.onaudioprocess = (e) => {
      if (this.isMuted || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;

      const inputData = e.inputBuffer.getChannelData(0);

      // Calculate simple volume level for visualizer
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);
      this.onVolumeChange?.(Math.min(1, rms * 5));

      // Convert to 16-bit PCM little endian
      const pcmBuffer = float32To16BitPCM(inputData);
      const base64Audio = arrayBufferToBase64(pcmBuffer);

      this.ws.send(JSON.stringify({ audio: base64Audio }));
    };
  }

  private playAudioChunk(base64Audio: string): void {
    if (!this.outputAudioCtx) return;

    if (this.outputAudioCtx.state === 'suspended') {
      this.outputAudioCtx.resume();
    }

    this.onStatusChange?.('speaking');

    const pcmArrayBuffer = base64ToArrayBuffer(base64Audio);
    const audioBuffer = pcm16BitToAudioBuffer(this.outputAudioCtx, pcmArrayBuffer, 24000);

    const source = this.outputAudioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.outputAudioCtx.destination);

    const currentTime = this.outputAudioCtx.currentTime;
    if (this.nextStartTime < currentTime) {
      this.nextStartTime = currentTime;
    }

    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;
    this.activeSources.push(source);

    source.onended = () => {
      this.activeSources = this.activeSources.filter((s) => s !== source);
      if (this.activeSources.length === 0) {
        this.onStatusChange?.('connected');
      }
    };
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  public stopPlayback(): void {
    this.activeSources.forEach((s) => {
      try {
        s.stop();
      } catch (e) {
        // ignore
      }
    });
    this.activeSources = [];
    if (this.outputAudioCtx) {
      this.nextStartTime = this.outputAudioCtx.currentTime;
    }
    this.onStatusChange?.('connected');
  }

  public stop(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.cleanup();
  }

  private cleanup(): void {
    this.stopPlayback();
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.inputAudioCtx) {
      this.inputAudioCtx.close().catch(() => {});
      this.inputAudioCtx = null;
    }
    if (this.outputAudioCtx) {
      this.outputAudioCtx.close().catch(() => {});
      this.outputAudioCtx = null;
    }
  }
}
