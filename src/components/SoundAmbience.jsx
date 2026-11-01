/**
 * SoundAmbience Component
 * Synthesizes ultra-luxurious, calming cafe ambient soundscapes using the HTML5 Web Audio API.
 * Generates warm acoustic pink noise and gentle espresso steam resonance without requiring external MP3 assets.
 */
import { useEffect, useRef } from 'react';

export default function SoundAmbience({ isPlaying }) {
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const noiseSourceRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      // Initialize Web Audio Context on first user activation
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContext();

        // Create pink noise buffer (warm cafe room tone)
        const bufferSize = audioCtxRef.current.sampleRate * 2;
        const noiseBuffer = audioCtxRef.current.createBuffer(1, bufferSize, audioCtxRef.current.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
          b6 = white * 0.115926;
        }

        // Low-pass filter to simulate warm espresso cafe room acoustics
        const filter = audioCtxRef.current.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, audioCtxRef.current.currentTime);

        const gainNode = audioCtxRef.current.createGain();
        gainNode.gain.setValueAtTime(0.01, audioCtxRef.current.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.08, audioCtxRef.current.currentTime + 1.5);

        const noise = audioCtxRef.current.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtxRef.current.destination);

        noise.start();
        noiseSourceRef.current = noise;
        gainNodeRef.current = gainNode;
      } else if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
        if (gainNodeRef.current) {
          gainNodeRef.current.gain.linearRampToValueAtTime(0.08, audioCtxRef.current.currentTime + 0.8);
        }
      }
    } else {
      if (audioCtxRef.current && gainNodeRef.current) {
        gainNodeRef.current.gain.linearRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.5);
        setTimeout(() => {
          if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
            audioCtxRef.current.suspend();
          }
        }, 550);
      }
    }

    return () => {
      // cleanup on unmount
    };
  }, [isPlaying]);

  return null;
}
