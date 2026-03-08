'use client'

import Link from 'next/link'

export function ClosingCTASection() {
    return (
        <section className="py-24 bg-rice-paper border-t border-sumi-ink/5">
            <div className="max-w-3xl mx-auto px-6">
                <h2 className="text-3xl lg:text-4xl font-serif font-bold text-sumi-ink leading-tight mb-6">
                    Start building your personal archive.
                </h2>
                <div className="space-y-4 text-lg text-sumi-ink/70 leading-relaxed mb-10">
                    <p>InkKeeper is currently in early access.</p>
                    <p>Join the first readers building a personal archive of ideas from their reading.</p>
                </div>
                <Link href="/login" className="btn-primary">
                    Join Early Access
                </Link>
            </div>
        </section>
    )
}
