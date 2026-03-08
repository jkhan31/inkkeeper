'use client'

export function ValueSection() {
    return (
        <section id="capture" className="py-24 bg-rice-paper border-t border-sumi-ink/5">
            <div className="max-w-3xl mx-auto px-6">
                <h2 className="text-3xl lg:text-4xl font-serif font-bold text-sumi-ink leading-tight mb-6">
                    Reflect after reading — your way.
                </h2>
                <div className="space-y-4 text-lg text-sumi-ink/70 leading-relaxed mb-12">
                    <p>Sometimes you sit down for a focused reading session.</p>
                    <p>Sometimes an idea appears unexpectedly.</p>
                    <p>InkKeeper supports both.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Reading Session */}
                    <div className="rounded-3xl bg-white/60 border border-sumi-ink/10 shadow-sm p-6 font-sans">
                        <p className="text-xs font-bold uppercase tracking-widest text-sumi-ink/40 mb-4">Reading Session</p>
                        <ul className="space-y-2 text-sm text-sumi-ink/70 mb-6">
                            <li>Start a timer</li>
                            <li>Read without distraction</li>
                            <li>Capture the idea when you&apos;re done</li>
                        </ul>
                        {/* Timer placeholder */}
                        <div className="rounded-2xl bg-rice-paper border border-sumi-ink/5 p-4 text-center">
                            <p className="text-xs font-bold uppercase tracking-widest text-sumi-ink/40 mb-1">Reading Session</p>
                            <p className="text-3xl font-serif text-sumi-ink mb-4">00:24:18</p>
                            <div className="flex gap-2 justify-center">
                                <button className="px-4 py-1.5 rounded-full border border-sumi-ink/10 text-xs font-bold text-sumi-ink/60">Pause</button>
                                <button className="px-4 py-1.5 rounded-full bg-seal-rust text-rice-paper text-xs font-bold">End Session</button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Capture */}
                    <div className="rounded-3xl bg-white/60 border border-sumi-ink/10 shadow-sm p-6 font-sans">
                        <p className="text-xs font-bold uppercase tracking-widest text-sumi-ink/40 mb-4">Quick Capture</p>
                        <ul className="space-y-2 text-sm text-sumi-ink/70 mb-6">
                            <li>Capture a reflection instantly without starting a session.</li>
                        </ul>
                        {/* Quick reflection input placeholder */}
                        <div className="rounded-2xl bg-rice-paper border border-sumi-ink/5 p-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-seal-rust mb-2">What stood out most?</p>
                            <div className="h-14 rounded-xl bg-sumi-ink/5 mb-3" />
                            <div className="h-8 rounded-xl bg-sumi-ink/5 w-1/2" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
