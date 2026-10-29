import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  X, 
  Activity, 
  Layers, 
  Database, 
  CheckSquare, 
  Copy, 
  Check, 
  Trash2, 
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { ApiLog } from '../types';
import { subscribeToApiLogs, getStoredLogs, clearStoredLogs, api } from '../services/api';

interface DeveloperInspectorProps {
  productsCount: number;
  ordersCount: number;
  onResetDb: () => void;
}

export const DeveloperInspector: React.FC<DeveloperInspectorProps> = ({
  productsCount,
  ordersCount,
  onResetDb,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'network' | 'architecture' | 'schema' | 'skills'>('network');
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setLogs(getStoredLogs());
    const unsubscribe = subscribeToApiLogs((newLog) => {
      setLogs((prev) => [newLog, ...prev].slice(0, 50));
    });
    return unsubscribe;
  }, []);

  const handleCopyJson = (content: any, id: string) => {
    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearLogs = () => {
    clearStoredLogs();
    setLogs([]);
    setSelectedLogId(null);
  };

  const methodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'POST':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'PUT':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'DELETE':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-stone-700 bg-stone-50 border-stone-200';
    }
  };

  const statusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-emerald-700';
    if (status >= 400 && status < 500) return 'text-amber-700';
    return 'text-red-700';
  };

  return (
    <>
      {/* Floating Bottom Trigger Button */}
      <aside aria-label="Developer tools">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="fixed bottom-4 right-4 z-40 flex items-center gap-2.5 px-3.5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-full shadow-lg border border-stone-700/80 transition-all active:scale-95 cursor-pointer"
          title="Open Developer & Recruiter Inspector"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Terminal className="w-4 h-4 text-stone-200" />
          <span className="text-xs font-semibold tracking-wide">Developer Inspector</span>
          <span className="font-mono text-[11px] bg-stone-800 px-1.5 py-0.5 rounded-full text-stone-300 tabular-nums">
            {logs.length}
          </span>
        </button>
      </aside>

      {/* Main Drawer Console */}
      {isOpen && (
        <aside
          aria-label="Developer Inspector console"
          className="fixed bottom-16 right-4 z-40 w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-300 flex flex-col h-[580px] max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="px-5 py-3.5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <div>
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-stone-100">
                  Engineering Inspector & Telemetry
                </h3>
                <p className="text-[10px] text-stone-400">
                  Real-time full-stack observability for interviewers & recruiters
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-stone-400 hover:text-white rounded transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav Tabs */}
          <div className="flex items-center justify-between px-4 bg-stone-100 border-b border-stone-200 text-xs">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('network')}
                className={`py-2 px-3 font-medium flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'network'
                    ? 'border-stone-900 text-stone-900 font-semibold bg-white'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Live REST API ({logs.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('architecture')}
                className={`py-2 px-3 font-medium flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'architecture'
                    ? 'border-stone-900 text-stone-900 font-semibold bg-white'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Architecture</span>
              </button>
              <button
                onClick={() => setActiveTab('schema')}
                className={`py-2 px-3 font-medium flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'schema'
                    ? 'border-stone-900 text-stone-900 font-semibold bg-white'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Data Schema</span>
              </button>
              <button
                onClick={() => setActiveTab('skills')}
                className={`py-2 px-3 font-medium flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'skills'
                    ? 'border-stone-900 text-stone-900 font-semibold bg-white'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Skills Matrix</span>
              </button>
            </div>

            {activeTab === 'network' && (
              <button
                onClick={handleClearLogs}
                className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
                title="Clear live API logs"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* TAB 1: Live REST API Log */}
          {activeTab === 'network' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-stone-50 font-mono text-xs">
              {logs.length === 0 ? (
                <div className="py-20 text-center text-stone-400 space-y-2">
                  <Activity className="w-8 h-8 mx-auto text-stone-300 animate-pulse" />
                  <p>Awaiting network transactions...</p>
                  <p className="text-[11px]">
                    Interact with the storefront, search products, add items to cart, or create a product to generate live telemetry.
                  </p>
                </div>
              ) : (
                logs.map((log) => {
                  const isExpanded = selectedLogId === log.id;
                  return (
                    <div
                      key={log.id}
                      className="bg-white border border-stone-200 rounded-lg shadow-2xs overflow-hidden transition-all"
                    >
                      {/* Log Header Row */}
                      <button
                        onClick={() => setSelectedLogId(isExpanded ? null : log.id)}
                        className="w-full p-2.5 flex items-center justify-between text-left hover:bg-stone-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${methodColor(
                              log.method
                            )}`}
                          >
                            {log.method}
                          </span>
                          <span className="font-semibold text-stone-800 truncate text-[11px]">
                            {log.endpoint}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 text-[11px]">
                          <span className={`font-bold ${statusColor(log.status)}`}>
                            {log.status} {log.statusText}
                          </span>
                          <span className="text-stone-400 tabular-nums">{log.durationMs}ms</span>
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                          )}
                        </div>
                      </button>

                      {/* Log Expanded Payload Inspector */}
                      {isExpanded && (
                        <div className="p-3 bg-stone-900 text-stone-200 text-[11px] border-t border-stone-200 space-y-3">
                          <div className="flex items-center justify-between text-stone-400 text-[10px] pb-1 border-b border-stone-800">
                            <span>ID: {log.id}</span>
                            <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>

                          {Boolean(log.requestBody) && (
                            <div>
                              <div className="flex items-center justify-between text-stone-400 text-[10px] mb-1">
                                <span>Request Body (Payload):</span>
                                <button
                                  onClick={() => handleCopyJson(log.requestBody, `req-${log.id}`)}
                                  className="text-stone-400 hover:text-white flex items-center gap-1 cursor-pointer"
                                >
                                  {copiedId === `req-${log.id}` ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                  <span>Copy</span>
                                </button>
                              </div>
                              <pre className="p-2 bg-stone-950 rounded text-stone-300 overflow-x-auto max-h-36">
                                {JSON.stringify(log.requestBody, null, 2)}
                              </pre>
                            </div>
                          )}

                          {Boolean(log.responseBody) && (
                            <div>
                              <div className="flex items-center justify-between text-stone-400 text-[10px] mb-1">
                                <span>Response Payload (JSON):</span>
                                <button
                                  onClick={() => handleCopyJson(log.responseBody, `res-${log.id}`)}
                                  className="text-stone-400 hover:text-white flex items-center gap-1 cursor-pointer"
                                >
                                  {copiedId === `res-${log.id}` ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                  <span>Copy</span>
                                </button>
                              </div>
                              <pre className="p-2 bg-stone-950 rounded text-stone-300 overflow-x-auto max-h-48">
                                {JSON.stringify(log.responseBody, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: System Architecture */}
          {activeTab === 'architecture' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-stone-50 text-xs">
              <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2">
                <h4 className="font-semibold text-stone-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-stone-700" />
                  Full-Stack Architecture & Data Flow
                </h4>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  Engineered with strict separation of concerns, defensive input validation layers, and transparent asynchronous network telemetry.
                </p>
                
                {/* Clean ASCII Architecture Box */}
                <pre className="p-3 bg-stone-900 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto leading-tight">
{`┌────────────────────────────────────────────────────────┐
│               1. CLIENT PRESENTATION LAYER             │
│  • React 19 Components with Tailwind CSS Architecture   │
│  • Real-time stock alerts & debounced search           │
│  • Contiguous Product Detail & Cart Drawer state        │
└───────────────────────────┬────────────────────────────┘
                            │ (Async REST API Calls)
                            ▼
┌────────────────────────────────────────────────────────┐
│             2. CONTROLLER & VALIDATION LAYER           │
│  • Schema Validators (Zod-pattern data verification)    │
│  • Client error mapping (422 Unprocessable Entity)     │
│  • Atomic inventory decrementing on Order Submission   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             3. DATA PERSISTENCE & TELEMETRY            │
│  • In-Memory & LocalStorage Relational Seed Store      │
│  • Network Interceptor logging duration & status codes │
│  • Real-time event streaming to Developer Inspector    │
└────────────────────────────────────────────────────────┘`}
                </pre>
              </div>

              {/* Engineering Highlights */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-lg border border-stone-200 space-y-1">
                  <span className="font-semibold text-stone-900 block text-[11px]">
                    1. Atomic Stock Locks
                  </span>
                  <p className="text-stone-500 text-[10px]">
                    Order processing verifies stock availability across all cart items before mutating inventory.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200 space-y-1">
                  <span className="font-semibold text-stone-900 block text-[11px]">
                    2. Schema Validation
                  </span>
                  <p className="text-stone-500 text-[10px]">
                    All product creation and checkout submissions validate email syntax, phone length, card criteria, and positive values.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200 space-y-1">
                  <span className="font-semibold text-stone-900 block text-[11px]">
                    3. Network Simulation
                  </span>
                  <p className="text-stone-500 text-[10px]">
                    Simulates authentic HTTP latency (140ms–280ms) and status code propagation across all CRUD endpoints.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200 space-y-1">
                  <span className="font-semibold text-stone-900 block text-[11px]">
                    4. Zero Broken Images
                  </span>
                  <p className="text-stone-500 text-[10px]">
                    Architectural vector SVG rendering guarantees 100% availability with zero external CDN points of failure.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Data Schema */}
          {activeTab === 'schema' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-stone-50 text-xs">
              <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-stone-900">Relational TypeScript Entities</h4>
                    <p className="text-[11px] text-stone-500">Core data definitions powering the API contracts</p>
                  </div>
                  <button
                    onClick={onResetDb}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Database</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-stone-700 font-mono text-[11px]">
                  <div className="p-2.5 bg-stone-100 rounded">
                    <span className="font-bold text-stone-900 block">Products Table:</span>
                    <span>{productsCount} records active</span>
                  </div>
                  <div className="p-2.5 bg-stone-100 rounded">
                    <span className="font-bold text-stone-900 block">Orders Table:</span>
                    <span>{ordersCount} records committed</span>
                  </div>
                </div>

                <pre className="p-3 bg-stone-900 text-stone-300 rounded-lg font-mono text-[10px] overflow-x-auto max-h-60">
{`export interface Product {
  id: string;
  sku: string;
  name: string;
  category: 'Acoustics' | 'Lighting' | 'Seating' | 'Tableware' | 'Accessories';
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  stock: number;
  description: string;
  features: string[];
  dimensions: string;
  materials: string;
  inStock: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shipping: number;
  tax: number;
  total: number;
  customer: CustomerInfo;
  status: 'confirmed' | 'processing' | 'shipped';
  createdAt: string;
}`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: Skills Matrix (Recruiter Rubric) */}
          {activeTab === 'skills' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-stone-50 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px]">
                <p className="font-semibold">Junior Full-Stack Engineering Rubric</p>
                <p className="text-amber-700 mt-0.5">
                  How this project proves readiness for real engineering team environments:
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    title: 'Full REST CRUD Operations',
                    desc: 'Complete Create, Read, Update, Delete methods for product inventory with HTTP status codes (200, 201, 400, 422, 404).',
                  },
                  {
                    title: 'Complex Multi-Tier State Management',
                    desc: 'Synchronized state across Catalog filters, Shopping Bag drawer, Checkout modal, and live Developer Inspector.',
                  },
                  {
                    title: 'Defensive Data & Form Validation',
                    desc: 'Real-time validation for email regex, postal code, positive price constraints, and mandatory inventory thresholds.',
                  },
                  {
                    title: 'Asynchronous UX & Latency Handling',
                    desc: 'Loading states, optimistic UI feedback, disabled states during network dispatch, and toast notifications.',
                  },
                  {
                    title: 'E-Commerce Business Logic',
                    desc: 'Dynamic promo coupon validation, progressive tiered freight thresholds, sales tax calculation, and inventory locking.',
                  },
                  {
                    title: 'Design System & Accessibility Standards',
                    desc: 'Strict zero-pill discipline, WCAG AA color contrast, responsive typography, and tabular figures for numbers.',
                  },
                  {
                    title: 'Multi-Turn Conversational AI & Search Grounding',
                    desc: 'Context-preserved multi-turn dialogue with Gemini 3.8 Flash, live web research via googleSearch tool, and structured citation link extraction.',
                  },
                  {
                    title: 'Real-Time Voice Architecture (Live API)',
                    desc: 'Full-stack bidirectional WebSocket audio stream with gemini-3.8-live, 16kHz PCM client recording, and 24kHz gapless playback.',
                  },
                  {
                    title: 'Dynamic Model Routing (Argon / Flash / Lite)',
                    desc: 'Intelligent query routing: Gemini 4 Argon for complex acoustic physics, 3.8 Flash for general queries, and 3.1 Flash Lite for ultra-fast replies.',
                  },
                ].map((skill, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-lg border border-stone-200 space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-semibold text-stone-900">{skill.title}</span>
                    </div>
                    <p className="text-stone-500 text-[11px] pl-6 leading-relaxed">
                      {skill.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      )}
    </>
  );
};
