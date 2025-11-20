
import { GoogleGenAI, Type, Modality, SafetySetting, HarmCategory, HarmBlockThreshold } from "@google/genai";

// Safe access to process.env for browser environments
const API_KEY = (typeof process !== 'undefined' && process.env && process.env.API_KEY) || ''; 

// Lazy initialization
let aiInstance: GoogleGenAI | null = null;

const getAi = (): GoogleGenAI => {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: API_KEY });
  }
  return aiInstance;
};

// Helper to strip Markdown code blocks if Gemini adds them
const cleanJson = (text: string): string => {
  let clean = text.trim();
  // Remove ```json ... ``` or ``` ... ``` wrappers
  if (clean.startsWith('```')) {
    clean = clean.replace(/^```(json)?/i, '').replace(/```$/, '');
  }
  return clean.trim();
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
    
    const prompt = `
      Create a piano lesson for a ${level} student interested in ${genre}. 
      Return a JSON object representing a short melody or exercise (4-8 bars).
      The 'notes' array should contain objects with 'note' (e.g. 'C', 'F#'), 'octave' (3, 4, or 5), 'duration' (in beats), and 'startTime' (cumulative beats).
      Keep the melody simple enough for a beginner but musical.
      For 'Beginner' level, ensure the BPM is slow (between 40 and 60 bpm) and rhythms are very simple.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
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
                  lyrics: { type: Type.STRING, nullable: true }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(cleanJson(response.text));
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
      
      // Enhanced prompt for Full Song + Lyrics
      const prompt = `
        Role: You are an expert musicologist and transcriber with access to the IMSLP (International Music Score Library Project) database and global song charts.
        
        Task: Generate playable sheet music (melody) and backing chords for the request: "${songTitle}" ${artist ? `by ${artist}` : ''}.
        
        Logic:
        1. If the request is a CLASSICAL PIECE:
           - Retrieve the MAIN THEME from the public domain score.
           - Include at least 16-32 bars.
        
        2. If the request is a MODERN SONG (Pop, Rock, Jazz):
           - Transcribe the FULL STRUCTURE: Verse, Chorus, Bridge (if applicable).
           - Include LYRICS for each note in the 'lyrics' field (one syllable per note).
           - Limit to ~200 notes max to keep generation fast but complete.
        
        CRITICAL CONSTRAINTS:
        - 'lyrics': Optional string on note events. Use for vocals.
        - Backing Track: Simple, ambient chords (1 chord every 2-4 beats).
        - Output must be valid JSON.
        
        Return JSON matching the schema exactly.
      `;
  
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          // Safety settings to prevent blocking on song titles
          safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          ],
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
                    lyrics: { type: Type.STRING, nullable: true }
                  }
                }
              },
              backingTrack: {
                type: Type.ARRAY,
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
            }
          }
        }
      });
  
      if (response.text) {
        try {
            return JSON.parse(cleanJson(response.text));
        } catch (parseError) {
            console.error("JSON Parse Error. Raw text:", response.text, parseError);
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
    const focus = weakness || "finger independence and basic scales";
    const prompt = `
      Create a "5-Minute Workout" piano exercise focusing on ${focus}.
      It should be a repetitive technical drill.
      Limit to 8 bars max.
      Return JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
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
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(cleanJson(response.text));
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
      contents: `A piano student just finished a lesson. Score: ${score} points. Missed notes: ${misses}. If misses > 0, be constructive. If score is high, be praising. Give a short, 1-sentence tip.`,
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
    const notesStr = recentNotes.join(', ');
    
    const prompt = `
      The user is jamming on a piano and played these notes recently: [${notesStr}]. 
      Generate a 4-bar ambient background chord progression.
      Return JSON with 'chords' array.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
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
                  notes: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  duration: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      }
    });
    
    if (response.text) {
      return JSON.parse(cleanJson(response.text));
    }
    return null;
  } catch (error) {
    console.error("Accompaniment generation failed", error);
    return null;
  }
};

export const speakText = async (text: string): Promise<void> => {
  if (!text) return;
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: {
        parts: [{ text: text }],
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" }, 
          },
        },
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
      
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      
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

async function decodeAudioData(
  base64: string,
  ctx: AudioContext
): Promise<AudioBuffer> {
  const bytes = atobUint8(base64);
  const bufferClone = new Uint8Array(bytes.length);
  bufferClone.set(bytes);
  
  try {
    return await ctx.decodeAudioData(bufferClone.buffer);
  } catch (e) {
    // Fallback manual decoding for raw PCM if needed or headerless data
    const dataInt16 = new Int16Array(bytes.buffer);
    const channelData = new Float32Array(dataInt16.length);
    for (let i = 0; i < dataInt16.length; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    const buffer = ctx.createBuffer(1, channelData.length, 24000);
    buffer.copyToChannel(channelData, 0);
    return buffer;
  }
}
