'use client';

import { useState, useRef, useEffect } from 'react';
import { useLayoutContext } from '@/context/LayoutContext';
import { ChatMessage } from './chat/ChatMessage';
import { ChatInput } from './chat/ChatInput';
import { useChatLogic } from '@/hooks/useChatLogic';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { X, VolumeX, Sparkles } from 'lucide-react';

export default function AIAssistant() {
    const { isChatbotOpen: isOpen, setChatbotOpen: setIsOpen } = useLayoutContext();
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages, isSending, sendMessage } = useChatLogic();
    const { isPlayingAudio, speakResponse, stopAudio, cleanTextForTTS } = useTextToSpeech();

    // Configurar reconocimiento de voz
    const { isListening, toggleListening } = useSpeechRecognition((text) => {
        setInputText(text);
        // Opcional: auto-enviar si se desea
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async () => {
        if (!inputText.trim() || isSending) return;
        const textToSend = inputText;
        setInputText(''); // Limpiar input inmediato

        const response = await sendMessage(textToSend);

        // Si hay respuesta y no hay error, leerla (opcional)
        if (response) {
            speakResponse(cleanTextForTTS(response));
        }
    };

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="absolute bottom-6 right-6 z-50 transition-transform duration-300 hover:scale-110 hover:rotate-12 focus:outline-none"
                    aria-label="Abrir Asistente IA"
                >
                    <div className="relative group">
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>

                        {/* Gemini Star Icon */}
                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl hover:scale-110 transition-transform duration-300">
                            <defs>
                                <linearGradient id="gemini-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#4f46e5" /> {/* Indigo-600 */}
                                    <stop offset="50%" stopColor="#2563eb" /> {/* Blue-600 */}
                                    <stop offset="100%" stopColor="#3b82f6" /> {/* Blue-500 */}
                                </linearGradient>
                            </defs>
                            <path
                                d="M12 2C12 2 13.5 8.5 20 11C21.5 11.5 21.5 12.5 20 13C13.5 15.5 12 22 12 22C12 22 10.5 15.5 4 13C2.5 12.5 2.5 11.5 4 11C10.5 8.5 12 2 12 2Z"
                                fill="url(#gemini-gradient)"
                            />
                        </svg>
                    </div>
                </button>
            )}

            {/* Chat Modal */}
            {isOpen && (
                <div className="absolute top-4 right-4 z-50 w-full max-w-xs h-[calc(100%-2rem)] bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300">
                    <div className="flex flex-col h-full pointer-events-none">

                        {/* Floating Controls */}
                        <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
                            {isPlayingAudio && (
                                <button
                                    onClick={stopAudio}
                                    className="bg-white/80 backdrop-blur-md p-2 rounded-full shadow-sm hover:bg-white text-slate-500 hover:text-red-500 transition-all pointer-events-auto"
                                    aria-label="Detener audio"
                                >
                                    <VolumeX className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="bg-white/80 backdrop-blur-md p-2 rounded-full shadow-sm hover:bg-white text-slate-500 hover:text-slate-800 transition-all pointer-events-auto"
                                aria-label="Cerrar chat"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages Container */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-white/40 pointer-events-auto">
                            {messages.map((message, index) => (
                                <ChatMessage key={index} message={message} />
                            ))}

                            <div ref={messagesEndRef} />
                        </div>

                        <ChatInput
                            inputText={inputText}
                            setInputText={setInputText}
                            onSendMessage={handleSendMessage}
                            onToggleVoice={toggleListening}
                            isListening={isListening}
                            isSending={isSending}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
