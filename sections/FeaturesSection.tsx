'use client'

import { Timer, MessageSquare, Archive, BarChart3 } from 'lucide-react'

export function FeaturesSection() {
    const features = [
        { title: 'Reading Session', icon: Timer, desc: 'Start a timer when you begin reading. Mark the moment. Be present.' },
        { title: 'Quick Capture', icon: MessageSquare, desc: 'Capture a reflection anytime, without starting a session.' },
        { title: 'Personal Archive', icon: Archive, desc: 'Every reflection is saved. Searchable. Yours.' },
        { title: 'Rediscovery', icon: BarChart3, desc: 'Old reflections surface again. See what you were thinking months ago.' }
    ]

    return (
        <section id="features" className="py-32 px-6 lg:px-10 bg-rice-paper border-y border-sumi-ink/5">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((f, i) => (
                        <div key={i} className="ink-card !p-8">
                            <f.icon className="text-seal-rust mb-4" size={24} />
                            <h3 className="font-bold text-sumi-ink mb-2">{f.title}</h3>
                            <p className="text-sm text-sumi-ink/60 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}

                </div>
            </div>
        </section>
    )
}