'use client'

import Link from 'next/link'

export function ClosingCTASection() {
    return (
        <section className="py-24 px-6 bg-rice-paper text-center border-t border-sumi-ink/5">
            <div className="max-w-2xl mx-auto">
                <h2 className="text-4xl font-serif font-bold text-sumi-ink mb-6">Start building your personal archive.</h2>
                <p className="text-lg text-sumi-ink/60 mb-10 leading-relaxed font-sans">
                    Join early access and begin capturing the ideas that matter.
                </p>
                <Link href="/login" className="inline-block bg-seal-rust text-rice-paper px-10 py-4 rounded-full font-bold hover:opacity-90 transition-all">
                    Join Early Access
                </Link>
            </div>
        </section>
    )
}