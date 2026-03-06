'use client'

import Link from 'next/link'

export function ClosingCTASection() {
    return (
        <section className="py-24 px-6 bg-rice-paper-deep text-center border-t border-sumi-ink/5">
            <div className="max-w-2xl mx-auto">
                <h2 className="text-4xl font-serif font-bold text-sumi-ink mb-6">Keep what matters.</h2>
                <p className="text-lg text-sumi-ink/60 mb-10 leading-relaxed">
                    The ideas you encounter today don&apos;t have to vanish by tomorrow.
                </p>
                <Link href="/login" className="inline-block bg-sumi-ink text-rice-paper px-10 py-4 rounded-full font-bold hover:opacity-90 transition-all">
                    Start a session
                </Link>
            </div>
        </section>
    )
}