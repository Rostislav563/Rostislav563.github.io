import { type EmotionType, emotionConfigs } from '../types/emotions';
import './EmotionDisplay.css';

interface EmotionDisplayProps {
  emotion: EmotionType;
  confidence: number;
}

export function EmotionDisplay({ emotion, confidence }: EmotionDisplayProps) {
  const config = emotionConfigs[emotion];
  const confidencePercent = Math.round(confidence * 100);

  return (
    <div className="emotion-display">
      <div className="emotion-emoji">{config.emoji}</div>
      <div className="emotion-label">{config.label}</div>
      <div className="emotion-confidence">
        <div className="confidence-bar">
          <div 
            className="confidence-fill" 
            style={{ width: `${confidencePercent}%` }}
          />
        </div>
        <span className="confidence-text">{confidencePercent}%</span>
      </div>
    </div>
  );
}
