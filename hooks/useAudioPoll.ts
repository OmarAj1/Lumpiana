
import { useState, useEffect, useRef } from 'react';
import { audioEngine } from '../services/audioEngine';
import { AudioAnalysisResult } from '../types';

export const useAudioPoll = () => {
    const [data, setData] = useState<AudioAnalysisResult>({
        activeNotes: [],
        volume: 0,
        snr: 0,
        clarity: 0,
        harmonicity: 0,
        spectralCentroid: 0,
        source: 'none'
    });
    const rAF = useRef<number>(0);

    useEffect(() => {
        const loop = () => {
            const analysis = audioEngine.analyze();
            setData(analysis);
            rAF.current = requestAnimationFrame(loop);
        };
        loop();
        return () => cancelAnimationFrame(rAF.current);
    }, []);

    return data;
};
