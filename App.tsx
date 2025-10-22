import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import ControlsPanel from './components/ControlsPanel';
import ResultsPanel from './components/ResultsPanel';
import { KeyIcon } from './components/Icons';
import type { UploadedImage, HistoricalScene } from './types';
import { editImage, suggestHistoricalScenePrompt, generateHistoricalScenes, generateImageForScene, generateVideo, getVideosOperation } from './services/geminiService';
import { HISTORICAL_SCENES } from './constants';

const App: React.FC = () => {
  const [apiKeyReady, setApiKeyReady] = useState<boolean>(false);
  const [originalImage, setOriginalImage] = useState<UploadedImage | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [scenes, setScenes] = useState<HistoricalScene[]>(HISTORICAL_SCENES);
  const [followUpPrompt, setFollowUpPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [videoPrompt, setVideoPrompt] = useState<string>('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(false);
  const [videoLoadingMessage, setVideoLoadingMessage] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Effect to check for API key on initial load.
  useEffect(() => {
    const checkApiKey = async () => {
      setIsLoading(true);
      setLoadingMessage("Checking API Key...");
      if (window.aistudio && (await window.aistudio.hasSelectedApiKey())) {
        setApiKeyReady(true);
      } else {
        setApiKeyReady(false);
        // Only stop loading if no key is found, otherwise the next effect will handle it.
        setIsLoading(false);
      }
    };
    checkApiKey();
  }, []);
  
  const handleSelectKey = async () => {
    if (!window.aistudio) return;
    try {
        await window.aistudio.openSelectKey();
        setApiKeyReady(true);
    } catch (e) {
        console.error("Failed to open API key selection:", e);
        setError("Could not open the API key selection dialog.");
    }
  };

  const handleApiError = useCallback((e: unknown) => {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    if (errorMessage.includes("API key not valid") || errorMessage.includes("Requested entity was not found")) {
        setError("Your API Key is invalid. Please select a valid key to continue.");
        setApiKeyReady(false);
    } else {
        setError(errorMessage);
    }
    setStatusMessage(`Error: ${errorMessage}`);
  }, []);

  // Effect to generate initial scene images once the API key is ready.
  useEffect(() => {
    if (!apiKeyReady) return;

    const initializeScenes = async () => {
      setIsLoading(true);
      const message = "Generating scene previews...";
      setLoadingMessage(message);
      setStatusMessage(message);
      setError(null);
      try {
        const scenesWithAiImages = await Promise.all(
          HISTORICAL_SCENES.map(async (scene) => {
            const prompt = `${scene.name}, ${scene.imageKeywords?.join(', ')}`;
            const imageUrl = await generateImageForScene(prompt);
            return {
              ...scene,
              imageUrl: imageUrl,
            };
          })
        );
        setScenes(scenesWithAiImages);
        setStatusMessage("Scene previews ready.");
      } catch (e) {
        handleApiError(e);
        setError("Failed to generate initial scene previews. Using default images.");
        setScenes(HISTORICAL_SCENES); // Fallback to default
      } finally {
        setIsLoading(false);
      }
    };

    initializeScenes();
  }, [apiKeyReady, handleApiError]);


  const handleImageUpload = useCallback((image: UploadedImage) => {
    setOriginalImage(image);
    setGeneratedImage(null);
    setGeneratedVideoUrl(null);
    setVideoPrompt('');
    setError(null);
  }, []);

  const clearResults = () => {
    setGeneratedImage(null);
    setError(null);
    setGeneratedVideoUrl(null);
  };

  const handleEdit = useCallback(async (sourceImage: UploadedImage, editPrompt: string, message: string) => {
    clearResults();
    setIsLoading(true);
    setLoadingMessage(message);
    setStatusMessage(message);
    try {
      const result = await editImage(sourceImage, editPrompt);
      setGeneratedImage(result);
      setStatusMessage("Image generation successful.");
    } catch (e) {
      handleApiError(e);
    } finally {
      setIsLoading(false);
    }
  }, [handleApiError]);

  const handleSceneSelect = useCallback(async (scene: HistoricalScene) => {
    if (!originalImage) return;
    const timeTravelPrompt = `Take the person's face from this photo and realistically place them into a scene described as: '${scene.prompt}'. Maintain the style of the historical scene.`;
    handleEdit(originalImage, timeTravelPrompt, `Traveling to ${scene.name}...`);
  }, [originalImage, handleEdit]);

  const handleRandomTimeTravel = useCallback(async () => {
    if (!originalImage) return;
    clearResults();
    setIsLoading(true);
    setLoadingMessage('Consulting the Oracle of Time...');
    setStatusMessage('Consulting the Oracle of Time...');
    try {
      const randomPrompt = await suggestHistoricalScenePrompt();
      const message = `Traveling to a new destination...`;
      setLoadingMessage(message);
      setStatusMessage(message);
      const timeTravelPrompt = `Take the person's face from this photo and realistically place them into a scene described as: '${randomPrompt}'. Maintain the style of the described scene.`;
      const result = await editImage(originalImage, timeTravelPrompt);
      setGeneratedImage(result);
      setStatusMessage("Successfully time-traveled to a random destination.");
    } catch (e) {
      handleApiError(e);
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, handleApiError]);

  const handleFollowUpEdit = useCallback(async () => {
    if (!generatedImage || !followUpPrompt) {
      setError('Please provide a follow-up editing instruction.');
      return;
    }
    setGeneratedVideoUrl(null);
    setVideoPrompt('');
    
    const [header, base64] = generatedImage.split(',');
    if (!header || !base64) {
        setError('Invalid generated image format for editing.');
        return;
    }
    const mimeType = header.match(/:(.*?);/)?.[1] ?? 'image/png';
    const sourceImage: UploadedImage = {
        base64,
        mimeType,
        name: 'generated-image.png'
    };
    
    setIsLoading(true);
    const message = 'Refining your image...';
    setLoadingMessage(message);
    setStatusMessage(message);
    try {
      const result = await editImage(sourceImage, followUpPrompt);
      setGeneratedImage(result);
      setFollowUpPrompt(''); // Clear prompt after use
      setStatusMessage("Image refined successfully.");
    } catch (e) {
        handleApiError(e);
    } finally {
        setIsLoading(false);
    }
  }, [generatedImage, followUpPrompt, handleApiError]);
  
  const handleGenerateNewScenes = useCallback(async () => {
    setIsLoading(true);
    const message = "Generating new time-travel ideas...";
    setLoadingMessage(message);
    setStatusMessage(message);
    setError(null);
    try {
        const newSceneData = await generateHistoricalScenes();
        const previewMessage = "Creating scene preview images...";
        setLoadingMessage(previewMessage);
        setStatusMessage(previewMessage);

        const newScenesWithImages = await Promise.all(
            newSceneData.map(async (scene) => {
                const imageUrl = await generateImageForScene(
                    `${scene.name}, ${scene.imageKeywords?.join(', ')}`
                );
                return {
                    ...scene,
                    id: crypto.randomUUID(),
                    imageUrl: imageUrl,
                };
            })
        );
        
        setScenes(newScenesWithImages);
        setStatusMessage("New scenes generated successfully.");
    } catch (e) {
        handleApiError(e);
    } finally {
        setIsLoading(false);
    }
  }, [handleApiError]);

  const handleGenerateVideo = useCallback(async () => {
    if (!generatedImage || !videoPrompt) {
        setError("Please provide a prompt to generate the video.");
        return;
    }

    setIsVideoLoading(true);
    setVideoLoadingMessage("Initializing video synthesis...");
    setError(null);

    const videoLoadingMessages = [
        "Warming up the video engine...",
        "Choreographing pixels...",
        "Rendering temporal dimensions...",
        "This can take a few minutes...",
        "Almost there, polishing the final frames...",
        "Consulting the archives for motion...",
    ];

    try {
        const [header, base64] = generatedImage.split(',');
        if (!header || !base64) {
            throw new Error('Invalid generated image format for video creation.');
        }
        const mimeType = header.match(/:(.*?);/)?.[1] ?? 'image/png';
        const sourceImage: UploadedImage = {
            base64,
            mimeType,
            name: 'video-source.png'
        };
        
        let operation = await generateVideo(sourceImage, videoPrompt);

        let messageIndex = 0;
        const updateMessage = () => {
            setVideoLoadingMessage(videoLoadingMessages[messageIndex % videoLoadingMessages.length]);
            messageIndex++;
        };
        updateMessage();
        
        const intervalId = setInterval(updateMessage, 7000);

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await getVideosOperation(operation);
        }
        
        clearInterval(intervalId);

        setVideoLoadingMessage("Video ready! Preparing for playback...");
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation finished, but no download link was provided.");
        }
        
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!videoResponse.ok) {
            throw new Error(`Failed to download video file. Status: ${videoResponse.statusText}`);
        }
        const videoBlob = await videoResponse.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        
        setGeneratedVideoUrl(videoUrl);
        setStatusMessage("Video generated and ready for playback.");

    } catch (e) {
        handleApiError(e);
    } finally {
        setIsVideoLoading(false);
    }
  }, [generatedImage, videoPrompt, handleApiError]);

  const ApiKeySelection = () => (
    <div className="flex flex-col justify-center items-center h-full text-center p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-2xl border border-yellow-500/50 max-w-lg w-full">
            <h2 className="text-2xl font-bold text-yellow-300 mb-4">API Key Required</h2>
            <p className="text-gray-400 mb-6">
                To use the Historical Photo Booth, you need to select a valid Gemini API key. For video features, please also ensure billing is enabled for your Cloud project. See <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">billing documentation</a>.
            </p>
            <button
                type="button"
                onClick={handleSelectKey}
                className="inline-flex items-center justify-center px-6 py-3 bg-yellow-600 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-700 transition-colors duration-300"
            >
                <KeyIcon /> Select API Key
            </button>
             {error && (
                <div className="mt-6">
                    <ErrorMessage message={error} />
                </div>
            )}
        </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div aria-live="polite" className="sr-only">
            {statusMessage}
        </div>
        {!apiKeyReady ? (
            <ApiKeySelection />
        ) : isLoading && !originalImage ? (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner message={loadingMessage} />
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8" aria-busy={isLoading || isVideoLoading}>
                <ControlsPanel
                    originalImage={originalImage}
                    onImageUpload={handleImageUpload}
                    setOriginalImage={setOriginalImage}
                    setError={setError}
                    scenes={scenes}
                    onSceneSelect={handleSceneSelect}
                    onRandomScene={handleRandomTimeTravel}
                    onGenerateNewScenes={handleGenerateNewScenes}
                    disabled={!originalImage || isLoading}
                />
                <ResultsPanel
                    isLoading={isLoading}
                    loadingMessage={loadingMessage}
                    error={error}
                    generatedImage={generatedImage}
                    followUpPrompt={followUpPrompt}
                    setFollowUpPrompt={setFollowUpPrompt}
                    onFollowUpEdit={handleFollowUpEdit}
                    isVideoLoading={isVideoLoading}
                    videoLoadingMessage={videoLoadingMessage}
                    generatedVideoUrl={generatedVideoUrl}
                    videoPrompt={videoPrompt}
                    setVideoPrompt={setVideoPrompt}
                    onGenerateVideo={handleGenerateVideo}
                />
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
