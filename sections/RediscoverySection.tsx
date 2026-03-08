'use client'

export function RediscoverySection() {
    return (
        <section id="rediscovery" className="py-20 px-6 lg:px-10 bg-rice-paper border-t border-sumi-ink/5">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
                <div className="lg:w-1/2 space-y-6">
                    <h2 className="text-4xl font-serif font-bold text-sumi-ink">Rediscover ideas months later.</h2>
                    <div className="text-lg text-sumi-ink/60 leading-relaxed space-y-4">
                        <p>InkKeeper occasionally surfaces reflections from your archive.</p>
                        <p>A thought you captured months ago might appear again.</p>
                        <p>Not as a task.</p>
                        <p>Just as a quiet moment of rediscovery.</p>
                    </div>
                </div>
                <div className="lg:w-1/2">
                    <div className="rounded-3xl border bg-white/70 shadow-sm aspect-[9/16] max-w-xs mx-auto flex items-center justify-center mt-8">
                        <span className="text-sm text-neutral-500">Rediscovery Example</span>
                    </div>
                </div>
            </div>
        </section>
    )
}
