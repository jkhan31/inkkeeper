'use client'

export function FeaturesSection() {
    return (
        <section id="rediscovery" className="py-24 bg-rice-paper border-t border-sumi-ink/5">
            <div className="max-w-3xl mx-auto px-6">
                <h2 className="text-3xl lg:text-4xl font-serif font-bold text-sumi-ink leading-tight mb-6">
                    Rediscover ideas months later.
                </h2>
                <div className="space-y-4 text-lg text-sumi-ink/70 leading-relaxed mb-12">
                    <p>InkKeeper occasionally surfaces reflections from your archive.</p>
                    <p>A thought you captured months ago might appear again.</p>
                    <p>Not as a task.</p>
                    <p>Just as a quiet moment of rediscovery.</p>
                </div>

                {/* Rediscovery card */}
                <div className="rounded-3xl bg-white/60 border border-sumi-ink/10 shadow-sm p-6 font-sans">
                    <p className="text-xs font-bold uppercase tracking-widest text-seal-rust mb-4">From Your Archive</p>
                    <p className="font-serif text-sumi-ink text-xl italic leading-relaxed mb-4">
                        &ldquo;You fall to the level of your systems.&rdquo;
                    </p>
                    <p className="text-[11px] text-sumi-ink/40">Atomic Habits · 2 months ago</p>
                </div>
            </div>
        </section>
    )
}
