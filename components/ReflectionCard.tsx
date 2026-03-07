'use client';

interface ReflectionCardProps {
    session: {
        id: string;
        created_at: string;
        book_title: string;
        main_reflection: string;
        duration_minutes?: number;
        additional_notes?: string;
    };
}

/**
 * ReflectionCard — Unified "Idea-First" UI
 * 
 * Hierarchy:
 * 1. Reflection Text (Hero: Serif, large)
 * 2. Visual Break (Hairline divider)
 * 3. Metadata Row (Book Title • Date • Duration)
 */
export default function ReflectionCard({ session }: ReflectionCardProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="block bg-white border border-[#1A1A1A]/5 rounded-[2rem] p-8 shadow-sm">
            {/* 1. Reflection Text: The Hero */}
            <h3 className="text-xl font-serif text-[#1A1A1A] leading-relaxed italic">
                "{session.main_reflection}"
            </h3>


            {/* 2. Visual Break: Subtle hairline divider */}
            <hr className="border-[#1A1A1A]/5 my-6" />

            {/* 3. Metadata Row: Book Title • Date • Duration */}
            <div className="flex items-center flex-wrap gap-2 text-[10px] font-sans text-[#1A1A1A]/40 tracking-widest uppercase">
                <span className="font-semibold text-[#1A1A1A]/60">{session.book_title}</span>
                <span>•</span>
                <span>{formatDate(session.created_at)}</span>
                {session.duration_minutes && (
                    <>
                        <span>•</span>
                        <span>{session.duration_minutes}m</span>
                    </>
                )}
            </div>
        </div>
    );
}

