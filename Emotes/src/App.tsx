import { useFaceDetection } from './hooks/useFaceDetection';
import { WebcamView } from './components/WebcamView';
import { EmotionDisplay } from './components/EmotionDisplay';
import { LoadingScreen } from './components/LoadingScreen';
import { EmotionEffects } from './components/EmotionEffects';
import { emotionConfigs } from './types/emotions';
import './App.css';

function App() {
  const { videoRef, canvasRef, isLoading, error, emotion, confidence } = useFaceDetection();
  const gradient = emotionConfigs[emotion].gradient;

  return (
    <div className="app" style={{ background: gradient }}>
      <EmotionEffects emotion={emotion} />
      
      <header className="header">
        <h1>Emotion Detector</h1>
        <p className="subtitle">Распознавание эмоций в реальном времени</p>
      </header>

      <main className="main">
        {error ? (
          <div className="error-message">
            <span className="error-emoji">⚠️</span>
            <p>{error}</p>
          </div>
        ) : isLoading ? (
          <LoadingScreen />
        ) : (
          <div className="content">
            <WebcamView videoRef={videoRef} canvasRef={canvasRef} />
            <EmotionDisplay emotion={emotion} confidence={confidence} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
