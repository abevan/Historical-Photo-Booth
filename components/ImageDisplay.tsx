import React from 'react';

interface ImageDisplayProps {
  title: string;
  imageUrl: string;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ title, imageUrl }) => {
  return (
    <div className="w-full relative">
      <h3 className="text-xl font-semibold mb-3 text-center text-gray-300">{title}</h3>
      <div className="bg-gray-800 rounded-lg shadow-inner overflow-hidden aspect-square flex items-center justify-center">
        <img src={imageUrl} alt={title} className="max-w-full max-h-full object-contain" />
      </div>
    </div>
  );
};

export default React.memo(ImageDisplay);