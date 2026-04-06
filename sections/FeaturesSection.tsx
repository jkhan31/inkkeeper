'use client'

import { Timer, MessageSquare } from 'lucide-react'

export function FeaturesSection() {
    return (
        <section id="features" className="py-20 px-6 lg:px-10 bg-rice-paper border-y border-sumi-ink/5">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl font-serif font-bold text-sumi-ink mb-6">Reflect after reading — your way.</h2>
                <div className="text-lg text-sumi-ink/60 leading-relaxed max-w-2xl mb-12 space-y-3">
                    <p>Readers don&apos;t always read the same way.</p>
                    <p>Sometimes you sit down for a focused session. Sometimes an idea appears unexpectedly.</p>
                    <p>InkKeeper supports both.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                    <div className="ink-card !p-8 space-y-4">
                        <div className="w-10 h-10 bg-seal-rust rounded-xl flex items-center justify-center">
                            <Timer className="text-rice-paper w-5 h-5" />
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-sumi-ink">Reading Session</h3>
                        <div className="text-sumi-ink/60 space-y-2">
                            <p>Start a timer.</p>
                            <p>Read without distraction.</p>
                            <p>Capture the idea when you&apos;re done.</p>
                        </div>
                        <div className="rounded-3xl border bg-white/70 shadow-sm aspect-[9/16] flex items-center justify-center mt-8">
                            <span className="text-sm text-neutral-500">Session Timer</span>
                        </div>
                    </div>

                    <div className="ink-card !p-8 space-y-4">
                        <div className="w-10 h-10 bg-seal-rust rounded-xl flex items-center justify-center">
                            <MessageSquare className="text-rice-paper w-5 h-5" />
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-sumi-ink">Quick Capture</h3>
                        <div className="text-sumi-ink/60 space-y-2">
                            <p>Capture a reflection instantly without starting a session.</p>
                        </div>
                        <div className="rounded-3xl border bg-white/70 shadow-sm aspect-[9/16] flex items-center justify-center mt-8">
                            <span className="text-sm text-neutral-500">Quick Capture Screenshot</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}