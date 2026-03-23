export type EmotionType = 
  | 'happy' 
  | 'sad' 
  | 'angry' 
  | 'surprised' 
  | 'fearful' 
  | 'disgusted' 
  | 'neutral';

export interface EmotionConfig {
  emoji: string;
  label: string;
  gradient: string;
}

export const emotionConfigs: Record<EmotionType, EmotionConfig> = {
  happy: {
    emoji: '😊',
    label: 'Счастье',
    gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  },
  sad: {
    emoji: '😢',
    label: 'Грусть',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  angry: {
    emoji: '😠',
    label: 'Злость',
    gradient: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
  },
  surprised: {
    emoji: '😮',
    label: 'Удивление',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)',
  },
  fearful: {
    emoji: '😨',
    label: 'Страх',
    gradient: 'linear-gradient(135deg, #4a00e0 0%, #8e2de2 100%)',
  },
  disgusted: {
    emoji: '🤢',
    label: 'Отвращение',
    gradient: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
  },
  neutral: {
    emoji: '😐',
    label: 'Нейтрально',
    gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
  },
};
