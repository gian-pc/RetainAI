import React from 'react';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
    inputText: string;
    setInputText: (text: string) => void;
    onSendMessage: () => void;
    onToggleVoice: () => void;
    isListening: boolean;
    isSending: boolean;
}

export const ChatInput = ({
    inputText,
    setInputText,
    onSendMessage,
    onToggleVoice,
    isListening,
    isSending
}: ChatInputProps) => {

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
        }
    };

    return (
        <div className="p-4 mt-4 bg-white border-t border-gray-100 pointer-events-auto transition-all">
            <div className="flex items-end gap-2">
                <button
                    onClick={onToggleVoice}
                    className={`p-3 rounded-full transition-all duration-300 ${isListening
                        ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 ring-2 ring-red-500/20 animate-pulse'
                        : 'bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                    aria-label={isListening ? 'Detener grabación' : 'Iniciar grabación de voz'}
                >
                    {isListening ? (
                        <MicOff className="h-5 w-5" />
                    ) : (
                        <Mic className="h-5 w-5" />
                    )}
                </button>

                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe aquí..."
                    className="flex-1 px-4 py-3 bg-gray-100 border-0 focus:ring-0 rounded-3xl resize-none text-gray-900 placeholder:text-gray-500 text-sm transition-all focus:bg-gray-200"
                    rows={1}
                    disabled={isSending}
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                />

                <button
                    onClick={onSendMessage}
                    disabled={!inputText.trim() || isSending}
                    className="p-3 rounded-full transition-all duration-300 bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/40 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none transform active:scale-95"
                    aria-label="Enviar mensaje"
                >
                    {isSending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Send className="h-5 w-5" />
                    )}
                </button>
            </div>

            {isListening && (
                <div className="mt-2 flex items-center justify-center gap-2 text-red-500 text-xs font-medium animate-in fade-in slide-in-from-bottom-1">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span>Escuchando...</span>
                </div>
            )}
        </div>
    );
};
