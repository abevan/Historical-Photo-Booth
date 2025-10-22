
import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { UploadedImage, HistoricalScene } from '../types';

// IMPORTANT: A new GoogleGenAI instance is created for each API call
// to ensure it uses the latest API key selected by the user.
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
};

/**
 * Converts an uploaded image to a standardized base64 string in a target format.
 * This resizes the image to prevent issues with overly large files and ensures
 * the image data is clean and compatible with the Gemini API.
 */
const convertImageToBase64 = (
  image: UploadedImage,
  targetMimeType: 'image/png' | 'image/jpeg' = 'image/png'
): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_DIMENSION = 1024;
      let { width, height } = img;

      if (width > height) {
        if (width > MAX_DIMENSION) {
          height = Math.round(height * (MAX_DIMENSION / width));
          width = MAX_DIMENSION;
        }
      } else {
        if (height > MAX_DIMENSION) {
          width = Math.round(width * (MAX_DIMENSION / height));
          height = MAX_DIMENSION;
        }
      }

      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }
      ctx.drawImage(img, 0, 0, width, height);
      
      const dataUrl = canvas.toDataURL(targetMimeType);
      const base64 = dataUrl.split(',')[1];
      
      if (!base64) {
        return reject(new Error('Failed to create base64 string from canvas.'));
      }
      
      resolve({ base64, mimeType: targetMimeType });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image for conversion. The image might be corrupt.'));
    };
    img.src = `data:${image.mimeType};base64,${image.base64}`;
  });
};

export const analyzeImage = async (image: UploadedImage, prompt: string): Promise<string> => {
  const model = 'gemini-2.5-flash';
  try {
    const ai = getAiClient();
    const { base64, mimeType } = await convertImageToBase64(image, 'image/jpeg');
    const imagePart = fileToGenerativePart(base64, mimeType);
    
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [imagePart, { text: prompt }] },
    });
    return response.text;
  } catch (error) {
    console.error("Error analyzing image:", error);
    if (error instanceof Error && error.message.includes('Failed to load image')) {
         throw new Error("Failed to process image for analysis. It might be corrupt. Please try another photo.");
    }
    throw error;
  }
};

export const editImage = async (image: UploadedImage, prompt: string): Promise<string> => {
  const model = 'gemini-2.5-flash-image';
  try {
    const ai = getAiClient();
    const { base64, mimeType } = await convertImageToBase64(image, 'image/png');
    const imagePart = fileToGenerativePart(base64, mimeType);

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [imagePart, { text: prompt }],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
    
    // FIX: Add detailed response validation to provide better error messages.
    // This checks for safety blocks or other reasons the API might not return an image.
    if (!response.candidates || response.candidates.length === 0) {
      const blockReason = response.promptFeedback?.blockReason;
      if (blockReason) {
        throw new Error(`Request blocked due to: ${blockReason}. Please adjust your prompt or image.`);
      }
      throw new Error("The AI model did not return any content. This may be due to a safety filter or an internal error.");
    }
    
    for (const part of response.candidates[0].content.parts ?? []) {
      if (part.inlineData) {
        const base64ImageBytes = part.inlineData.data;
        const responseMimeType = part.inlineData.mimeType;
         if (!base64ImageBytes || !responseMimeType.startsWith('image/')) {
          continue;
        }
        return `data:${responseMimeType};base64,${base64ImageBytes}`;
      }
    }

    throw new Error("No image data found in the API response. The model may have failed to generate an image for this prompt.");

  } catch (error) {
    console.error("Error editing image:", error);
    if (error instanceof Error && error.message.includes('Failed to load image')) {
        throw new Error("Failed to process image for editing. It might be corrupt. Please try another photo.");
    }
    throw error;
  }
};

export const suggestHistoricalScenePrompt = async (): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const prompt = `Generate a single, creative, and specific prompt for an AI image editor. The goal is to place a person's face from a user's photo into a famous historical scene, artistic style, or a fictional universe. The prompt should be detailed enough to create a compelling image. For example: 'A scene from the signing of the Declaration of Independence, with the person as one of the founding fathers.' OR 'A vibrant street festival during the Harlem Renaissance, with the person dressed in 1920s fashion.' OR 'The person depicted as a noble knight in a dramatic oil painting from the Renaissance period.' Only return the prompt text itself, without any preamble or quotation marks.`;

    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error suggesting scene:", error);
        throw new Error("Failed to suggest a new scene. Please try again.");
    }
};

export const generateHistoricalScenes = async (): Promise<Omit<HistoricalScene, 'id' | 'imageUrl'>[]> => {
    const model = 'gemini-2.5-flash';
    const prompt = `Generate 6 creative prompts for an AI image editor to place a person into a historical or fantasy scene. For each, provide a short 'name', a detailed 'prompt' for the AI, and an array of 3-4 'imageKeywords' for finding a background image.`;
    
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        scenes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    prompt: { type: Type.STRING },
                                    imageKeywords: {
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING }
                                    }
                                },
                                required: ['name', 'prompt', 'imageKeywords']
                            }
                        }
                    },
                    required: ['scenes']
                }
            }
        });

        const json = JSON.parse(response.text);
        return json.scenes;
    } catch (error) {
        console.error("Error generating scenes:", error);
        throw new Error("Failed to generate new scenes. Please try again.");
    }
};

export const generateImageForScene = async (prompt: string): Promise<string> => {
    const model = 'gemini-2.5-flash-image';
    const ai = getAiClient();
    // FIX: Refined prompt for better scene generation and removed the try/catch
    // block that was hiding errors. Now errors will propagate to the UI.
    const fullPrompt = `Create an atmospheric, high-quality background image representing the theme: '${prompt}'. The image should be scenic and suitable for photo manipulation, without any central human figures.`;

    const response = await ai.models.generateContent({
        model: model,
        contents: {
            parts: [{ text: fullPrompt }],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    if (!response.candidates || response.candidates.length === 0) {
        const blockReason = response.promptFeedback?.blockReason;
        if (blockReason) {
          throw new Error(`Scene image generation blocked due to: ${blockReason}.`);
        }
        throw new Error("The AI model did not return any content for the scene image.");
    }

    for (const part of response.candidates[0].content.parts ?? []) {
        if (part.inlineData) {
            const base64ImageBytes = part.inlineData.data;
            const responseMimeType = part.inlineData.mimeType;
            if (!base64ImageBytes || !responseMimeType.startsWith('image/')) {
                continue;
            }
            return `data:${responseMimeType};base64,${base64ImageBytes}`;
        }
    }

    throw new Error("No image data found in the API response for the scene image.");
};


export const generateVideo = async (image: UploadedImage, prompt: string): Promise<any> => {
    const model = 'veo-3.1-fast-generate-preview';
    try {
        const ai = getAiClient();
        const { base64, mimeType } = await convertImageToBase64(image, 'image/jpeg');

        const operation = await ai.models.generateVideos({
            model,
            prompt,
            image: {
                imageBytes: base64,
                mimeType,
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });
        return operation;
    } catch (error) {
        console.error("Error starting video generation:", error);
        throw error;
    }
};

export const getVideosOperation = async (operation: any): Promise<any> => {
    try {
        const ai = getAiClient();
        return await ai.operations.getVideosOperation({ operation });
    } catch (error) {
        console.error("Error polling video operation:", error);
        throw error;
    }
};
