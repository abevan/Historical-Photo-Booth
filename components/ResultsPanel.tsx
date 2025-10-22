import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import ImageDisplay from './ImageDisplay';
import PromptInput from './PromptInput';
import { MagicWandIcon, FilmIcon, PhotoIcon } from './Icons';

interface ResultsPanelProps {
    isLoading: boolean;
    loadingMessage: string;
    error: string | null;
    generatedImage: string | null;
    followUpPrompt: string;
    setFollowUpPrompt: (prompt: string) => void;
    onFollowUpEdit: () => void;
    isVideoLoading: boolean;
    videoLoadingMessage: string;
    generatedVideoUrl: string | null;
    videoPrompt: string;
    setVideoPrompt: (prompt: string) => void;
    onGenerateVideo: () => void;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
    isLoading,
    loadingMessage,
    error,
    generatedImage,
    followUpPrompt,
    setFollowUpPrompt,
    onFollowUpEdit,
    isVideoLoading,
    videoLoadingMessage,
    generatedVideoUrl,
    videoPrompt,
    setVideoPrompt,
    onGenerateVideo,
}) => {

    const renderContent = () => {
        if (error) {
            return <ErrorMessage message={error} />;
        }
        
        // Handle initial loading state when no image has been generated yet
        if (isLoading && !generatedImage) {
            return <LoadingSpinner message={loadingMessage} />;
        }

        if (generatedImage) {
            return (
                 <div className="w-full relative">
                    <ImageDisplay title="Generated Image" imageUrl={generatedImage} />
                    {/* Handle loading state for refinements (overlay on existing image) */}
                    {isLoading && (
                        <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center rounded-lg backdrop-blur-sm">
                           <LoadingSpinner message={loadingMessage} />
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="text-center text-gray-500 flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed border-gray-700 rounded-lg h-full w-full">
                <PhotoIcon className="h-16 w-16 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-400">Your masterpiece awaits!</h3>
                <p className="text-sm">Generated images will appear in this space.</p>
            </div>
        );
    };

    return (
        <section aria-labelledby="results-heading" className="flex flex-col justify-between items-center p-6 bg-gray-800/50 rounded-xl shadow-2xl border border-gray-700 min-h-[400px] lg:min-h-full">
            <h2 id="results-heading" className="text-2xl font-bold text-center mb-4 text-purple-300">2. Your Masterpiece</h2>
            <div className="w-full flex-grow flex justify-center items-center">
                {renderContent()}
            </div>
            {generatedImage && !isLoading && (
                <>
                <div className="w-full mt-6 pt-4 border-t border-gray-700">
                    <h3 className="text-lg font-semibold text-center mb-3 text-purple-300">Want to change something?</h3>
                    <PromptInput
                        prompt={followUpPrompt}
                        setPrompt={setFollowUpPrompt}
                        placeholder="e.g., 'Make it black and white' or 'Add a hat'"
                        disabled={isLoading}
                    />
                    <button
                        type="button"
                        onClick={onFollowUpEdit}
                        disabled={isLoading || !followUpPrompt}
                        className="w-full mt-3 inline-flex items-center justify-center px-4 py-2 bg-purple-800 text-white font-semibold rounded-lg shadow-md hover:bg-purple-900 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300"
                    >
                        <MagicWandIcon /> Refine Image
                    </button>
                </div>

                <div className="w-full mt-6 pt-4 border-t border-gray-700">
                    <h3 className="text-lg font-semibold text-center mb-3 text-green-300">Bring it to Life</h3>
                    <PromptInput
                        prompt={videoPrompt}
                        setPrompt={setVideoPrompt}
                        placeholder="e.g., 'Make the person smile and wave'"
                        disabled={isVideoLoading}
                    />
                    <button
                        type="button"
                        onClick={onGenerateVideo}
                        disabled={isVideoLoading || !videoPrompt}
                        className="w-full mt-3 inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300"
                    >
                        <FilmIcon /> Generate Video
                    </button>
                    {isVideoLoading && <div className="mt-4"><LoadingSpinner message={videoLoadingMessage} /></div>}
                    {generatedVideoUrl && !isVideoLoading && (
                        <div className="mt-4 w-full">
                            <h4 className="text-md font-semibold text-center mb-2 text-green-300">Generated Video</h4>
                            <video src={generatedVideoUrl} controls autoPlay loop playsInline className="w-full rounded-lg" />
                        </div>
                    )}
                </div>
                </>
            )}
        </section>
    );
};

export default ResultsPanel;