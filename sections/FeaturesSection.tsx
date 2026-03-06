'use client'

import { Timer, MessageSquare, Archive, BarChart3 } from 'lucide-react'

export function FeaturesSection() {
    const features = [
        { title: 'Timed Presence', icon: Timer, desc: 'A calm, count-up timer that honors your reading time.' },
        { title: 'Intentional Prompts', icon: MessageSquare, desc: 'Capture the cognitive residue of every session.' },
        { title: 'Private Archive', icon: Archive, desc: 'A searchable, secure home for your intellectual journey.' },
        { title: 'Mastery Metrics', icon: BarChart3, desc: 'Visualize your retention and reading habits over time.' }
    ]

    return (
        <section id="features" className="py-24 px-6 lg:px-10 bg-rice-paper border-y border-sumi-ink/5">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((f, i) => (
                        <div key={i} className="p-8 bg-white/40 rounded-3xl border border-sumi-ink/5 hover:bg-white transition-all">
                            <f.icon className="text-deep-moss mb-4" size={24} />
                            <h3 className="font-bold text-sumi-ink mb-2">{f.title}</h3>
                            <p className="text-sm text-sumi-ink/60 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}