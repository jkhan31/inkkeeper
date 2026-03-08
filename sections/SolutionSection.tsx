'use client'

export function SolutionSection() {
    return (
        <section id="solution" className="py-24 bg-rice-paper border-t border-sumi-ink/5">
            <div className="max-w-3xl mx-auto px-6">
                <h2 className="text-3xl lg:text-4xl font-serif font-bold text-sumi-ink leading-tight mb-8">
                    Capture the idea that stood out.
                </h2>
                <div className="space-y-5 text-lg text-sumi-ink/70 leading-relaxed mb-12">
                    <p>After reading, InkKeeper asks one simple question.</p>
                    <p className="text-2xl font-serif italic text-sumi-ink">What stood out most?</p>
                    <p>You write the idea in your own words.</p>
                    <p>One sentence is enough.</p>
                </div>

                {/* Reflection placeholder */}
                <div className="rounded-3xl bg-white/60 border border-sumi-ink/10 shadow-sm p-6 font-sans">
                    <p className="text-xs font-bold uppercase tracking-widest text-seal-rust mb-4">What stood out most?</p>
                    <p className="font-serif text-sumi-ink text-base leading-relaxed mb-6">
                        Most habits fail because people rely on motivation instead of designing better systems.
                    </p>
                    <div className="border-t border-sumi-ink/5 pt-4 space-y-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-sumi-ink/40 mb-1">Book Title</p>
                            <p className="text-sm text-sumi-ink">Atomic Habits</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-sumi-ink/40 mb-1">Add Notes</p>
                            <p className="text-sm text-sumi-ink/70 leading-relaxed">
                                Environment matters more than willpower. The easier the behavior becomes, the more consistent it becomes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}