'use client'

export function ProblemSection() {
    return (
        <section id="problem" className="py-32 px-6 lg:px-10 bg-rice-paper">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-6">
                    <h2 className="text-4xl lg:text-5xl font-serif font-bold text-sumi-ink leading-tight">
                        Digital consumption <br /> is a reflex. <span className="underline decoration-seal-rust/30 underline-offset-8">Retention</span> is an art.
                    </h2>
                    <p className="text-lg text-sumi-ink/60 leading-relaxed max-w-md">
                        We scroll, we bookmark, and we forget. InkKeeper stops the cycle by turning passive reading into active reflection.
                    </p>
                </div>
                <div className="ink-card !p-12 text-center">
                    <div className="inline-block px-4 py-2 bg-seal-rust/10 text-seal-rust rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                        The Signal vs The Noise
                    </div>
                    <p className="text-2xl font-serif italic text-sumi-ink/80">&ldquo;Without reflection, even the best ideas become clutter.&rdquo;</p>
                </div>

            </div>
        </section>
    )
}