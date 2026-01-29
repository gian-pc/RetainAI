import { useState } from 'react';
import { Message } from '@/components/chat/ChatMessage';

export const useChatLogic = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: 'Hola. ¿En qué te ayudo?',
            timestamp: new Date()
        }
    ]);
    const [isSending, setIsSending] = useState(false);

    const detectContextAndFilterMap = (text: string) => {
        const locations = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];
        const foundLocations = locations.filter(location =>
            text.includes(location) || text.toLowerCase().includes(location.toLowerCase())
        );

        const idRegex = /\b\d{3,6}-[A-Z0-9]{4,6}\b/g;
        const foundIds = text.match(idRegex) || [];

        if (foundLocations.length > 0 || foundIds.length > 0) {
            window.dispatchEvent(new CustomEvent('filterMapByContext', {
                detail: { locations: foundLocations, customerIds: foundIds }
            }));
        }
    };

    const sendMessage = async (text: string) => {
        if (!text.trim() || isSending) return null; // Retornamos null si no se envía

        const userMessage: Message = { role: 'user', content: text, timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setIsSending(true);

        // Mensaje placeholder
        setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: new Date() }]);

        try {
            const response = await fetch('http://localhost:8080/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    conversationHistory: messages.map(m => ({ role: m.role, content: m.content }))
                })
            });

            if (!response.ok) throw new Error('Error en API');

            const data = await response.json();
            const fullResponse = data.response || data.message || 'Lo siento, no pude procesar tu solicitud.';

            // Actualizar último mensaje
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                    ...newMessages[newMessages.length - 1],
                    content: fullResponse
                };
                return newMessages;
            });

            // Mapa
            if (data.metadata) {
                window.dispatchEvent(new CustomEvent('chatbot-map-update', { detail: data.metadata }));
            }

            // Detectar contexto local
            detectContextAndFilterMap(fullResponse);

            setIsSending(false);
            return fullResponse; // Retornamos la respuesta para que pueda ser usada (ej. TTS)

        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = 'Lo siento, hubo un error al procesar tu mensaje.';
                return newMessages;
            });
            setIsSending(false);
            return null;
        }
    };

    return { messages, setMessages, isSending, sendMessage };
};
