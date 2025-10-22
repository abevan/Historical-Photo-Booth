import React, { useCallback, useState } from 'react';
import type { UploadedImage } from '../types';
import { CameraIcon } from './Icons';
import CameraCapture from './CameraCapture';

interface ImageUploaderProps {
  onImageUpload: (image: UploadedImage) => void;
  setError: (error: string | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, setError }) => {
  const [showCamera, setShowCamera] = useState(false);

  const handleFileChange = useCallback((files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file.');
        return;
      }
      setError(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        if (base64) {
          onImageUpload({
            base64,
            mimeType: file.type,
            name: file.name
          });
        } else {
            setError('Could not read the image file.');
        }
      };
      reader.onerror = () => {
        setError('Error reading file.');
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload, setError]);

  const handleImageCapture = (image: UploadedImage) => {
    onImageUpload(image);
    setShowCamera(false);
  };

  if (showCamera) {
    return <CameraCapture onImageCapture={handleImageCapture} onCancel={() => setShowCamera(false)} setError={setError} />;
  }

  return (
    <div className="w-full flex flex-col gap-4 items-center p-4">
        <button
            type="button"
            onClick={() => setShowCamera(true)}
            className="w-full inline-flex items-center justify-center px-6 py-4 bg-purple-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-purple-700 transition-colors duration-300 transform hover:scale-105"
            aria-label="Take a picture with your camera"
        >
            <CameraIcon /> Take Picture
        </button>
        <div className="flex items-center w-full gap-2 text-gray-400">
            <div className="h-px flex-grow bg-gray-600"></div>
            <span className="text-sm">OR</span>
            <div className="h-px flex-grow bg-gray-600"></div>
        </div>
         <label htmlFor="file-upload" className="text-sm text-purple-400 hover:text-purple-300 underline cursor-pointer">
            Upload an image from your device
        </label>
        <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files)} />
    </div>
  );
};

export default ImageUploader;