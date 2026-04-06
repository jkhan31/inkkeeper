'use client'

export function ProblemSection() {
    return (
        <section id="problem" className="py-20 px-6 lg:px-10 bg-rice-paper">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-6">
                    <h2 className="text-4xl lg:text-5xl font-serif font-bold text-sumi-ink leading-tight">
                        Reading is easy. <br /> <span className="underline decoration-seal-rust/30 underline-offset-8">Remembering</span> is hard.
                    </h2>
                    <div className="text-lg text-sumi-ink/60 leading-relaxed max-w-md space-y-4">
                        <p>You finish a book full of great ideas.</p>
                        <p>A week later, most of them are gone.</p>
                        <p>Not because the ideas weren&apos;t valuable — but because they were never articulated.</p>
                        <p>We highlight passages.</p>
                        <p>But we rarely ask: what idea actually stayed with me?</p>
                    </div>
                </div>
                <div className="ink-card !p-12 text-center">
                    <div className="inline-block px-4 py-2 bg-seal-rust/10 text-seal-rust rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                        The Signal vs The Noise
                    </div>
                    <p className="text-2xl font-serif italic text-sumi-ink/80">&ldquo;Most ideas from books are forgotten within days. Not because they weren&rsquo;t worth keeping. Because nothing asked you to hold onto them.&rdquo;</p>
                </div>

            </div>
        </section>
    )
}