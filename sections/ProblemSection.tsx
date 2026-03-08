'use client'

export function ProblemSection() {
    return (
        <section id="problem" className="py-24 bg-rice-paper border-t border-sumi-ink/5">
            <div className="max-w-3xl mx-auto px-6">
                <h2 className="text-3xl lg:text-4xl font-serif font-bold text-sumi-ink leading-tight mb-8">
                    Reading is easy. Remembering is hard.
                </h2>
                <div className="space-y-5 text-lg text-sumi-ink/70 leading-relaxed">
                    <p>You finish a book full of great ideas.</p>
                    <p>A week later, most of them are gone.</p>
                    <p>
                        Not because the ideas weren&apos;t valuable —<br />
                        but because they were never articulated.
                    </p>
                    <p>Most reading tools track progress:</p>
                    <ul className="pl-6 space-y-1 text-sumi-ink/60">
                        <li>• books finished</li>
                        <li>• pages read</li>
                        <li>• highlights saved</li>
                    </ul>
                    <p>But they rarely capture what actually stayed with you.</p>
                </div>
            </div>
        </section>
    )
}