import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
    Moon, Sun, ArrowUpRight, Box, Link2, Fingerprint,
    Github, Twitter, ExternalLink, ChevronDown, Zap,
    Shield, Cpu, QrCode
} from 'lucide-react';

/* ── DATA ────────────────────────────────────────── */
const ROLES = [
    { icon: '👑', title: 'Owner', color: 'from-amber-400/20 to-amber-600/5 border-amber-500/30', iconBg: 'bg-amber-500/10 text-amber-400', desc: 'Deploy & govern the entire supply chain. Register all actors, set roles, and maintain system integrity.' },
    { icon: '🏭', title: 'Manufacturer', color: 'from-cyan-400/20 to-cyan-600/5 border-cyan-500/30', iconBg: 'bg-cyan-500/10 text-cyan-400', desc: 'Manage inventory, fulfill orders, and coordinate raw material intake seamlessly.' },
    { icon: '⚙️', title: 'Raw Material Supplier', color: 'from-violet-400/20 to-violet-600/5 border-violet-500/30', iconBg: 'bg-violet-500/10 text-violet-400', desc: 'Dispatch goods and trigger on-chain escrow payments instantly upon delivery.' },
    { icon: '🚚', title: 'Distributor', color: 'from-emerald-400/20 to-emerald-600/5 border-emerald-500/30', iconBg: 'bg-emerald-500/10 text-emerald-400', desc: 'Auto-assigned via smart contract for trustless, verifiable last-mile delivery.' },
    { icon: '🛍️', title: 'Consumer', color: 'from-rose-400/20 to-rose-600/5 border-rose-500/30', iconBg: 'bg-rose-500/10 text-rose-400', desc: 'Track real-time supply chain journey and initiate verified returns via QR waybill.' },
];

const STEPS = [
    { step: '01', title: 'Order Placed', desc: 'Consumer places order. Funds are immutably locked in an on-chain escrow contract.', accent: 'border-primary/50 shadow-primary/5' },
    { step: '02', title: 'Materials Requested', desc: 'Manufacturer sources raw materials via decentralized requests to the RMS actor.', accent: 'border-violet-500/50 shadow-violet-500/5' },
    { step: '03', title: 'Production Phase', desc: 'Goods are manufactured and packaged under strict on-chain quality validation.', accent: 'border-amber-500/50 shadow-amber-500/5' },
    { step: '04', title: 'In Transit', desc: 'Distributor automatically assigned. Goods tracked in real-time with immutable logs.', accent: 'border-emerald-500/50 shadow-emerald-500/5' },
    { step: '05', title: 'Delivery & Release', desc: 'Consumer confirmation automatically unlocks and distributes escrow to all actors.', accent: 'border-cyan-500/50 shadow-cyan-500/5' },
];

const STATS = [
    { value: '5', label: 'Distinct Roles', gradient: 'from-primary to-secondary', border: 'border-primary/20' },
    { value: '100%', label: 'On-Chain Verified', gradient: 'from-violet-500 to-purple-600', border: 'border-violet-500/20' },
    { value: '0', label: 'Intermediary Trust', gradient: 'from-emerald-400 to-teal-500', border: 'border-emerald-500/20' },
    { value: '2.5', label: 'Gemini AI Model', gradient: 'from-amber-400 to-orange-500', border: 'border-amber-500/20' },
];

/* ── COMPONENT ────────────────────────────────────── */
export function LandingPage({ isDark, toggleTheme }) {
    const navigate = useNavigate();
    const heroRef = useRef(null);
    const [scrolled, setScrolled] = useState(false);

    /* Navbar scroll shadow */
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    /* Hero parallax mouse */
    useEffect(() => {
        const hero = heroRef.current;
        if (!hero) return;
        const onMove = (e) => {
            const { clientX, clientY } = e;
            const { width, height, left, top } = hero.getBoundingClientRect();
            hero.style.setProperty('--mx', `${((clientX - left) / width - 0.5) * 40}px`);
            hero.style.setProperty('--my', `${((clientY - top) / height - 0.5) * 40}px`);
        };
        hero.addEventListener('mousemove', onMove);
        return () => hero.removeEventListener('mousemove', onMove);
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans selection:bg-primary/30">

            {/* ── NAVBAR ──────────────────────────────────────── */}
            <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 backdrop-blur-xl border-b border-border transition-all duration-300 ${scrolled ? 'bg-background/80 shadow-xl shadow-black/10 py-3' : 'bg-background/40'}`}>
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-black text-sm text-primary-foreground shadow-lg shadow-primary/30">
                        SC
                    </div>
                    <span className="font-black text-base tracking-wider uppercase hidden sm:block">AI Supply Chain</span>
                </div>

                {/* Nav links */}
                <div className="hidden md:flex items-center gap-1 mr-4">
                    {[['#process', 'Process'], ['#capabilities', 'Capabilities'], ['#roles', 'Entities']].map(([href, label]) => (
                        <a key={href} href={href}
                            className="px-4 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all">
                            {label}
                        </a>
                    ))}
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-3">
                    <button onClick={toggleTheme}
                        className="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
                        {isDark ? <Sun size={17} /> : <Moon size={17} />}
                    </button>
                    <button onClick={() => navigate('/app')}
                        className="px-5 py-2.5 rounded-xl bg-foreground text-background font-bold text-sm tracking-wide hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/10 flex items-center gap-2">
                        Launch App <ArrowUpRight size={15} />
                    </button>
                </div>
            </nav>

            {/* ── HERO ────────────────────────────────────────── */}
            <section
                ref={heroRef}
                className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-24 overflow-hidden"
                style={{ '--mx': '0px', '--my': '0px' }}
            >
                {/* Orbs */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 -left-24 w-[700px] h-[700px] rounded-full bg-primary/8 blur-[140px]"
                        style={{ transform: 'translate(calc(var(--mx)*1.2), calc(var(--my)*1.2))', transition: 'transform 0.08s ease-out' }} />
                    <div className="absolute bottom-1/4 -right-24 w-[600px] h-[600px] rounded-full bg-accent/8 blur-[120px]"
                        style={{ transform: 'translate(calc(var(--mx)*-1), calc(var(--my)*-1))', transition: 'transform 0.08s ease-out' }} />
                    {/* Dot grid */}
                    <div className="absolute inset-0"
                        style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.4 }} />
                </div>

                <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-primary/25 bg-primary/5 text-primary text-xs font-bold mb-10 tracking-[0.15em] uppercase backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Blockchain · Smart Contracts · AI Analytics
                    </div>

                    {/* Headline */}
                    <h1 className="text-[14vw] sm:text-[11vw] md:text-[9rem] lg:text-[11rem] font-black leading-[0.82] tracking-tighter mb-6">
                        <span className="text-foreground">SUPPLY</span>
                        <br />
                        <span className="relative inline-block">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%] animate-[gradientShift_4s_ease-in-out_infinite]">
                                CHAIN
                            </span>
                            {/* underline glow */}
                            <span className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-primary/60 via-accent/60 to-primary/60 blur-sm" />
                        </span>
                    </h1>

                    {/* Subheading */}
                    <p className="mt-6 text-lg md:text-2xl text-muted-foreground font-medium max-w-2xl leading-relaxed mb-12">
                        End-to-end decentralized logistics with&nbsp;
                        <span className="text-foreground font-semibold">immutable ledgers</span>,&nbsp;
                        <span className="text-foreground font-semibold">automated escrow</span>&nbsp;and&nbsp;
                        <span className="text-foreground font-semibold">AI-driven insights</span>.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <button onClick={() => navigate('/app')}
                            className="group relative px-8 py-4 rounded-2xl bg-foreground text-background font-bold text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center gap-3 shadow-xl shadow-black/20">
                            {/* Pulsing ring */}
                            <span className="absolute inset-0 rounded-2xl ring-2 ring-primary/30 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                            Enter Dashboard <ArrowUpRight size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                        <a href="#process"
                            className="px-8 py-4 rounded-2xl border border-border text-muted-foreground font-bold text-sm uppercase tracking-widest hover:border-primary/40 hover:text-foreground hover:bg-muted/50 transition-all flex items-center gap-2">
                            See How It Works <ChevronDown size={16} className="animate-bounce" />
                        </a>
                    </div>

                    {/* Trust chips */}
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-10 opacity-60">
                        {['Powered by Ethereum', 'Anvil Local Chain', 'MetaMask Compatible', 'Gemini 2.5 AI'].map(t => (
                            <span key={t} className="px-3 py-1 rounded-full border border-border text-xs text-muted-foreground font-medium">{t}</span>
                        ))}
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/40">
                    <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
                    <div className="w-px h-10 bg-gradient-to-b from-muted-foreground/40 to-transparent" />
                </div>
            </section>

            {/* ── STATS STRIP ─────────────────────────────────── */}
            <section className="border-y border-border bg-card/30 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-border">
                    {STATS.map((s, i) => (
                        <div key={i} className="flex flex-col gap-1.5 lg:px-10 first:pl-0 last:pr-0 relative group">
                            {/* Coloured top accent on hover */}
                            <div className={`absolute top-0 left-0 lg:top-auto lg:left-0 lg:bottom-0 w-full h-0.5 lg:w-0.5 lg:h-full bg-gradient-to-r ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full`} />
                            <span className={`text-3xl md:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r ${s.gradient}`}>{s.value}</span>
                            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">{s.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── BENTO: CAPABILITIES ─────────────────────────── */}
            <section id="capabilities" className="py-28 px-6 md:px-12 max-w-7xl mx-auto">
                <div className="mb-14">
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-3">Core Architecture</p>
                    <h2 className="text-5xl md:text-[5.5rem] font-black tracking-tighter leading-[0.88]">
                        Engineered for<br /><span className="text-muted-foreground/60">Absolute Truth.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5" style={{ gridAutoRows: 'minmax(280px, auto)' }}>

                    {/* HERO CARD */}
                    <div className="md:col-span-2 md:row-span-2 rounded-3xl p-10 bg-gradient-to-br from-card via-card to-background border border-border relative overflow-hidden group hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
                        <div className="absolute inset-0 bg-gradient-to-bl from-primary/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        {/* Animated rings */}
                        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full border border-border/40 group-hover:border-primary/20 transition-all duration-700 group-hover:scale-110" />
                        <div className="absolute -bottom-48 -right-48 w-96 h-96 rounded-full border border-border/20 group-hover:border-primary/10 transition-all duration-1000 group-hover:scale-110" />

                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <Shield className="w-6 h-6 text-primary" />
                            </div>

                            <div>
                                <div className="flex items-baseline gap-3 mb-3">
                                    <h3 className="text-3xl md:text-5xl font-bold tracking-tight leading-none">Tamper-Proof</h3>
                                </div>
                                <h3 className="text-3xl md:text-5xl font-bold tracking-tight leading-none text-muted-foreground/60 mb-6">Ledger.</h3>
                                <p className="text-muted-foreground text-base md:text-lg max-w-md leading-relaxed">
                                    Every waybill, transaction, and state change is permanently stamped onto the native chain. No intermediaries. No reversals.
                                </p>
                            </div>

                            {/* Feature pills */}
                            <div className="flex flex-wrap gap-2 mt-6">
                                {['Immutable', 'Zero-Trust', 'Verifiable'].map(t => (
                                    <span key={t} className="px-3 py-1.5 rounded-xl border border-border bg-muted/40 text-xs font-semibold text-muted-foreground">{t}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ESCROW CARD */}
                    <div className="rounded-3xl p-8 bg-card border border-border flex flex-col justify-between hover:border-violet-500/40 hover:bg-violet-500/5 transition-all duration-300 group relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-purple-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-t-3xl" />
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                            <Link2 className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                            <h4 className="text-2xl font-bold mb-2 tracking-tight">Smart Escrow</h4>
                            <p className="text-muted-foreground text-sm leading-relaxed">Funds locked at order creation, released only upon cryptographic consumer confirmation.</p>
                        </div>
                    </div>

                    {/* QR CARD */}
                    <div className="rounded-3xl p-8 bg-card border border-border flex flex-col justify-between hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all duration-300 group relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-t-3xl" />
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <QrCode className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h4 className="text-2xl font-bold mb-2 tracking-tight">QR Waybill</h4>
                            <p className="text-muted-foreground text-sm leading-relaxed">Scan any physical item to view its complete immutable chain of custody on-chain.</p>
                        </div>
                    </div>

                    {/* AI CARD — full width */}
                    <div className="md:col-span-3 rounded-3xl p-8 md:p-12 bg-foreground text-background relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8 group">
                        {/* Gradient shimmer */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-transparent to-accent/15 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                        <div className="relative z-10 flex-1">
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-background/15 border border-background/20 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                                <Cpu size={12} /> Gemini AI Powered
                            </span>
                            <h3 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
                                Intelligent Order<br />
                                <span className="text-background/60">Analysis.</span>
                            </h3>
                            <p className="text-background/65 text-base md:text-lg max-w-xl leading-relaxed">
                                Deep learning models automatically evaluate risk, suggest optimal shipping routes, and detect supply chain anomalies in real time.
                            </p>
                        </div>

                        <div className="relative z-10 flex-shrink-0">
                            <div className="p-6 rounded-2xl bg-background/8 border border-background/15 backdrop-blur-sm group-hover:rotate-2 transition-transform duration-500 min-w-[160px]">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400" />
                                    </span>
                                    <span className="text-sm font-bold">Live Analysis</span>
                                </div>
                                <div className="space-y-2">
                                    {['Risk: Low ✓', 'Route: Optimal ✓', 'Fraud: None ✓'].map(l => (
                                        <div key={l} className="text-xs text-background/60 font-mono">{l}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* ── PROCESS PIPELINE ────────────────────────────── */}
            <section id="process" className="py-28 border-y border-border bg-muted/20 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 md:px-12">

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent mb-3">The Pipeline</p>
                            <h2 className="text-5xl md:text-[5.5rem] font-black tracking-tighter leading-[0.88]">
                                Fluid.<br /><span className="text-muted-foreground/60">Synchronized.</span>
                            </h2>
                        </div>
                        <p className="max-w-xs text-muted-foreground leading-relaxed text-base border-l-2 border-accent/40 pl-4">
                            Five phases operating through decentralized consensus a fully autonomous logistics network.
                        </p>
                    </div>

                    {/* Zigzag timeline */}
                    <div className="relative">
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent hidden lg:block" />
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
                            {STEPS.map((s, i) => (
                                <div key={i} className={`group ${i % 2 !== 0 ? 'lg:mt-24' : 'lg:mb-24'}`}>
                                    <div className={`bg-card border rounded-2xl p-6 transition-all duration-300 hover:shadow-xl group-hover:-translate-y-1.5 relative ${s.accent}`}>
                                        {/* Step number with ring */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="relative w-10 h-10 flex-shrink-0">
                                                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${STATS[i % 4].gradient} opacity-20 group-hover:opacity-40 transition-opacity`} />
                                                <div className="relative h-full flex items-center justify-center font-black text-sm">{s.step}</div>
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-base text-foreground mb-2">{s.title}</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>

                                        {/* Connector dot */}
                                        <div className={`hidden lg:block absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-card ring-2 ring-border bg-foreground/20 ${i % 2 === 0 ? '-bottom-[3.75rem]' : '-top-[3.75rem]'}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </section>

            {/* ── ROLES ───────────────────────────────────────── */}
            <section id="roles" className="py-28 px-6 md:px-12 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-3">Participants</p>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">Five Roles. One Chain.</h2>
                    <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">Every actor carries cryptographic permissions defining exactly what they can read, write, and execute on-chain.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {ROLES.map((role) => (
                        <div key={role.title}
                            className={`relative p-6 rounded-2xl border bg-gradient-to-b ${role.color} group hover:-translate-y-1.5 transition-all duration-300 hover:shadow-xl flex flex-col gap-4`}>
                            <div className={`w-12 h-12 rounded-xl ${role.iconBg} flex items-center justify-center text-2xl border border-current/10`}>
                                {role.icon}
                            </div>
                            <div>
                                <h4 className="font-bold text-base mb-1.5">{role.title}</h4>
                                <p className="text-muted-foreground text-xs leading-relaxed">{role.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA SECTION ─────────────────────────────────── */}
            <section className="relative py-40 bg-foreground text-background flex flex-col items-center justify-center text-center overflow-hidden px-6">
                {/* Noise texture */}
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />
                {/* Glow */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[900px] h-[400px] rounded-full blur-[120px] opacity-20 bg-gradient-to-r from-primary/50 to-accent/50" />
                </div>
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

                <div className="relative z-10 max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/10 border border-background/20 text-xs font-bold uppercase tracking-widest mb-8">
                        <Zap size={12} className="text-primary" /> Ready to Deploy
                    </div>
                    <h2 className="text-[11vw] sm:text-[8rem] font-black leading-none tracking-tighter mb-6">
                        GO LIVE
                    </h2>
                    <p className="text-lg md:text-xl text-background/60 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                        Connect your MetaMask wallet to the blockchain-native supply chain and experience full transaction transparency, automated escrow, and AI-powered insights.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                        <button onClick={() => navigate('/app')}
                            className="group relative px-10 py-5 rounded-2xl bg-background text-foreground font-black text-base hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-3">
                            <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 ring-4 ring-primary/20 scale-105" />
                            Enter Dashboard
                            <ArrowUpRight size={22} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                        <a href="https://github.com/Hritikraj8804/BlockChain-SCM" target="_blank" rel="noopener noreferrer"
                            className="px-8 py-5 rounded-2xl border border-background/20 text-background/70 font-bold text-base hover:bg-background/10 hover:text-background transition-all flex items-center gap-3">
                            <Github size={20} /> View Source
                        </a>
                    </div>

                    {/* Social proof */}
                    <div className="flex flex-wrap items-center justify-center gap-6 mt-16 opacity-40 text-xs font-semibold uppercase tracking-widest">
                        <span>Blockchain Verified</span>
                        <span className="w-1 h-1 rounded-full bg-background/60" />
                        <span>AI Powered</span>
                        <span className="w-1 h-1 rounded-full bg-background/60" />
                        <span>Open Source</span>
                        <span className="w-1 h-1 rounded-full bg-background/60" />
                        <span>MetaMask Ready</span>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ──────────────────────────────────────── */}
            <footer className="border-t border-border bg-background py-10 px-6 md:px-12">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-black text-sm text-primary-foreground">SC</div>
                        <span className="font-black tracking-wider uppercase">AI Supply Chain</span>
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <a href="#process" className="hover:text-foreground transition-colors">Process</a>
                        <a href="#capabilities" className="hover:text-foreground transition-colors">Architecture</a>
                        <a href="#roles" className="hover:text-foreground transition-colors">Entities</a>
                    </div>

                    {/* Socials + back to top */}
                    <div className="flex items-center gap-4">
                        <a href="https://github.com/Hritikraj8804/BlockChain-SCM" target="_blank" rel="noopener noreferrer"
                            className="w-9 h-9 rounded-full border border-border hover:border-foreground flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
                            <Github size={15} />
                        </a>
                        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="px-4 py-2 rounded-xl border border-border text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground transition-all">
                            ↑ Top
                        </button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-border/50 text-center text-xs text-muted-foreground/50">
                    © 2026 AI Supply Chain · Blockchain & AI Logistics Architecture
                </div>
            </footer>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes gradientShift { 0%,100% { background-position:0% 50% } 50% { background-position:100% 50% } }
        html { scroll-behavior: smooth; }
      ` }} />
        </div>
    );
}
