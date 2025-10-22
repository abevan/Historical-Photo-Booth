import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { UploadedImage } from '../types';

interface CameraCaptureProps {
  onImageCapture: (image: UploadedImage) => void;
  onCancel: () => void;
  setError: (error: string | null) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onImageCapture, onCancel, setError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    const startCamera = async () => {
      // Ensure any previous stream is stopped
      if (stream) {
          stream.getTracks().forEach(track => track.stop());
      }
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please ensure you have granted permission.");
        onCancel();
      }
    };
    
    startCamera();

    return () => {
      // Cleanup function to stop the camera when the component unmounts
      if (stream) {
          stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [setError, onCancel]); // Re-running only if setError or onCancel changes.
  
  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        // Flip the image horizontally for a mirror effect
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        const base64 = dataUrl.split(',')[1];
        if (base64) {
            onImageCapture({
              base64,
              mimeType: 'image/jpeg',
              name: `capture-${new Date().toISOString()}.jpg`,
            });
            stopCamera();
        } else {
            setError("Failed to capture image from camera.");
        }
      } else {
        setError("Could not get canvas context to capture image.");
      }
    }
  };

  const handleCancel = () => {
    stopCamera();
    onCancel();
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
        {!stream && <div className="absolute inset-0 flex items-center justify-center text-white">Starting Camera...</div>}
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <div className="flex gap-4">
        <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors">
            Cancel
        </button>
        <button type="button" onClick={handleCapture} disabled={!stream} className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed transition-colors">
            Capture Photo
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;