/**
 * AIChatFloating — A premium floating AI chat panel.
 * Role-aware: accepts systemPrompt and accent colour.
 * Drop into any dashboard; it floats in the bottom-right corner.
 */
import { useState, useRef, useEffect } from 'react';
import { callGemini } from '@/lib/gemini-helper';
import { X, Send, Loader2, Bot, ChevronDown, Sparkles } from 'lucide-react';

/* ─── Accent definitions per role ─── */
const ACCENTS = {
    owner: {
        gradient: 'from-amber-500 to-orange-500',
        glow: 'shadow-amber-500/25',
        bubble: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        ring: 'ring-amber-500/30',
        label: 'Owner AI',
        emoji: '🛡️',
    },
    manufacturer: {
        gradient: 'from-teal-500 to-cyan-500',
        glow: 'shadow-teal-500/25',
        bubble: 'bg-teal-500/10 border-teal-500/20 text-teal-400',
        ring: 'ring-teal-500/30',
        label: 'Production AI',
        emoji: '🏭',
    },
    consumer: {
        gradient: 'from-blue-500 to-indigo-500',
        glow: 'shadow-blue-500/25',
        bubble: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        ring: 'ring-blue-500/30',
        label: 'Support AI',
        emoji: '💬',
    },
};

/* ─── Suggested quick questions per role ─── */
const SUGGESTIONS = {
    owner: [
        'How is the supply chain performing?',
        'Are there any bottlenecks?',
        'Which role has the most activity?',
        'What should I do next?',
    ],
    manufacturer: [
        'Which orders need my attention?',
        'How many orders are in production?',
        'Are there pending returns to approve?',
        'Summarise my current workload.',
    ],
    consumer: [
        'Where is my order?',
        'How do I request a return?',
        'How long does delivery take?',
        'What payment methods are accepted?',
    ],
};

/* ─── Message bubble ─── */
function MessageBubble({ msg, accent }) {
    const isAI = msg.role === 'ai';
    return (
        <div className={`flex gap-2.5 ${isAI ? 'items-start' : 'items-start flex-row-reverse'}`}>
            {/* Avatar */}
            {isAI && (
                <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center flex-shrink-0 text-white text-xs shadow-md mt-0.5`}>
                    <Bot size={13} />
                </div>
            )}
            {!isAI && (
                <div className="w-7 h-7 rounded-xl bg-muted border border-border flex items-center justify-center flex-shrink-0 text-xs font-bold text-muted-foreground mt-0.5">
                    U
                </div>
            )}
            {/* Bubble */}
            <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${isAI
                    ? 'bg-card border border-border text-foreground rounded-tl-sm'
                    : 'bg-muted text-foreground rounded-tr-sm'
                    }`}
            >
                {msg.text}
            </div>
        </div>
    );
}

/* ─── Typing indicator ─── */
function TypingIndicator({ accent }) {
    return (
        <div className="flex gap-2.5 items-start">
            <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
                <Bot size={13} className="text-white" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                {[0, 0.2, 0.4].map((d, i) => (
                    <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                        style={{ animationDelay: `${d}s` }}
                    />
                ))}
            </div>
        </div>
    );
}

/* ─── Main component ─── */
export function AIChatFloating({ role, systemPrompt, welcomeMessage }) {
    const accent = ACCENTS[role] || ACCENTS.consumer;
    const suggestions = SUGGESTIONS[role] || [];

    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: welcomeMessage || `Hi! I'm your ${accent.label}. Ask me anything about your supply chain.` },
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);

    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const historyRef = useRef([]); // running conversation for multi-turn

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [open]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isThinking]);

    const send = async (text) => {
        const userText = (text || input).trim();
        if (!userText || isThinking) return;

        setInput('');
        setShowSuggestions(false);
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setIsThinking(true);

        // Build multi-turn history string
        historyRef.current.push(`User: ${userText}`);
        const historyStr = historyRef.current.slice(-8).join('\n');

        const fullPrompt = `${systemPrompt}

Conversation so far:
${historyStr}

Respond helpfully and concisely (2-4 sentences max). Be friendly and professional.
Assistant:`;

        try {
            const reply = await callGemini(fullPrompt);
            historyRef.current.push(`Assistant: ${reply}`);
            setMessages(prev => [...prev, { role: 'ai', text: reply }]);
        } catch (err) {
            let errorMsg = `Sorry, I hit an error: ${err.message}. Please try again.`;
            if (err.message && (err.message.includes('high demand') || err.message.includes('Spikes in demand') || err.message.includes('503'))) {
                errorMsg = "I'm currently assisting many users and need a quick breather. Please try asking again in a few moments! ⏳";
            }
            setMessages(prev => [...prev, { role: 'ai', text: errorMsg }]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setOpen(o => !o)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br ${accent.gradient} text-white flex items-center justify-center shadow-xl ${accent.glow} hover:scale-105 active:scale-95 transition-all duration-200`}
                aria-label="Open AI assistant"
            >
                {open ? <ChevronDown size={22} /> : <Sparkles size={22} />}
                {/* Ping ring */}
                {!open && (
                    <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br ${accent.gradient} animate-ping opacity-60`} />
                )}
            </button>

            {/* Chat panel */}
            <div
                className={`fixed bottom-24 right-6 z-40 w-[340px] sm:w-[380px] max-h-[540px] flex flex-col rounded-2xl border border-border bg-background shadow-2xl ${accent.glow} transition-all duration-300 origin-bottom-right ${open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
                    }`}
            >
                {/* Header */}
                <div className={`flex items-center justify-between px-4 py-3.5 rounded-t-2xl bg-gradient-to-r from-card to-card border-b border-border`}>
                    <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center text-white shadow-sm`}>
                            <Bot size={15} />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-foreground">{accent.label}</div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[10px] text-muted-foreground">Powered by Gemini</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        className="w-7 h-7 rounded-xl hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 max-h-[340px]">
                    {messages.map((msg, i) => (
                        <MessageBubble key={i} msg={msg} accent={accent} />
                    ))}
                    {isThinking && <TypingIndicator accent={accent} />}

                    {/* Quick suggestions */}
                    {showSuggestions && messages.length <= 1 && (
                        <div className="space-y-1.5 pt-1">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Quick questions</p>
                            {suggestions.map(s => (
                                <button
                                    key={s}
                                    onClick={() => send(s)}
                                    className={`w-full text-left px-3 py-2 rounded-xl border text-xs font-medium transition-all hover:scale-[1.01] ${accent.bubble}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-border">
                    <form
                        onSubmit={e => { e.preventDefault(); send(); }}
                        className="flex gap-2 items-end"
                    >
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                            placeholder="Type a message…"
                            disabled={isThinking}
                            className="flex-1 h-10 rounded-xl border border-border bg-muted/40 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 disabled:opacity-50 transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isThinking}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${accent.gradient} text-white disabled:opacity-40 hover:opacity-90 transition-all shadow-sm flex-shrink-0`}
                        >
                            {isThinking ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
