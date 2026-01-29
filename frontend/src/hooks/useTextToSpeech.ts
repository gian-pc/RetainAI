import { useState } from 'react';

export const useTextToSpeech = () => {
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

    const stopAudio = () => {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            setCurrentAudio(null);
            setIsPlayingAudio(false);
        }
    };

    const speakResponse = async (text: string) => {
        try {
            console.log('🔊 Iniciando síntesis de voz para:', text.substring(0, 50) + '...');
            stopAudio();

            const response = await fetch('http://localhost:8080/api/tts/synthesize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text })
            });

            console.log('📡 Respuesta del servidor TTS:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error al generar audio:', errorText);
                return;
            }

            const audioBlob = await response.blob();
            console.log('📦 Audio blob recibido:', audioBlob.size, 'bytes, tipo:', audioBlob.type);

            if (audioBlob.size === 0) {
                console.error('❌ El audio recibido está vacío');
                return;
            }

            const audioUrl = URL.createObjectURL(audioBlob);
            console.log('🔗 URL del audio creada:', audioUrl);

            const audio = new Audio(audioUrl);
            setCurrentAudio(audio);

            // Esperar a que el audio esté listo antes de marcar como playing
            audio.onloadeddata = () => {
                console.log('✅ Audio cargado correctamente, duración:', audio.duration);
                setIsPlayingAudio(true);
            };

            audio.onended = () => {
                console.log('⏹️ Audio terminado de reproducir');
                URL.revokeObjectURL(audioUrl);
                setIsPlayingAudio(false);
                setCurrentAudio(null);
            };

            audio.onerror = (e) => {
                console.error('❌ Error al reproducir el audio:', e);
                console.error('Error details:', audio.error);
                URL.revokeObjectURL(audioUrl);
                setIsPlayingAudio(false);
                setCurrentAudio(null);
            };

            console.log('▶️ Intentando reproducir audio...');
            const playPromise = audio.play();

            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log('✅ Audio reproduciéndose correctamente');
                    })
                    .catch((error) => {
                        console.error('❌ Error al intentar reproducir:', error);
                        setIsPlayingAudio(false);
                    });
            }

        } catch (error) {
            console.error('❌ Error general al reproducir audio:', error);
            setIsPlayingAudio(false);
        }
    };

    const cleanTextForTTS = (text: string): string => {
        return text
            .replace(/^[\s\-]*\|?[\s\-]*(ID\s+Cliente|Riesgo|Probabilidad|Ingreso|Mensual|Razón)(\s*[:\|]|\s+).*/gim, '')
            .replace(/.*\|.*\|.*/g, '')
            .replace(/[\-]{3,}/g, '')
            .replace(/\b\d{4}-[A-Z]{5,6}\b/g, 'un cliente')
            .replace(/\((\d+)%\)/g, '$1 por ciento')
            .replace(/\n+/g, '. ')
            .replace(/\s+/g, ' ')
            .replace(/\.{2,}/g, '.')
            .trim();
    };

    return { isPlayingAudio, speakResponse, stopAudio, cleanTextForTTS };
};
