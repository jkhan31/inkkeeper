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
      className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex justify-between items-start gap-4 mb-2">
        <h3 className="text-lg font-semibold text-gray-900 leading-tight">
          {session.book_title}
        </h3>
        <span className="text-sm text-gray-500 whitespace-nowrap">
          {formatDate(session.created_at)}
        </span>
      </div>
      {session.main_reflection && (
        <p className="text-gray-600 line-clamp-2">
          {session.main_reflection}
        </p>
      )}
    </Link>
  );
}
