'use client';

import { useState } from 'react';

interface SessionCardProps {
  session: {
    id: string;
    created_at: string;
    book_title: string;
    main_reflection: string;
    duration_minutes?: number;
  };
}

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
      className="block bg-white border border-[#1A1A1A]/5 rounded-[2rem] p-5 hover:border-[#1A1A1A]/10 transition-all cursor-pointer overflow-hidden"
    >
      <div className="flex justify-between items-start gap-4 mb-2">
        <h3 className="text-lg font-semibold text-[#1A1A1A] leading-tight tracking-tight">
          {session.book_title}
        </h3>
        <span className="text-sm text-[#1A1A1A]/40 whitespace-nowrap">
          {formatDate(session.created_at)}
        </span>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-60'
          }`}
      >
        <div className="overflow-hidden">
          <p className={`text-[#1A1A1A]/80 leading-relaxed ${!isExpanded && 'line-clamp-2'}`}>
            {session.main_reflection}
          </p>
          {isExpanded && session.duration_minutes && (
            <p className="mt-4 text-xs font-medium text-[#1A1A1A]/40 uppercase tracking-widest">
              {session.duration_minutes} minutes
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
