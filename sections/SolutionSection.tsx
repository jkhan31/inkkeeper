'use client'

import { PenLine } from 'lucide-react'

export function SolutionSection() {
    return (
        <section id="solution" className="py-24 px-6 lg:px-10 bg-white/30 border-y border-sumi-ink/5">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
                <div className="lg:w-1/2 bg-rice-paper p-10 rounded-[2.5rem] border border-sumi-ink/5 shadow-inner">
                    <div className="space-y-8">
                        <div className="border-b border-sumi-ink/10 pb-4">
                            <label className="text-xs font-bold text-deep-moss uppercase tracking-widest mb-2 block">What stood out most?</label>
                            <div className="h-4 w-full bg-sumi-ink/5 rounded" />
                        </div>
                        <div className="border-b border-sumi-ink/10 pb-4">
                            <label className="text-xs font-bold text-deep-moss uppercase tracking-widest mb-2 block">Why did it stay with you?</label>
                            <div className="h-20 w-full bg-sumi-ink/5 rounded" />
                        </div>
                    </div>
                </div>
                <div className="lg:w-1/2 space-y-6">
                    <div className="w-12 h-12 bg-deep-moss rounded-2xl flex items-center justify-center mb-6">
                        <PenLine className="text-rice-paper w-6 h-6" />
                    </div>
                    <h2 className="text-4xl font-serif font-bold text-sumi-ink">The Act of Articulation.</h2>
                    <p className="text-lg text-sumi-ink/60 leading-relaxed">
                        By spending just two minutes typing your reflection after a session, you create the cognitive residue required for long-term memory.
                    </p>
                </div>
            </div>
        </section>
    )
}