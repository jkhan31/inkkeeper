import Link from 'next/link';

interface SessionCardProps {
  session: {
    id: string;
    created_at: string;
    book_title: string;
    main_reflection: string;
  };
}

export default function SessionCard({ session }: SessionCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Link
      href={`/sessions/${session.id}`}
      className="block bg-white border border-[#1A1A1A]/5 rounded-[2rem] p-5 hover:bg-[#FAF5F0] transition-colors"
    >
      <div className="flex justify-between items-start gap-4 mb-2">
        <h3 className="text-lg font-semibold text-[#1A1A1A] leading-tight tracking-tight">
          {session.book_title}
        </h3>
        <span className="text-sm text-[#1A1A1A]/40 whitespace-nowrap">
          {formatDate(session.created_at)}
        </span>
      </div>
      {session.main_reflection && (
        <p className="text-[#1A1A1A]/60 line-clamp-2">
          {session.main_reflection}
        </p>
      )}
    </Link>
  );
}
