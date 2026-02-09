import React, { useEffect, useRef, useState } from 'react';

interface CameraLayerProps {
  onRef: (video: HTMLVideoElement | null) => void;
  onError: (msg: string) => void;
}

const CameraLayer: React.FC<CameraLayerProps> = ({ onRef, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamStarted, setStreamStarted] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(e => console.error("Play error:", e));
            setStreamStarted(true);
          };
          onRef(videoRef.current);
        }
      } catch (err) {
        console.error("Camera Access Error:", err);
        onError("Could not access camera. Please allow permissions.");
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [onRef, onError]);

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 w-full h-full object-cover z-0"
      playsInline
      muted
      autoPlay
    />
  );
};

export default CameraLayer;