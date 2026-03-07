'use client'

import Link from 'next/link'
import { Check, Sparkles } from 'lucide-react'

export function PricingSection() {
    return (
        <section id="pricing" className="py-32 px-6 lg:px-10 bg-rice-paper border-t border-sumi-ink/5">
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-4xl font-serif font-bold mb-12 text-sumi-ink">Fair & Transparent</h2>
                <div className="ink-card !p-12 border-2 border-seal-rust/20 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-seal-rust" />
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <h3 className="text-2xl font-bold text-sumi-ink">The Pro Archive</h3>
                        <Sparkles size={20} className="text-seal-rust" />
                    </div>
                    <div className="text-5xl font-serif font-bold text-sumi-ink mb-8">$8<span className="text-xl text-sumi-ink/40 font-sans">/mo</span></div>
                    <ul className="text-left space-y-4 mb-10 max-w-xs mx-auto">
                        <li className="flex items-center gap-3 text-sumi-ink/80"><Check size={18} className="text-seal-rust" /> Unlimited Sessions</li>
                        <li className="flex items-center gap-3 text-sumi-ink/80"><Check size={18} className="text-seal-rust" /> Personal Analytics</li>
                        <li className="flex items-center gap-3 text-sumi-ink/80"><Check size={18} className="text-seal-rust" /> Global Search & Markdown Export</li>
                    </ul>
                    <Link href="/login" className="btn-primary w-full !py-4 text-lg">
                        Enter the Archive
                    </Link>
                </div>

            </div>
        </section>
    )
}