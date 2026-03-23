import type { RefObject } from 'react';
import './WebcamView.css';

interface WebcamViewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
}

export function WebcamView({ videoRef, canvasRef }: WebcamViewProps) {
  return (
    <div className="webcam-container">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="webcam-video"
      />
      <canvas ref={canvasRef} className="webcam-canvas" />
    </div>
  );
}
