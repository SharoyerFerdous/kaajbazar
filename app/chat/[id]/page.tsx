'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ChatWindow from '@/components/ChatWindow';

/**
 * /chat/[id] — Standalone full-page chat for an application conversation.
 * The [id] is the application ID, which maps to /api/messages/[id].
 */
export default function ChatPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-24 sm:pb-8">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 bn mb-4"
      >
        ← Dashboard
      </Link>

      {/* Full-page chat window */}
      <ChatWindow
        appId={id}
        apiBase="/api/messages"
      />
    </div>
  );
}
