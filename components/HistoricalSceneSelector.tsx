import React from 'react';
import type { HistoricalScene } from '../types';
import { SparklesIcon, RefreshIcon } from './Icons';

interface HistoricalSceneSelectorProps {
  scenes: HistoricalScene[];
  onSceneSelect: (scene: HistoricalScene) => void;
  onRandomScene: () => void;
  onGenerateNewScenes: () => void;
  disabled: boolean;
}

const HistoricalSceneSelector: React.FC<HistoricalSceneSelectorProps> = ({ scenes, onSceneSelect, onRandomScene, onGenerateNewScenes, disabled }) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-3 text-gray-300">Time-Travel Photo Booth</h3>
       <button
        type="button"
        onClick={onGenerateNewScenes}
        disabled={disabled}
        className="w-full mb-3 inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300"
        aria-label="Generate a new set of time-travel scenes"
      >
        <RefreshIcon /> Generate New Scenes
      </button>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {scenes.map((scene) => (
          <button
            type="button"
            key={scene.id}
            onClick={() => onSceneSelect(scene)}
            disabled={disabled}
            className="group rounded-lg overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 flex flex-col"
            aria-label={`Time-travel to ${scene.name}`}
          >
            <div className="aspect-square w-full overflow-hidden bg-gray-900 flex items-center justify-center text-xs text-gray-400">
                <img src={scene.imageUrl} alt={scene.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div className="p-2 bg-gray-700">
              <span className="text-white text-center font-bold text-sm block w-full">{scene.name}</span>
            </div>
          </button>
        ))}
      </div>
      <div className="w-full h-px bg-gray-700 my-4"></div>
      <button
        type="button"
        onClick={onRandomScene}
        disabled={disabled}
        className="w-full inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-lg shadow-md hover:from-teal-600 hover:to-cyan-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-300"
        aria-label="Generate a random time-travel scene"
      >
        <SparklesIcon /> Random Time-Travel
      </button>
    </div>
  );
};

export default HistoricalSceneSelector;