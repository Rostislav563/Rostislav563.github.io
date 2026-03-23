import './LoadingScreen.css';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Загрузка моделей...' }: LoadingScreenProps) {
  return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <p className="loading-text">{message}</p>
    </div>
  );
}
