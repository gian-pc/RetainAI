import { useState, useEffect, useRef } from 'react';

export const useSpeechRecognition = (onResult: (text: string) => void) => {
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);
    const onResultRef = useRef(onResult);

    // Actualizar el ref si cambia la función callback
    useEffect(() => {
        onResultRef.current = onResult;
    }, [onResult]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const rec = new SpeechRecognition();
                rec.lang = 'es-ES';
                rec.continuous = false;
                rec.interimResults = false;

                rec.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    // Usar el ref actual
                    if (onResultRef.current) {
                        onResultRef.current(transcript);
                    }
                    setIsListening(false);
                };

                rec.onerror = (event: any) => {
                    console.error('Speech recognition error:', event.error);
                    setIsListening(false);
                };

                rec.onend = () => {
                    setIsListening(false);
                };

                setRecognition(rec);
            }
        }
    }, []); // Dependencia vacía para inicializar solo una vez

    const toggleListening = () => {
        if (!recognition) {
            alert('Lo siento, tu navegador no soporta reconocimiento de voz. Por favor usa Chrome o Edge.');
            return;
        }

        if (isListening) {
            recognition.stop();
            setIsListening(false);
        } else {
            recognition.start();
            setIsListening(true);
        }
    };

    return { isListening, toggleListening };
};
