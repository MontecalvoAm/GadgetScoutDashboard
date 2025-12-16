import React from 'react';
import { useRouter } from 'next/navigation';
import { Conversation } from '@/types';
import { formatConversationDate } from '@/utils/dateFormatter';

interface ConversationCardProps {
  data: Conversation;
  delay: number;
}

export default function ConversationCard({ data, delay }: ConversationCardProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-green-100 text-green-800 ring-1 ring-green-200';
      case 'CLOSED': return 'bg-red-100 text-red-800 ring-1 ring-red-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200';
      default: return 'bg-gray-100 text-gray-800 ring-1 ring-gray-200';
    }
  };

  return (
    <div
      className="p-6 hover:bg-gray-50 transition-all duration-200 cursor-pointer border-l-4 border-transparent hover:border-l-indigo-500 group"
      onClick={() => router.push(`/conversations/${data.ID}`)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {data.CustomerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {data.Subject}
              </h3>
              <p className="text-sm text-gray-600">{data.CustomerName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>{data.CustomerEmail}</span>
            <span>•</span>
            <span>{formatConversationDate(data.CreatedAt)}</span>
          </div>
        </div>

        <div className="ml-4 flex flex-col items-end space-y-2">
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(data.Status)}`}>
            {data.Status}
          </span>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01"/>
            </svg>
            <span>{data.Messages}</span>
          </div>
        </div>
      </div>
    </div>
  );
}