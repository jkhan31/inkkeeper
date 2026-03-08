'use client'

export function ProblemSection() {
    return (
        <section id="problem" className="py-32 px-6 lg:px-10 bg-rice-paper">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-6">
                    <h2 className="text-4xl lg:text-5xl font-serif font-bold text-sumi-ink leading-tight">
                        Reading is easy. <br /> <span className="underline decoration-seal-rust/30 underline-offset-8">Remembering</span> is the hard part.
                    </h2>
                    <p className="text-lg text-sumi-ink/60 leading-relaxed max-w-md">
                        Most reading tools track progress.

                        Books finished. Pages read.

                        But they rarely capture what actually stayed with you.
                    </p>
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