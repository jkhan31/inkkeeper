'use client'

import { X, Check } from 'lucide-react'

export function DifferentiationSection() {
    const notItems = ["Gamified streaks", "Public feeds", "AI recommendations", "Clickbait distractions"]

    return (
        <section className="py-24 px-6 lg:px-10 bg-white/50">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl font-serif font-bold text-center mb-16">InkKeeper is a different kind of tool.</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="p-10 bg-rice-paper rounded-[2.5rem] border border-sumi-ink/5">
                        <div className="flex items-center gap-2 mb-6">
                            <X size={18} className="text-muted-sage" />
                            <span className="text-xs font-bold text-muted-sage uppercase tracking-widest">InkKeeper is not</span>
                        </div>
                        <ul className="space-y-4">
                            {notItems.map((item, i) => (
                                <li key={i} className="text-sumi-ink/60 font-medium">{item}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="p-10 bg-white rounded-[2.5rem] border-2 border-deep-moss/10 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <Check size={18} className="text-deep-moss" />
                            <span className="text-xs font-bold text-deep-moss uppercase tracking-widest">InkKeeper is</span>
                        </div>
                        <p className="text-xl font-serif text-sumi-ink leading-relaxed">
                            A professional tool for intentional readers who care more about mastery than speed.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}