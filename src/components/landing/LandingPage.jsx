import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { Moon, Sun, ArrowUpRight, Box, Link2, Truck, Droplet, Factory, Fingerprint } from 'lucide-react';

const ROLES = [
    { icon: '👑', title: 'Owner', desc: 'Deploy & govern the entire supply chain. Register actors and maintain integrity.' },
    { icon: '🏭', title: 'Manufacturer', desc: 'Manage inventory, fulfill orders, and coordinate raw material intake.' },
    { icon: '⚙️', title: 'Raw Material Supplier', desc: 'Dispatch goods and trigger on-chain escrow payments instantly.' },
    { icon: '🚚', title: 'Distributor', desc: 'Auto-assigned via smart contract for trustless last-mile delivery.' },
    { icon: '🛍️', title: 'Consumer', desc: 'Track real-time supply chain journey, and initiate returns via QR.' },
];

const STEPS = [
    { step: '01', title: 'Order Placed', desc: 'Consumer places order. Funds are immutably locked in an escrow contract.' },
    { step: '02', title: 'Materials Requested', desc: 'Manufacturer sources raw materials via decentralized requests.' },
    { step: '03', title: 'Production Phase', desc: 'Goods are manufactured and packaged under strict quality validation.' },
    { step: '04', title: 'In Transit', desc: 'Distributor automatically assigned. Goods are tracked in real-time.' },
    { step: '05', title: 'Delivery & Release', desc: 'Delivery confirmation automatically unlocks and distributes escrow funds.' },
];

export function LandingPage({ isDark, toggleTheme }) {
    const navigate = useNavigate();
    const heroRef = useRef(null);

    // Subtle mouse movement effect for hero background
    useEffect(() => {
        const hero = heroRef.current;
        if (!hero) return;
        const handleMouseMove = (e) => {
            const { clientX, clientY, currentTarget } = e;
            const { width, height, left, top } = currentTarget.getBoundingClientRect();
            const x = ((clientX - left) / width - 0.5) * 30;
            const y = ((clientY - top) / height - 0.5) * 30;
            hero.style.setProperty('--mx', `${x}px`);
            hero.style.setProperty('--my', `${y}px`);
        };
        hero.addEventListener('mousemove', handleMouseMove);
        return () => hero.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans selection:bg-primary/30">

            {/* ── NAVBAR ────────────────────────────────────────────── */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 backdrop-blur-xl bg-background/60 border-b border-border transition-colors duration-300">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 text-lg rounded-lg bg-foreground text-background flex items-center justify-center font-black tracking-tighter shadow-lg shadow-primary/20">
                        SC
                    </div>
                    <span className="font-bold text-lg tracking-widest uppercase hidden sm:block">AI Supply Chain</span>
                </div>

                <div className="flex items-center gap-8">
                    <div className="hidden md:flex items-center gap-10 text-sm font-bold uppercase tracking-widest text-muted-foreground mr-6">
                        <a href="#process" className="hover:text-foreground transition-colors">Process</a>
                        <a href="#capabilities" className="hover:text-foreground transition-colors">Capabilities</a>
                        <a href="#roles" className="hover:text-foreground transition-colors">Entities</a>
                    </div>

                    <button
                        onClick={toggleTheme}
                        className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors shadow-sm"
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-3.5 rounded-full bg-foreground text-background font-bold text-sm uppercase tracking-widest transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                    >
                        Launch System
                    </button>
                </div>
            </nav>

            {/* ── HERO ────────────────────────────────────────────── */}
            <section
                ref={heroRef}
                className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-20 overflow-hidden"
                style={{ '--mx': '0px', '--my': '0px' }}
            >
                {/* Dynamic Abstract Background Elements */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] mix-blend-screen animate-pulse"
                        style={{ transform: 'translate(calc(var(--mx) * 1.5), calc(var(--my) * 1.5))' }} />
                    <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] rounded-full bg-accent/10 blur-[120px] mix-blend-screen"
                        style={{ transform: 'translate(calc(var(--mx) * -1.5), calc(var(--my) * -1.5))' }} />
                    {/* Subtle Grid Pattern */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTYwIDBMMCAwIDAgNjAlMjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzgwODA4MCIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9zdmc+')] opacity-50" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col items-center text-center">

                    <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-semibold mb-10 backdrop-blur-md uppercase tracking-[0.2em]">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Enterprise-Grade Smart Contracts
                    </div>

                    <h1 className="text-[12vw] md:text-[8rem] lg:text-[10rem] font-black leading-[0.8] tracking-tighter mb-8 text-foreground">
                        SUPPLY<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-[gradientShift_5s_ease-in-out_infinite]">
                            CHAIN
                        </span>
                    </h1>

                    <h2 className="text-xl md:text-3xl font-medium text-muted-foreground tracking-tight max-w-2xl mb-12">
                        Unleashing absolute transparency and trustless escrow in cargo management.
                    </h2>

                    <div className="flex flex-col items-center justify-center w-full mt-4">
                        <button
                            onClick={() => navigate('/')}
                            className="px-10 py-5 rounded-2xl bg-foreground text-background font-bold text-base uppercase tracking-widest transition-all hover:bg-primary hover:text-primary-foreground hover:scale-105 flex items-center justify-center gap-3 shadow-xl shadow-primary/10"
                        >
                            Enter Dashboard <ArrowUpRight size={22} />
                        </button>
                    </div>

                </div>

            </section>

            {/* ── METRICS STRIP ───────────────────────────────────── */}
            <section className="border-y border-border bg-card/50 backdrop-blur-xl relative z-20">
                <div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 divide-x divide-border/0 lg:divide-border [&>*:not(:first-child)]:lg:pl-12">
                        {[
                            { label: 'Blockchain Framework', value: 'Anvil Local' },
                            { label: 'Smart Contract', value: 'Immutable' },
                            { label: 'Automated Escrow', value: '100% Lock' },
                            { label: 'AI Integration', value: 'Gemini 2.5' }
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col gap-1">
                                <span className="text-3xl md:text-4xl font-black text-foreground tracking-tighter">{stat.value}</span>
                                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── BENTO BOX CAPABILITIES (BLUE NILE / SWISS DESIGN) ── */}
            <section id="capabilities" className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
                <div className="mb-16">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary mb-4">Core Architecture</h3>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground leading-[0.9]">
                        Engineered for <br /> Absolute Truth.
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">

                    {/* Card 1: Large Feature */}
                    <div className="md:col-span-2 md:row-span-2 rounded-[2rem] p-10 bg-gradient-to-br from-card to-background border border-border relative overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-500">
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <Box className="w-12 h-12 text-primary mb-6" />
                            <div>
                                <h3 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-none">Tamper-Proof<br />Ledger</h3>
                                <p className="text-muted-foreground text-lg max-w-sm">Every waybill, transaction, and state change is immutably stamped onto the blockchain native chain. Zero intermediaries.</p>
                            </div>
                        </div>
                        {/* Decorative element */}
                        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full border border-border/50 group-hover:border-primary/30 transition-colors duration-500" />
                        <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full border border-border/50 group-hover:border-primary/30 transition-colors duration-500" />
                    </div>

                    {/* Card 2 */}
                    <div className="rounded-[2rem] p-8 bg-card border border-border flex flex-col justify-between shadow-sm hover:border-accent/50 transition-colors group">
                        <Link2 className="w-8 h-8 text-accent mb-4 group-hover:scale-110 transition-transform" />
                        <div>
                            <h4 className="text-xl font-bold mb-2">Smart Escrow</h4>
                            <p className="text-muted-foreground text-sm">Funds are locked at order creation and only released upon cryptographic consumer signature.</p>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="rounded-[2rem] p-8 bg-card border border-border flex flex-col justify-between shadow-sm hover:border-primary/50 transition-colors group">
                        <Fingerprint className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                        <div>
                            <h4 className="text-xl font-bold mb-2">QR Waybill</h4>
                            <p className="text-muted-foreground text-sm">Scan physical items instantly to verify chain of custody, timestamped on-chain.</p>
                        </div>
                    </div>

                    {/* Card 4 */}
                    <div className="md:col-span-3 rounded-[2rem] p-8 md:p-12 bg-foreground text-background relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 group">
                        <div className="relative z-10 flex-1">
                            <div className="inline-block px-3 py-1 bg-background/20 rounded-full text-xs font-bold uppercase tracking-widest mb-6">Gemini AI Powered</div>
                            <h3 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Intelligent Order<br />Analysis</h3>
                            <p className="text-background/70 text-lg max-w-xl">Deep learning models automatically evaluate risk, suggest optimal shipping routes, and detect supply chain anomalies in real time.</p>
                        </div>
                        <div className="w-full md:w-1/3 flex justify-end relative z-10">
                            <div className="p-8 rounded-2xl bg-background/10 backdrop-blur-md border border-background/20 transform group-hover:rotate-3 transition-transform duration-500">
                                <div className="animate-pulse flex items-center gap-4 text-xl font-bold">
                                    <span className="w-3 h-3 rounded-full bg-green-400" /> Secure
                                </div>
                            </div>
                        </div>
                        {/* Background gradient for contrast */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-accent/20 opacity-30" />
                    </div>

                </div>
            </section>

            {/* ── ISOMETRIC INSPIRED PROCESS BOARD (GO MOVER STYLE) ── */}
            <section id="process" className="py-32 bg-muted/30 border-y border-border overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 md:px-12">

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-accent mb-4">The Pipeline</h3>
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground leading-[0.9]">
                                Fluid.<br />Synchronized.
                            </h2>
                        </div>
                        <p className="max-w-sm text-muted-foreground font-medium">
                            Five distinct phases operating entirely through decentralized consensus. A completely autonomous logistics network.
                        </p>
                    </div>

                    <div className="relative">
                        {/* Architectural Connecting Line */}
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border hidden lg:block -translate-y-1/2" />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4 relative z-10">
                            {STEPS.map((s, i) => (
                                <div key={i} className={`relative flex flex-col ${i % 2 !== 0 ? 'lg:mt-32' : 'lg:mb-32'} group`}>
                                    {/* The Node Card */}
                                    <div className="bg-card border border-border p-6 rounded-2xl shadow-xl transition-all duration-300 group-hover:-translate-y-2 group-hover:border-primary/50 relative z-20 h-full flex flex-col">
                                        <div className="text-4xl font-black text-muted/50 mb-4 tracking-tighter">{s.step}</div>
                                        <h4 className="text-lg font-bold text-foreground mb-3">{s.title}</h4>
                                        <p className="text-sm text-muted-foreground flex-grow">{s.desc}</p>

                                        {/* Visual Connector Node */}
                                        <div className={`hidden lg:block absolute w-4 h-4 rounded-full bg-card border-2 border-primary left-1/2 -translate-x-1/2 ${i % 2 !== 0 ? '-top-[6.5rem]' : '-bottom-[6.5rem]'}`} />
                                        <div className={`hidden lg:block absolute w-0.5 bg-primary/30 left-1/2 -translate-x-1/2 ${i % 2 !== 0 ? '-top-24 h-24' : '-bottom-24 h-24'}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </section>

            {/* ── ACTOR ROLES ─────────────────────────────────────── */}
            <section id="roles" className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground mb-6">Network Entities.</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Every actor in the network carries specific cryptographic permissions defining their interaction capabilities.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                    {ROLES.map((role, i) => (
                        <div key={role.title} className="flex gap-6 group">
                            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex-shrink-0 flex items-center justify-center text-3xl border border-border group-hover:border-foreground transition-colors shadow-sm">
                                {role.icon}
                            </div>
                            <div>
                                <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    {role.title}
                                    <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary">→</span>
                                </h4>
                                <p className="text-muted-foreground text-sm leading-relaxed">{role.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── GIGANTIC CTA ────────────────────────────────────── */}
            <section className="relative px-6 py-40 bg-foreground text-background flex flex-col items-center justify-center text-center overflow-hidden">
                {/* Abstract background */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] opacity-50" />
                </div>

                <div className="relative z-10 max-w-4xl">
                    <h2 className="text-[10vw] md:text-[8rem] font-black leading-none tracking-tighter mb-8">
                        READY TO <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">DEVELOPE?</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-background/70 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
                        Connect your wallet to join the blockchain native supply chain. Experience full transparency and automated trustless execution.
                    </p>

                    <button
                        onClick={() => navigate('/')}
                        className="group px-10 py-6 rounded-full bg-background text-foreground font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-4 mx-auto"
                    >
                        Init System <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={28} />
                    </button>
                </div>
            </section>

            {/* ── FOOTER ──────────────────────────────────────────── */}
            <footer className="py-12 px-6 md:px-12 border-t border-border bg-background">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 text-lg rounded-lg bg-foreground text-background flex items-center justify-center font-black tracking-tighter">
                            SC
                        </div>
                        <span className="font-bold tracking-widest uppercase text-base">AI Supply Chain</span>
                    </div>

                    <div className="text-center md:text-right">
                        <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">© 2026 AI Supply Chain</p>
                        <p className="text-muted-foreground text-sm mt-1">Blockchain & AI Logistics Architecture</p>
                    </div>
                </div>
            </footer>

            {/* Embedded Animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes gradientShift { 
          0%, 100% { background-position: 0% 50%; } 
          50% { background-position: 100% 50%; } 
        }
        html { scroll-behavior: smooth; }
      `}} />
        </div>
    );
}
