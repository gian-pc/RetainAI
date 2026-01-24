'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Mic, MicOff, Send, Loader2, Volume2, VolumeX } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: '¡Hola! Soy tu asistente de RetainAI. Puedo ayudarte a entender tus datos de churn, explicar predicciones y recomendar acciones de retención. ¿En qué puedo ayudarte?',
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [speechRecognition, setSpeechRecognition] = useState<any>(null);
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.lang = 'es-ES';
                recognition.continuous = false;
                recognition.interimResults = false;

                recognition.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    setInputText(transcript);
                    setIsListening(false);
                };

                recognition.onerror = (event: any) => {
                    console.error('Speech recognition error:', event.error);
                    setIsListening(false);
                };

                recognition.onend = () => {
                    setIsListening(false);
                };

                setSpeechRecognition(recognition);
            }
        }
    }, []);

    // Función para limpiar texto antes de TTS (quitar tablas, símbolos raros)
    const cleanTextForTTS = (text: string): string => {
        console.log('🗣️ [TTS DEBUG] Texto original:', text);
        const cleaned = text
            // Quitar líneas que PARECEN headers de tabla o listas técnicas (ej: "ID Cliente: 123" o "| ID | Nombre |")
            .replace(/^[\s\-]*\|?[\s\-]*(ID\s+Cliente|Riesgo|Probabilidad|Ingreso|Mensual|Razón)(\s*[:\|]|\s+).*/gim, '')
            .replace(/.*\|.*\|.*/g, '') // Quitar filas de tablas markdown
            // Quitar separadores de tabla
            .replace(/[\-]{3,}/g, '')
            .replace(/\b\d{4}-[A-Z]{5,6}\b/g, 'un cliente')
            // Quitar porcentajes duplicados
            .replace(/\((\d+)%\)/g, '$1 por ciento')
            // Reemplazar saltos de línea con pausas naturales
            .replace(/\n+/g, '. ')
            // Quitar múltiples espacios
            .replace(/\s+/g, ' ')
            // Quitar múltiples puntos
            .replace(/\.{2,}/g, '.')
            .trim();

        console.log('🗣️ [TTS DEBUG] Texto limpio:', cleaned);
        console.log('🗣️ [TTS DEBUG] Longitud:', cleaned.length);
        return cleaned;
    };

    // 🗺️ Detectar boroughs/ubicaciones y IDs de clientes para filtrar el mapa
    const detectContextAndFilterMap = (text: string) => {
        // 1. Detectar Ubicaciones (Boroughs de NYC)
        const locations = [
            'Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'
        ];

        const foundLocations = locations.filter(location =>
            text.includes(location) || text.toLowerCase().includes(location.toLowerCase())
        );

        // 2. Detectar IDs de Clientes (Formato ej: 11483-069BB)
        // Regex busca: 3-6 dígitos, un guion, y 4-6 caracteres alfanuméricos
        const idRegex = /\b\d{3,6}-[A-Z0-9]{4,6}\b/g;
        const foundIds = text.match(idRegex) || [];

        console.log('🔍 [MAP DEBUG] Contexto detectado:', { locations: foundLocations, ids: foundIds });

        if (foundLocations.length > 0 || foundIds.length > 0) {
            console.log('📡 Emitiendo evento filterMapByContext...');

            // Emitir evento con ubicaciones e IDs
            const event = new CustomEvent('filterMapByContext', {
                detail: {
                    locations: foundLocations,
                    customerIds: foundIds
                }
            });
            window.dispatchEvent(event);
        }
    };

    const handleSendMessage = async () => {
        if (!inputText.trim() || isSending) return;

        const userMessage: Message = {
            role: 'user',
            content: inputText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        const userQuery = inputText;
        setInputText('');
        setIsSending(true);

        // Crear mensaje vacío del asistente que se irá llenando
        const assistantMessage: Message = {
            role: 'assistant',
            content: '',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);

        try {
            // Usar nuevo endpoint de chatbot con Text-to-SQL
            const response = await fetch('http://localhost:8080/api/chatbot/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userQuery,
                    conversationHistory: messages.map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                })
            });

            if (!response.ok) {
                throw new Error('Error al comunicarse con el asistente');
            }

            const data = await response.json();
            const fullResponse = data.message || 'Lo siento, no pude procesar tu solicitud.';

            console.log('🤖 Respuesta del chatbot:', data);

            // Actualizar el último mensaje con la respuesta completa
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                    ...newMessages[newMessages.length - 1],
                    content: fullResponse
                };
                return newMessages;
            });

            setIsSending(false);

            // 🗺️ Si hay metadata, emitir evento para actualizar el mapa
            if (data.metadata) {
                console.log('📍 Emitiendo evento para actualizar mapa:', data.metadata);

                const event = new CustomEvent('chatbot-map-update', {
                    detail: data.metadata
                });
                window.dispatchEvent(event);
            }

            // Reproducir audio limpio (sin tablas/símbolos)
            // const cleanText = cleanTextForTTS(fullResponse);
            // speakResponse(cleanText);

        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                    ...newMessages[newMessages.length - 1],
                    content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.'
                };
                return newMessages;
            });
            setIsSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const toggleVoiceInput = () => {
        if (!speechRecognition) {
            alert('Lo siento, tu navegador no soporta reconocimiento de voz. Por favor usa Chrome o Edge.');
            return;
        }

        if (isListening) {
            speechRecognition.stop();
            setIsListening(false);
        } else {
            speechRecognition.start();
            setIsListening(true);
        }
    };

    // Detener audio actual
    const stopAudio = () => {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            setCurrentAudio(null);
            setIsPlayingAudio(false);
        }
    };

    // Text-to-Speech function using ElevenLabs for natural audio
    const speakResponse = async (text: string) => {
        try {
            // Detener audio anterior si existe
            stopAudio();

            const response = await fetch('http://localhost:8080/api/tts/synthesize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text })
            });

            if (!response.ok) {
                const errorText = await response.text(); // Leer el mensaje de error del backend
                console.error('Error al generar audio (status):', response.statusText);
                console.error('Error al generar audio (body):', errorText);

                // Mostrar alerta descriptiva al usuario
                if (errorText.includes("401") || errorText.includes("Unauthorized")) {
                    alert("⚠️ Error de Audio: API Key de ElevenLabs inválida o expirada. Revisa tu archivo .env");
                } else if (errorText.includes("429") || errorText.includes("Quota")) {
                    alert("⚠️ Error de Audio: Se agotaron los créditos gratuitos de ElevenLabs.");
                } else {
                    // Decodificar el mensaje si viene como bytes/texto bruto
                    alert(`⚠️ No se pudo generar el audio.\nDetalle: ${errorText}`);
                }
                return;
            }

            // Obtener el audio como blob
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            // Reproducir el audio
            const audio = new Audio(audioUrl);
            setCurrentAudio(audio);
            setIsPlayingAudio(true);

            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                setIsPlayingAudio(false);
                setCurrentAudio(null);
            };

            audio.onerror = () => {
                setIsPlayingAudio(false);
                setCurrentAudio(null);
            };

            audio.play();
        } catch (error) {
            console.error('Error al reproducir audio de ElevenLabs:', error);
            setIsPlayingAudio(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-110 max-w-fit"
                    aria-label="Abrir Asistente IA"
                    style={{ marginBottom: '0', marginRight: '0' }}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🎙️</span>
                        <span className="font-medium hidden sm:block">Asistente IA</span>
                    </div>
                </button>
            )}

            {/* Chat Modal */}
            {isOpen && (
                <div className="fixed bottom-4 right-4 z-50 w-full max-w-md" style={{ marginBottom: '0', marginRight: '0' }}>
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col h-[600px]">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🤖</span>
                                <div>
                                    <h3 className="font-bold text-lg">Asistente RetainAI</h3>
                                    <p className="text-xs text-purple-100">Potenciado por IA</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {isPlayingAudio && (
                                    <button
                                        onClick={stopAudio}
                                        className="hover:bg-white/20 p-2 rounded-lg transition-colors"
                                        aria-label="Detener audio"
                                        title="Detener audio"
                                    >
                                        <VolumeX className="h-5 w-5" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="hover:bg-white/20 p-2 rounded-lg transition-colors"
                                    aria-label="Cerrar"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Container */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white border border-gray-200 text-gray-900'
                                            }`}
                                    >
                                        {message.role === 'assistant' ? (
                                            <div className="text-sm space-y-3 break-words overflow-wrap-anywhere">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        h1: ({ node, ...props }) => <div className="flex items-center gap-2 font-bold text-base text-purple-700 mb-2" {...props} />,
                                                        h2: ({ node, ...props }) => <div className="flex items-center gap-2 font-bold text-sm text-gray-800 mb-1 mt-2" {...props} />,
                                                        strong: ({ node, ...props }) => <span className="font-bold text-blue-600" {...props} />,
                                                        p: ({ node, ...props }) => <p className="text-gray-700 leading-relaxed" {...props} />,
                                                        ul: ({ node, ...props }) => <ul className="space-y-1 ml-2" {...props} />,
                                                        li: ({ node, ...props }) => <li className="text-gray-700 flex items-start gap-2" {...props} />,
                                                        table: () => null,
                                                        thead: () => null,
                                                        tbody: () => null,
                                                        tr: () => null,
                                                        td: () => null,
                                                        th: () => null,
                                                    }}
                                                >
                                                    {message.content}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            <p className="text-sm break-words">{message.content}</p>
                                        )}
                                        <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                                            }`}>
                                            {message.timestamp.toLocaleTimeString('es-ES', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
                            <div className="flex items-end gap-2">
                                <button
                                    onClick={toggleVoiceInput}
                                    className={`p-3 rounded-lg transition-colors ${isListening
                                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                                    placeholder="Escribe tu mensaje o usa el micrófono..."
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
                                    rows={1}
                                    disabled={isSending}
                                />

                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputText.trim() || isSending}
                                    className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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
                                <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                                    <div className="animate-pulse h-2 w-2 bg-red-600 rounded-full"></div>
                                    <span>Escuchando...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
