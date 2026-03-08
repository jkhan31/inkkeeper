'use client'

import Link from 'next/link'

interface HeroSectionProps {
    onNavigate: (sectionId: string) => void
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
    return (
        <section className="relative min-h-[85vh] flex flex-col justify-center px-6 lg:px-10 py-24 bg-rice-paper">
            <div className="max-w-7xl mx-auto w-full relative z-10">
                <div className="max-w-3xl ink-card !p-8 lg:!p-12 mb-8">
                    <h1 className="text-5xl lg:text-7xl font-serif font-bold text-sumi-ink leading-[1.1] mb-6">
                        Remember the ideas <br /> that stay <br /> <span className="text-seal-rust">with you.</span>
                    </h1>
                    <p className="text-lg lg:text-xl text-sumi-ink/70 leading-relaxed max-w-xl">
                        InkKeeper helps you capture a short reflection after reading and build a personal archive of ideas from your reading.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 mb-12">
                    <Link href="/login" className="btn-primary text-lg">
                        Join Early Access
                    </Link>
                    <button onClick={() => onNavigate('problem')} className="btn-secondary !text-lg !px-8 !py-4">
                        Learn more
                    </button>
                </div>

                <div className="max-w-2xl rounded-3xl border bg-white/70 shadow-sm aspect-video flex items-center justify-center mt-8">
                    <span className="text-sm text-neutral-500">Dashboard Screenshot</span>
                </div>

            </div>
        </section>
    )
}