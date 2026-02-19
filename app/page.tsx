import SessionCard from '@/components/SessionCard';

export default function Home() {
  // Assume sessions array exists
  const sessions: Array<{
    id: string;
    created_at: string;
    book_title: string;
    main_reflection: string;
  }> = [];

  const recentSessions = sessions
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-[#FAF5F0] text-[#1A1A1A] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Recent Sessions</h1>
        <div className="space-y-4">
          {recentSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      </div>
    </main>
  );
}