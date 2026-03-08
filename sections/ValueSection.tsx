'use client'

import { BookOpen } from 'lucide-react'

export function ValueSection() {
    const sessions = [
        { title: 'Stillness is Key', date: 'Jan 12' },
        { title: 'The Antidote to Chaos', date: 'Jan 10' },
        { title: 'Systems over Goals', date: 'Jan 08' }
    ]

    return (
        <section className="py-32 px-6 lg:px-10 bg-rice-paper">
            <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row gap-16 items-center">
                <div className="lg:w-1/2 space-y-4 w-full">
                    {sessions.map((s, i) => (
                        <div key={i} className="ink-card !p-4 flex items-center gap-4">
                            <BookOpen size={18} className="text-seal-rust" />
                            <div className="flex-1">
                                <p className="font-bold text-sumi-ink">{s.title}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-sumi-ink/40">{s.date}</p>
                            </div>
                        </div>
                    ))}

                </div>
                <div className="lg:w-1/2 space-y-6">
                    <h2 className="text-4xl font-serif font-bold text-sumi-ink">Your Personal Archive.</h2>
                    <p className="text-lg text-sumi-ink/60 leading-relaxed">
                        Each reflection is saved.

                        Over weeks and months, they form a quiet archive — a record of the ideas that shaped your thinking.
                    </p>
                </div>
            </div>
        </section>
    )
}