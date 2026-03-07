'use client'

import { X, Check } from 'lucide-react'

export function DifferentiationSection() {
    const notItems = ["Gamified streaks", "Public feeds", "AI recommendations", "Clickbait distractions"]

    return (
        <section className="py-32 px-6 lg:px-10 bg-rice-paper">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl font-serif font-bold text-center mb-16 text-sumi-ink">InkKeeper is a different kind of tool.</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="p-10 bg-white/40 backdrop-blur-sm rounded-[2rem] border border-sumi-ink/5">
                        <div className="flex items-center gap-2 mb-6">
                            <X size={18} className="text-sumi-ink/30" />
                            <span className="text-xs font-bold text-sumi-ink/40 uppercase tracking-widest">InkKeeper is not</span>
                        </div>
                        <ul className="space-y-4">
                            {notItems.map((item, i) => (
                                <li key={i} className="text-sumi-ink/60 font-medium">{item}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="p-10 bg-white/40 backdrop-blur-sm rounded-[2rem] border-2 border-seal-rust/10 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <Check size={18} className="text-seal-rust" />
                            <span className="text-xs font-bold text-seal-rust uppercase tracking-widest">InkKeeper is</span>
                        </div>
                        <p className="text-xl font-serif text-sumi-ink leading-relaxed italic">
                            A professional tool for intentional readers who care more about mastery than speed.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}