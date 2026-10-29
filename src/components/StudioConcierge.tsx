import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Mic, 
  Globe, 
  ExternalLink, 
  RotateCcw, 
  Loader2, 
  Bot, 
  User, 
  ArrowRight,
  Sliders,
  ChevronDown,
  Volume2
} from 'lucide-react';
import { ChatMessage, GeminiModelType, sendChatMessage, GroundingSource } from '../services/geminiClient';

interface StudioConciergeProps {
  onOpenVoice: () => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'intro-1',
    role: 'assistant',
    content: "Velkommen to Aura Studio. I am your Acoustic Engineer and Scandinavian Interior Design Advisor. Ask me about room reverberation, acoustic wool performance, lighting color temperatures, or pair-bonding materials for our handcrafted collection.",
    timestamp: new Date().toISOString(),
    modelUsed: 'gemini-3.8-flash',
  },
];

const PROMPT_SUGGESTIONS = [
  "How should I position the Onyx speaker for optimal soundstage?",
  "What are recent trends in Scandinavian architectural lighting?",
  "Calculate ideal RT60 reverberation decay for a 24m² living room",
  "Why is Kvadrat wool preferred for acoustic grilles?",
];

export const StudioConcierge: React.FC<StudioConciergeProps> = ({ onOpenVoice }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem('aura_chat_history_v1');
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch {
      return INITIAL_MESSAGES;
    }
  });

  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<GeminiModelType>('auto');
  const [enableSearch, setEnableSearch] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save history to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('aura_chat_history_v1', JSON.stringify(messages));
    } catch {
      // ignore
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now().toString(36)}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage({
        messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
        model: selectedModel,
        enableSearch,
      });

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now().toString(36)}-resp`,
        role: 'assistant',
        content: response.text,
        timestamp: response.timestamp,
        modelUsed: response.modelUsed,
        groundingSources: response.groundingSources,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now().toString(36)}`,
        role: 'assistant',
        content: `Could not complete Gemini request: ${err.message}`,
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages(INITIAL_MESSAGES);
    sessionStorage.removeItem('aura_chat_history_v1');
  };

  return (
    <>
      {/* Floating Bottom Left Concierge Trigger */}
      <aside aria-label="Aura AI Concierge">
        <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2">
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-full shadow-lg border border-stone-700/80 transition-all active:scale-95 cursor-pointer"
            title="Open Studio AI Concierge"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold tracking-wide">Studio Advisor</span>
          </button>

          {/* Direct Live Voice Mode Trigger */}
          <button
            onClick={onOpenVoice}
            className="flex items-center gap-1.5 p-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-full shadow-lg transition-all active:scale-95 cursor-pointer"
            title="Start Real-Time Voice Conversation (Gemini 3.8 Live)"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Concierge Drawer / Panel */}
      {isOpen && (
        <aside
          aria-label="Studio Concierge Chat"
          className="fixed bottom-16 left-4 z-40 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col h-[580px] max-h-[82vh] overflow-hidden animate-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="p-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-stone-100 flex items-center gap-2">
                  Aura Studio Advisor
                  <span className="text-[10px] font-mono font-normal px-1.5 py-0.2 bg-stone-800 text-stone-300 rounded">
                    Gemini AI
                  </span>
                </h3>
                <p className="text-[10px] text-stone-400">
                  Acoustic Engineering & Scandinavian Design Consultant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onOpenVoice}
                className="p-1.5 text-amber-400 hover:text-amber-300 rounded hover:bg-stone-800 transition-colors cursor-pointer"
                title="Switch to Real-Time Voice (Gemini 3.8 Live)"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                onClick={handleClearHistory}
                className="p-1.5 text-stone-400 hover:text-white rounded hover:bg-stone-800 transition-colors cursor-pointer"
                title="Reset conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Model Switcher & Search Grounding Bar */}
          <div className="px-3 py-2 bg-stone-100/90 border-b border-stone-200 flex items-center justify-between text-xs">
            {/* Segmented Model Options */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {(
                [
                  { id: 'auto', label: 'Auto Routing' },
                  { id: 'gemini-3.8-flash', label: '3.8 Flash' },
                  { id: 'gemini-3.1-flash-lite', label: '3.1 Lite' },
                  { id: 'gemini-4-argon', label: '4 Argon (Complex)' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                    selectedModel === m.id
                      ? 'bg-stone-900 text-white font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Google Search Grounding Toggle */}
            <label
              className="flex items-center gap-1.5 text-[11px] text-stone-600 hover:text-stone-900 cursor-pointer shrink-0 pl-2 select-none"
              title="Toggle Google Search data for live research and grounding"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <input
                type="checkbox"
                checked={enableSearch}
                onChange={(e) => setEnableSearch(e.target.checked)}
                className="rounded border-stone-300 text-stone-900 w-3 h-3 cursor-pointer"
              />
              <span className="hidden sm:inline">Search Data</span>
            </label>
          </div>

          {/* Chat Messages Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAFAF9] text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 shadow-2xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-stone-900 text-white rounded-br-xs'
                      : msg.isError
                      ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-xs'
                      : 'bg-white text-stone-800 border border-stone-200 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Google Search Grounding Citations */}
                  {msg.groundingSources && msg.groundingSources.length > 0 && (
                    <div className="pt-2 border-t border-stone-100 text-[11px] space-y-1">
                      <div className="flex items-center gap-1 font-semibold text-stone-700">
                        <Globe className="w-3 h-3 text-blue-600" />
                        <span>Google Search Grounded Sources:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {msg.groundingSources.map((source, i) => (
                          <a
                            key={i}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 transition-colors text-[10px] font-mono border border-stone-200 truncate max-w-[200px]"
                            title={source.title}
                          >
                            <span className="truncate">{source.title}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message Meta Info */}
                  {msg.modelUsed && (
                    <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1">
                      <span className="font-mono">model: {msg.modelUsed}</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="p-3 bg-white border border-stone-200 rounded-2xl rounded-bl-xs text-stone-500 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                  <span>Consulting Gemini models & verifying acoustics...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestions */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 bg-stone-100/70 border-t border-stone-200 overflow-x-auto flex gap-2 scrollbar-none">
              {PROMPT_SUGGESTIONS.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(suggestion)}
                  className="px-2.5 py-1 text-[11px] bg-white hover:bg-stone-50 border border-stone-200 rounded-full text-stone-700 whitespace-nowrap transition-colors cursor-pointer shrink-0"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input Form Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about room acoustics, lighting, or materials..."
              className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg outline-none focus:bg-white focus:border-stone-700 transition-all text-stone-900"
            />
            <button
              type="button"
              onClick={onOpenVoice}
              className="p-2 text-stone-500 hover:text-amber-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              title="Speak via Gemini 3.8 Live"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </aside>
      )}
    </>
  );
};
