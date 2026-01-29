import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Sparkles, Bot } from 'lucide-react';

export interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ChatMessageProps {
    message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
    const isUser = message.role === 'user';

    return (
        <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-6 group`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${isUser
                ? 'bg-blue-600 text-white'
                : 'bg-transparent'
                }`}>
                {isUser ? <User className="w-5 h-5" /> : <Sparkles className="w-6 h-6 text-blue-500 fill-blue-500" />}
            </div>

            {/* Message Bubble */}
            <div className={`relative max-w-[85%] ${isUser
                ? 'px-5 py-3.5 bg-gray-100 text-gray-900 rounded-3xl rounded-tr-sm'
                : 'px-0 py-1 bg-transparent text-gray-800' // Bot: Transparent, no padding/bubble
                }`}>
                <div className={`text-[15px] leading-relaxed ${isUser ? 'text-gray-900 font-medium' : 'text-gray-800'}`}>
                    {isUser ? (
                        <p>{message.content}</p>
                    ) : (
                        <div className="prose prose-sm max-w-none prose-p:text-gray-800 prose-p:leading-relaxed prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2 prose-strong:text-red-600 prose-strong:font-bold prose-strong:bg-red-50 prose-strong:px-1 prose-strong:rounded prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:rounded prose-ul:list-none prose-li:my-1">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="my-2 space-y-1 list-disc list-inside marker:text-blue-500" {...props} />,
                                    ol: ({ node, ...props }) => <ol className="my-2 space-y-1 list-decimal list-inside marker:text-blue-500" {...props} />,
                                    li: ({ node, ...props }) => <li className="" {...props} />,
                                    // Custom components for cleaner rendering
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                {/* Timestamp */}
                <span className={`text-[10px] absolute -bottom-5 ${isUser ? 'right-0 text-gray-400' : 'left-0 text-gray-400'
                    } opacity-0 group-hover:opacity-100 transition-opacity`}>
                    {message.timestamp.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </span>
            </div>
        </div>
    );
};
