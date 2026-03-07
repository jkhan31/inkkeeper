import { createClient } from '../../../lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface PageProps {
    params: Promise<{ id: string }>
}

/**
 * Session Detail Page — "The Quiet Library" (Detail View)
 * 
 * Hierarchy:
 * 1. Reflection Text (Hero: Serif, large)
 * 2. Visual Break (Hairline divider)
 * 3. Metadata Row (Book Title • Date • Duration)
 * 4. Additional Notes (Body text)
 */
export default async function SessionDetail({ params }: PageProps) {
    const { id } = await params
    const supabase = await createClient()

    const { data: session, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !session) {
        notFound()
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
    }

    return (
        <main className="flex min-h-screen flex-col items-center bg-[#FAF5F0] text-[#1A1A1A] pt-12 pb-16 px-6">
            <div className="w-full max-w-2xl flex flex-col gap-12">
                {/* Navigation */}
                <div className="w-full">
                    <Link
                        href="/archive"
                        className="inline-flex items-center text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors font-sans text-sm tracking-wide"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Archive
                    </Link>
                </div>

                {/* The Detail Card */}
                <div className="bg-white border border-[#1A1A1A]/10 rounded-[2rem] p-12 shadow-sm">
                    {/* 1. Reflection Text: The Hero */}
                    <h1 className="text-3xl md:text-4xl font-serif text-[#1A1A1A] leading-relaxed mb-12">
                        {session.main_reflection}
                    </h1>

                    {/* 2. Visual Break: Subtle hairline divider */}
                    <hr className="border-[#1A1A1A]/10 my-12" />

                    {/* 3. Metadata Row */}
                    <div className="flex items-center flex-wrap gap-3 text-xs font-sans text-[#1A1A1A]/40 tracking-widest uppercase mb-12">
                        <span className="text-[#1A1A1A]/60">{session.book_title || 'Untitled Source'}</span>
                        <span>•</span>
                        <span>{formatDate(session.created_at)}</span>
                        {session.duration_minutes !== undefined && (
                            <>
                                <span>•</span>
                                <span>{session.duration_minutes}m</span>
                            </>
                        )}
                    </div>

                    {/* 4. Additional Content */}
                    {session.additional_notes && (
                        <div className="prose prose-sm font-sans text-[#1A1A1A]/70 leading-relaxed max-w-none">
                            <p className="whitespace-pre-wrap">{session.additional_notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
