'use client'

import { Quote } from 'lucide-react'

export function TestimonialsSection() {
    const quotes = [
        { name: "S. Pressfield", text: "The only app that actually makes me want to finish the book." },
        { name: "A. Dillard", text: "A sanctuary for thoughts that usually get lost in the noise." },
        { name: "M. Aurelius", text: "Quiet, authoritative, and essential for the modern reader." }
    ]

    return (
        <section id="testimonials" className="py-24 px-6 lg:px-10 bg-rice-paper">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl font-serif font-bold text-center mb-16">What stays with them</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {quotes.map((q, i) => (
                        <div key={i} className="p-10 bg-white rounded-[2.5rem] shadow-sm border border-sumi-ink/5 relative">
                            <Quote className="text-deep-moss/20 absolute top-8 right-8" size={32} />
                            <p className="text-lg italic text-sumi-ink/80 mb-6 leading-relaxed">&ldquo;{q.text}&rdquo;</p>
                            <p className="text-xs font-bold text-deep-moss uppercase tracking-widest">{q.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}