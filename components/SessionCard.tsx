'use client';

import { useState } from 'react';

interface SessionCardProps {
  session: {
    id: string;
    created_at: string;
    book_title: string | null;
    main_reflection: string;
    duration_minutes?: number | null;
    additional_notes?: string | null;
  };
}

/**
 * SessionCard — Expandable Activity UI
 * 
 * Hierarchy:
 * 1. Reflection Text (Hero: Serif, large)
 * 2. Visual Break (Hairline divider)
 * 3. Metadata Row (Book Title • Date • Duration)
 * 4. Expansion: Reveals full text and additional notes.
 */
export default function SessionCard({ session }: SessionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className="ink-card !bg-white/60 p-8 cursor-pointer group"
    >
      {/* 1. Reflection Text: The Hero */}
      <h3 className={`text-xl font-serif text-sumi-ink leading-relaxed transition-all duration-300 ${!isExpanded ? 'line-clamp-2' : ''}`}>
        {session.main_reflection}
      </h3>

      {/* Expandable Area: Reveal full thought and notes gracefully */}
      <div
        className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          {session.additional_notes && (
            <div className="mt-6 pt-6 border-t border-sumi-ink/5 text-sm text-sumi-ink/60 font-sans leading-relaxed">
              {session.additional_notes}
            </div>
          )}
        </div>
      </div>

      {/* 2. Visual Break: Subtle hairline divider */}
      <hr className="border-sumi-ink/10 my-6" />

      {/* 3. Metadata Row: Book Title • Date • Duration */}
      <div className="flex items-center flex-wrap gap-2 text-[10px] font-sans text-sumi-ink/40 tracking-widest uppercase">
        <span className="text-sumi-ink/60">{session.book_title || 'Untitled Source'}</span>
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


