import React from 'react';
import ImageUploader from './ImageUploader';
import ImageDisplay from './ImageDisplay';
import HistoricalSceneSelector from './HistoricalSceneSelector';
import type { UploadedImage, HistoricalScene } from '../types';

interface ControlsPanelProps {
    originalImage: UploadedImage | null;
    onImageUpload: (image: UploadedImage) => void;
    setOriginalImage: (image: UploadedImage | null) => void;
    setError: (error: string | null) => void;
    scenes: HistoricalScene[];
    onSceneSelect: (scene: HistoricalScene) => void;
    onRandomScene: () => void;
    onGenerateNewScenes: () => void;
    disabled: boolean;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
    originalImage,
    onImageUpload,
    setOriginalImage,
    setError,
    scenes,
    onSceneSelect,
    onRandomScene,
    onGenerateNewScenes,
    disabled
}) => {
    return (
        <section aria-labelledby="controls-heading" className="flex flex-col gap-6 p-6 bg-gray-800/50 rounded-xl shadow-2xl border border-gray-700">
            <h2 id="controls-heading" className="text-2xl font-bold text-center text-purple-300">1. Create Your Scene</h2>
            {originalImage ? (
                <div>
                    <ImageDisplay title="Original Image" imageUrl={`data:${originalImage.mimeType};base64,${originalImage.base64}`} />
                    <button onClick={() => setOriginalImage(null)} className="w-full mt-2 text-sm text-center text-gray-400 hover:text-red-400">
                        Use a different photo
                    </button>
                </div>
            ) : (
                <ImageUploader onImageUpload={onImageUpload} setError={setError} />
            )}

            <div className="w-full h-px bg-gray-700"></div>
            
            <HistoricalSceneSelector
                scenes={scenes}
                onSceneSelect={onSceneSelect}
                onRandomScene={onRandomScene}
                onGenerateNewScenes={onGenerateNewScenes}
                disabled={disabled}
            />
        </section>
    );
};

export default ControlsPanel;