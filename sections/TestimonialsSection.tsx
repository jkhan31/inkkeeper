'use client'

import { Quote } from 'lucide-react'

export function TestimonialsSection() {
    const quotes = [
        { name: "S. Pressfield", text: "The only app that actually makes me want to finish the book.", source: "Author" },
        { name: "A. Dillard", text: "A sanctuary for thoughts that usually get lost in the noise.", source: "Reader" },
        { name: "M. Aurelius", text: "Quiet, authoritative, and essential for the modern reader.", source: "Statesman" }
    ]

    return (
        <section id="testimonials" className="py-32 px-6 lg:px-10 bg-rice-paper">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl font-serif font-bold text-center mb-16 text-sumi-ink">What stays with them</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {quotes.map((q, i) => (
                        <div key={i} className="p-8 bg-white/40 backdrop-blur-sm rounded-[2rem] border border-sumi-ink/5 shadow-sm flex flex-col justify-between">
                            <h3 className="text-xl font-serif text-sumi-ink leading-relaxed italic mb-6">
                                "{q.text}"
                            </h3>

                            <div>
                                <hr className="border-sumi-ink/5 mb-6" />
                                <div className="flex items-center gap-2 text-[10px] font-sans text-sumi-ink/40 tracking-widest uppercase font-bold">
                                    <span className="text-seal-rust">{q.name}</span>
                                    <span>•</span>
                                    <span>{q.source}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}