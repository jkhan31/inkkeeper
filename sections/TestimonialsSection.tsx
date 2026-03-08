'use client'

import { Quote } from 'lucide-react'

export function TestimonialsSection() {
    const quotes = [
        { name: "R. Hughes", text: "I used to read a lot and remember almost nothing. This changed that.", source: "Reader" },
        { name: "L. Park", text: "One question after every read. It sounds small. It isn't.", source: "Reader" },
        { name: "M. Chen", text: "My archive is a year old now. I find things I completely forgot I thought.", source: "Reader" }
    ]

    return (
        <section id="testimonials" className="py-32 px-6 lg:px-10 bg-rice-paper">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl font-serif font-bold text-center mb-16 text-sumi-ink">What stayed with them</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {quotes.map((q, i) => (
                        <div key={i} className="p-8 bg-white/40 backdrop-blur-sm rounded-[2rem] border border-sumi-ink/5 shadow-sm flex flex-col justify-between">
                            <h3 className="text-xl font-serif text-sumi-ink leading-relaxed italic mb-6">
                                &ldquo;{q.text}&rdquo;
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