'use client'

export function DifferentiationSection() {
    return (
        <section id="philosophy" className="py-20 px-6 lg:px-10 bg-rice-paper border-y border-sumi-ink/5">
            <div className="max-w-3xl mx-auto text-center space-y-6">
                <h2 className="text-4xl font-serif font-bold text-sumi-ink">Designed for thoughtful readers.</h2>
                <p className="text-lg text-sumi-ink/60 leading-relaxed">InkKeeper is intentionally minimal.</p>
                <div className="text-lg text-sumi-ink/60 space-y-2">
                    <p>No streaks.</p>
                    <p>No gamification.</p>
                    <p>No productivity pressure.</p>
                </div>
                <p className="text-lg text-sumi-ink/60 leading-relaxed">
                    Just a quiet place to capture the ideas that stayed with you.
                </p>
            </div>
        </section>
    )
}