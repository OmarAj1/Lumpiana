
// services/geminiService.ts

import { GoogleGenAI, Type, Modality, HarmCategory, HarmBlockThreshold } from "@google/genai";

// Safe access to process.env for browser environments
const API_KEY = (typeof process !== 'undefined' && process.env && process.env.API_KEY) || ''; 

// Lazy initialization
let aiInstance: GoogleGenAI | null = null;

const getAi = (): GoogleGenAI => {
  if (!aiInstance) {
    if (!API_KEY) {
        console.error("Luma Security: Missing API Key. AI features disabled.");
        throw new Error("API Key is missing from environment variables.");
    }
    aiInstance = new GoogleGenAI({ apiKey: API_KEY });
  }
  return aiInstance;
};

// SECURITY: Strict Safety Settings to prevent harmful content generation
const STRICT_SAFETY_SETTINGS = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
];

// Helper to strip Markdown code blocks and fix infinite decimals
const sanitizeAndRepairJson = (text: string): string => {
  let clean = text.trim();
  
  // 1. Strip Markdown wrappers
  clean = clean.replace(/^```(json)?/i, '').replace(/```$/, '');
  
  // 2. Find JSON bounds
  const firstBrace = clean.indexOf('{');
  if (firstBrace !== -1) {
      clean = clean.substring(firstBrace);
  }

  // 3. AGGRESSIVE FIX: Truncate infinite decimals in the string BEFORE parsing
  clean = clean.replace(/(\d+\.\d{3,})/g, (match) => {
      return parseFloat(match).toFixed(2);
  });

  // 4. Handle Truncation (Attempt to close JSON)
  if (!clean.trim().endsWith('}')) {
      const lastBracket = clean.lastIndexOf(']');
      const lastBrace = clean.lastIndexOf('}');
      
      if (lastBracket === -1 || lastBracket < clean.lastIndexOf('[')) {
          const lastObjectClose = clean.lastIndexOf('}');
          if (lastObjectClose !== -1) {
              clean = clean.substring(0, lastObjectClose + 1);
              clean += ']}';
          }
      } else if (lastBrace === -1) {
          clean += '}';
      }
  }
  
  return clean;
};

export const stopSpeech = () => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

export const generateLesson = async (level: string, genre: string) => {
  try {
    const ai = getAi();
    const model = 'gemini-2.5-flash';
    
    // OPTIMIZATION: Reduced to 4 bars for speed
    const prompt = `
      Create a very short ${level} piano lesson in ${genre} style.
      Constraint: Exactly 4 bars. Max 20 notes.
      Requirements:
      1. Provide 'finger' (1-5) for every note.
      2. Round 'startTime'/'duration' to 2 decimals.
      3. Return valid JSON.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        safetySettings: STRICT_SAFETY_SETTINGS,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            bpm: { type: Type.NUMBER },
            difficulty: { type: Type.STRING },
            notes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  note: { type: Type.STRING },
                  octave: { type: Type.NUMBER },
                  duration: { type: Type.NUMBER },
                  startTime: { type: Type.NUMBER },
                  lyrics: { type: Type.STRING, nullable: true },
                  hand: { type: Type.STRING, enum: ['l', 'r'], nullable: true },
                  finger: { type: Type.NUMBER, description: "1 to 5" }
                }
              }
            }
          },
          required: ["title", "bpm", "notes"]
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(sanitizeAndRepairJson(response.text));
      if (!data.notes || !Array.isArray(data.notes)) {
        throw new Error("Invalid format: missing notes array");
      }
      return data;
    }
    throw new Error("No text in response");

  } catch (error) {
    console.error("Gemini generation failed", error);
    return null;
  }
};

export const generateSongFromTitle = async (songTitle: string, artist?: string) => {
    try {
      const ai = getAi();
      
      // EXTREME OPTIMIZATION: Snippet only. Max 10-15s. Max 30 notes.
      const prompt = `
        Task: Transcribe the MAIN HOOK/CHORUS ONLY of "${songTitle}"${artist ? ` by ${artist}` : ''}.
        
        CRITICAL SPEED CONSTRAINTS:
        1. **MAXIMUM 15 SECONDS** duration.
        2. **MAXIMUM 30 NOTES** total.
        3. Do not generate the whole song. Just the most recognizable bit.
        
        Formatting:
        - Hand: 'r' (melody), 'l' (bass).
        - Fingering: 1-5 required.
        - Round all numbers to 2 decimals.
      `;
  
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          safetySettings: STRICT_SAFETY_SETTINGS,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              bpm: { type: Type.NUMBER },
              difficulty: { type: Type.STRING },
              notes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    note: { type: Type.STRING },
                    octave: { type: Type.NUMBER },
                    duration: { type: Type.NUMBER },
                    startTime: { type: Type.NUMBER },
                    lyrics: { type: Type.STRING, nullable: true },
                    hand: { type: Type.STRING, enum: ['l', 'r'], nullable: true },
                    finger: { type: Type.NUMBER }
                  }
                }
              },
              backingTrack: {
                type: Type.ARRAY,
                nullable: true,
                description: "Optional simple chord progression",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        chordName: { type: Type.STRING },
                        notes: { type: Type.ARRAY, items: { type: Type.STRING } },
                        startTime: { type: Type.NUMBER },
                        duration: { type: Type.NUMBER }
                    }
                }
              }
            },
            required: ["title", "bpm", "notes"]
          }
        }
      });
  
      if (response.text) {
        try {
            const cleanText = sanitizeAndRepairJson(response.text);
            if (!cleanText || cleanText === 'null') throw new Error("Empty response text");
            
            const data = JSON.parse(cleanText);
            
            if (!data.notes || !Array.isArray(data.notes) || data.notes.length === 0) {
                 console.error("Generated song has no notes", data);
                 return null;
            }
            return data;
        } catch (parseError) {
            console.error("JSON Parse Error. Raw text sample:", response.text.substring(0, 200), parseError);
            return null;
        }
      }
      return null;
    } catch (error) {
      console.error("Song generation failed details:", error);
      return null;
    }
  };

export const generateWorkout = async (weakness?: string) => {
  try {
    const ai = getAi();
    const focus = weakness || "finger independence";
    
    // OPTIMIZATION: Reduced to 15 notes max
    const prompt = `
      Create a micro-workout (max 15 notes) for piano focusing on ${focus}.
      Round all values to 2 decimals.
      Include finger numbers.
      Return JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        safetySettings: STRICT_SAFETY_SETTINGS,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            bpm: { type: Type.NUMBER },
            notes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  note: { type: Type.STRING },
                  octave: { type: Type.NUMBER },
                  duration: { type: Type.NUMBER },
                  startTime: { type: Type.NUMBER },
                  finger: { type: Type.NUMBER },
                  hand: { type: Type.STRING }
                }
              }
            }
          },
          required: ["title", "bpm", "notes"]
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(sanitizeAndRepairJson(response.text));
      if (!data.notes || !Array.isArray(data.notes)) {
          return null;
      }
      return data;
    }
    return null;
  } catch (error) {
    console.error("Workout generation failed", error);
    return null;
  }
};

export const getFeedback = async (score: number, misses: number) => {
  try {
     const ai = getAi();
     const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `A piano student just finished a lesson. Score: ${score}. Misses: ${misses}. Give a short 1-sentence tip.`,
      config: { safetySettings: STRICT_SAFETY_SETTINGS }
    });
    return response.text;
  } catch (e) {
    return "Great practice! Keep it up.";
  }
};

export const generateAccompaniment = async (recentNotes: string[]) => {
  try {
    if (recentNotes.length === 0) return null;
    const ai = getAi();
    const prompt = `
      Generate 2 ambient chords for notes: ${recentNotes.slice(0,5).join(', ')}.
      Return JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        safetySettings: STRICT_SAFETY_SETTINGS,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mood: { type: Type.STRING },
            chords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  notes: { type: Type.ARRAY, items: { type: Type.STRING } },
                  duration: { type: Type.NUMBER }
                }
              }
            }
          },
          required: ["mood", "chords"]
        }
      }
    });
    
    if (response.text) {
      return JSON.parse(sanitizeAndRepairJson(response.text));
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const speakText = async (text: string): Promise<void> => {
  if (!text) return;
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: { parts: [{ text: text }] },
      config: {
        safetySettings: STRICT_SAFETY_SETTINGS,
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const audioBuffer = await decodeAudioData(base64Audio, audioCtx);
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      source.start();
    }
  } catch (error) {
    console.error("TTS failed", error);
  }
};

function atobUint8(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(base64: string, ctx: AudioContext): Promise<AudioBuffer> {
  const bytes = atobUint8(base64);
  const bufferClone = new Uint8Array(bytes.length);
  bufferClone.set(bytes);
  try {
    return await ctx.decodeAudioData(bufferClone.buffer);
  } catch (e) {
    const dataInt16 = new Int16Array(bytes.buffer);
    const channelData = new Float32Array(dataInt16.length);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    const buffer = ctx.createBuffer(1, channelData.length, 24000);
    buffer.copyToChannel(channelData, 0);
    return buffer;
  }
}
