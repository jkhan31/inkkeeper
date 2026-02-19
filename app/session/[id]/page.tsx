import { notFound } from 'next/navigation';
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
    notFound();
  }

  // Fetch session
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (sessionError || !session) {
    notFound();
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back button */}
      <Link 
        href="/dashboard" 
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <svg 
          className="w-5 h-5 mr-2" 
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

      {/* Date and duration */}
      <div className="mb-4">
        <p className="text-gray-900 mb-1">{formatDate(session.created_at)}</p>
        <p className="text-sm text-gray-500">{formatDuration(session.duration_minutes)}</p>
      </div>

      {/* Book title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {session.book_title}
      </h1>

      {/* Main reflection */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Reflection</h2>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {session.main_reflection}
        </p>
      </div>

      {/* Additional notes (if present) */}
      {session.additional_notes && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Additional Notes</h2>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {session.additional_notes}
          </p>
        </div>
      )}

      {/* Edit button */}
      <div className="pt-6 border-t border-gray-200">
        <Link
          href={`/session/${session.id}/edit`}
          className="inline-block px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Edit
        </Link>
      </div>
    </div>
  );
}
