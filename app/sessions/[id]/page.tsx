import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SessionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return <div>No authenticated user</div>;
  }

  // Fetch session
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (sessionError || !session) {
    return <div>Session not found</div>;
  }

  // Format date like SessionCard: "18 Jan 2026"
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Format duration: "x hours y minutes"
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
      return `${mins} minute${mins !== 1 ? 's' : ''}`;
    }
    if (mins === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`;
  };

  return (
    <main className="min-h-screen bg-[#FAF5F0] text-[#1A1A1A]">
      <div className="max-w-xl mx-auto px-6 py-12">
        {/* Back button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center text-[#1A1A1A]/50 hover:text-[#1A1A1A] mb-12 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </Link>

        {/* 1. Reflection Text: The Hero */}
        <div className="mb-12">
          <h1 className="text-3xl font-serif italic text-[#1A1A1A] leading-relaxed">
            "{session.main_reflection}"
          </h1>
        </div>

        {/* 2. Additional Notes */}
        {session.additional_notes && (
          <div className="mb-12 pt-8 border-t border-[#1A1A1A]/5">
            <h2 className="text-[10px] font-sans text-[#1A1A1A]/40 uppercase tracking-[0.2em] mb-4">Context & Notes</h2>
            <p className="text-[#1A1A1A]/80 whitespace-pre-wrap leading-relaxed font-sans text-sm">
              {session.additional_notes}
            </p>
          </div>
        )}

        {/* 3. Visual Break: Subtle hairline divider */}
        <hr className="border-[#1A1A1A]/5 my-8" />

        {/* 4. Metadata Row: Book Title • Date • Duration */}
        <div className="flex items-center flex-wrap gap-3 text-[11px] font-sans text-[#1A1A1A]/40 tracking-[0.1em] uppercase">
          <span className="font-bold text-[#1A1A1A]/70">{session.book_title}</span>
          <span>•</span>
          <span>{formatDate(session.created_at)}</span>
          {session.duration_minutes && (
            <>
              <span>•</span>
              <span>{session.duration_minutes}m Reading Session</span>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

