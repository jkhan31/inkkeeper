'use client'

import Link from 'next/link'

export function HeroSection() {
    return (
        <section className="py-24 bg-rice-paper">
            <div className="max-w-3xl mx-auto px-6">
                <h1 className="text-4xl lg:text-5xl font-serif font-bold text-sumi-ink leading-tight mb-6">
                    Remember the ideas that stay with you.
                </h1>
                <p className="text-lg text-sumi-ink/70 leading-relaxed mb-10 max-w-xl">
                    InkKeeper helps you capture a short reflection after reading and build a personal archive of ideas from your reading.
                </p>
                <Link href="/login" className="btn-primary">
                    Join Early Access
                </Link>

                {/* Dashboard Screenshot Placeholder */}
                <div className="mt-16 flex justify-center">
                    <div className="relative w-full max-w-sm rotate-1 rounded-3xl bg-white/60 border border-sumi-ink/10 shadow-lg p-6 font-sans">
                        <div className="mb-4">
                            <button className="w-full bg-seal-rust text-rice-paper text-sm font-bold py-2.5 rounded-2xl">
                                Start Reading Session
                            </button>
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest text-sumi-ink/40 mb-3">Recent Reflections</p>
                        <div className="space-y-3">
                            {[
                                { idea: 'Systems matter more than motivation.', book: 'Atomic Habits', date: 'Mar 8' },
                                { idea: 'Curiosity makes difficult work easier to sustain.', book: 'Feel-Good Productivity', date: 'Mar 7' },
                                { idea: 'Design several possible lives and experiment.', book: 'Designing Your Life', date: 'Mar 6' },
                            ].map((entry, i) => (
                                <div key={i} className="border-b border-sumi-ink/5 pb-3 last:border-0 last:pb-0">
                                    <p className="text-sm font-serif text-sumi-ink leading-snug">{entry.idea}</p>
                                    <p className="text-[11px] text-sumi-ink/40 mt-1">{entry.book} · {entry.date}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}