'use client'

export function DifferentiationSection() {
    const entries = [
        {
            idea: 'Systems matter more than motivation.',
            book: 'Atomic Habits',
            date: 'Mar 8',
            note: 'Small improvements compound because systems repeat daily.',
        },
        {
            idea: 'Curiosity makes difficult work easier to sustain.',
            book: 'Feel-Good Productivity',
            date: 'Mar 7',
            note: 'When work feels good, motivation becomes sustainable.',
        },
        {
            idea: 'Instead of trying to choose the perfect life, design several possible lives and experiment.',
            book: 'Designing Your Life',
            date: 'Mar 6',
            note: 'Treat life like a prototype instead of a fixed decision.',
        },
    ]

    return (
        <section id="archive" className="py-24 bg-rice-paper border-t border-sumi-ink/5">
            <div className="max-w-3xl mx-auto px-6">
                <h2 className="text-3xl lg:text-4xl font-serif font-bold text-sumi-ink leading-tight mb-6">
                    Your personal archive of ideas.
                </h2>
                <div className="space-y-4 text-lg text-sumi-ink/70 leading-relaxed mb-12">
                    <p>Each reflection becomes part of a growing archive.</p>
                    <p>Not highlights.</p>
                    <p>Not notes.</p>
                    <p>Ideas — written in your own words.</p>
                    <p>Over time your archive becomes a record of the ideas that shaped your thinking.</p>
                </div>

                {/* Archive placeholder */}
                <div className="rounded-3xl bg-white/60 border border-sumi-ink/10 shadow-sm p-6 font-sans space-y-5">
                    {entries.map((entry, i) => (
                        <div key={i} className="border-b border-sumi-ink/5 pb-5 last:border-0 last:pb-0">
                            <p className="font-serif text-sumi-ink text-base leading-snug mb-1">{entry.idea}</p>
                            <p className="text-[11px] text-sumi-ink/40 mb-2">{entry.book} · {entry.date}</p>
                            {entry.note && (
                                <p className="text-sm text-sumi-ink/50 italic leading-relaxed">{entry.note}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
