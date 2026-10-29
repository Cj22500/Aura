import React, { useEffect, useState, useRef } from 'react';
import { X, Mic, MicOff, Volume2, Sparkles, AlertCircle, PhoneOff } from 'lucide-react';
import { LiveVoiceSession } from '../services/geminiClient';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({ isOpen, onClose }) => {
  const [sessionStatus, setSessionStatus] = useState<
    'connecting' | 'connected' | 'speaking' | 'disconnected' | 'error'
  >('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [transcriptions, setTranscriptions] = useState<{ text: string; isUser: boolean }[]>([]);
  const [volumeLevel, setVolumeLevel] = useState(0);

  const sessionRef = useRef<LiveVoiceSession | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (sessionRef.current) {
        sessionRef.current.stop();
        sessionRef.current = null;
      }
      return;
    }

    setErrorMessage(null);
    setTranscriptions([]);

    const session = new LiveVoiceSession({
      onStatusChange: (status, err) => {
        setSessionStatus(status);
        if (err) setErrorMessage(err);
      },
      onTranscription: (text, isUser) => {
        setTranscriptions((prev) => [...prev.slice(-4), { text, isUser }]);
      },
      onVolumeChange: (level) => {
        setVolumeLevel(level);
      },
    });

    sessionRef.current = session;
    session.start();

    return () => {
      session.stop();
      sessionRef.current = null;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleMute = () => {
    if (sessionRef.current) {
      const next = !isMuted;
      setIsMuted(next);
      sessionRef.current.setMuted(next);
    }
  };

  const handleInterrupt = () => {
    if (sessionRef.current) {
      sessionRef.current.stopPlayback();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col items-center justify-between min-h-[480px] text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle ambient gradient mesh behind visualizer */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(217,119,6,0.15),transparent_70%)] pointer-events-none" />

        {/* Top Header */}
        <div className="w-full flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-stone-300">
              Gemini 3.8 Live API
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-full bg-stone-800/80 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Audio Wave & Status Visualizer */}
        <div className="my-auto flex flex-col items-center space-y-6 z-10 w-full text-center">
          {/* Animated Pulsing Rings */}
          <div className="relative flex items-center justify-center w-36 h-36">
            <div
              className="absolute inset-0 rounded-full border border-amber-500/20 transition-transform duration-100 ease-out"
              style={{
                transform: `scale(${1 + volumeLevel * 0.8})`,
                opacity: Math.max(0.2, volumeLevel),
              }}
            />
            <div
              className="absolute inset-2 rounded-full border border-amber-400/30 transition-transform duration-150 ease-out"
              style={{
                transform: `scale(${1 + volumeLevel * 0.5})`,
              }}
            />
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                sessionStatus === 'speaking'
                  ? 'bg-gradient-to-tr from-amber-600 to-amber-400 shadow-amber-500/30 scale-105'
                  : sessionStatus === 'connected'
                  ? 'bg-stone-800 border border-stone-700 text-stone-300'
                  : 'bg-stone-800/80 border border-stone-700 text-stone-500'
              }`}
            >
              {sessionStatus === 'speaking' ? (
                <Volume2 className="w-8 h-8 text-stone-950 animate-bounce" />
              ) : isMuted ? (
                <MicOff className="w-8 h-8 text-red-400" />
              ) : (
                <Mic className="w-8 h-8 text-amber-400" />
              )}
            </div>
          </div>

          {/* Status Label */}
          <div>
            <h3 className="font-display text-lg font-bold text-stone-100">
              {sessionStatus === 'connecting'
                ? 'Connecting to Gemini 3.8 Live...'
                : sessionStatus === 'speaking'
                ? 'Aura Advisor is Speaking'
                : isMuted
                ? 'Microphone Muted'
                : 'Listening to your voice...'}
            </h3>
            <p className="text-xs text-stone-400 max-w-xs mx-auto mt-1">
              {sessionStatus === 'speaking'
                ? 'Speak anytime or tap interrupt to interject.'
                : 'Ask questions about room resonance, acoustics, or furniture pairings.'}
            </p>
          </div>

          {/* Error notice if any */}
          {errorMessage && (
            <div className="p-3 bg-red-950/70 border border-red-800/80 rounded-xl text-xs text-red-300 max-w-sm text-left flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Live transcriptions snippet */}
          {transcriptions.length > 0 && (
            <div className="w-full max-w-sm bg-stone-950/60 border border-stone-800/80 rounded-xl p-3 text-left space-y-1.5 text-xs">
              {transcriptions.map((t, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="font-mono text-[10px] uppercase text-stone-500 shrink-0">
                    {t.isUser ? 'You:' : 'Aura:'}
                  </span>
                  <span className="text-stone-300 text-[11px] line-clamp-2">{t.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Controls Bar */}
        <div className="w-full flex items-center justify-center gap-4 z-10 pt-4 border-t border-stone-800/80">
          <button
            onClick={handleToggleMute}
            className={`p-3.5 rounded-full transition-colors cursor-pointer ${
              isMuted
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {sessionStatus === 'speaking' && (
            <button
              onClick={handleInterrupt}
              className="px-4 py-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-200 transition-colors cursor-pointer"
            >
              Interrupt Speech
            </button>
          )}

          <button
            onClick={onClose}
            className="p-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
            title="End voice conversation"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
