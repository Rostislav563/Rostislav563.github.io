import { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import type { EmotionType } from '../types/emotions';

export function useFaceDetection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emotion, setEmotion] = useState<EmotionType>('neutral');
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = import.meta.env.BASE_URL + 'models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        setIsLoading(false);
      } catch (err) {
        setError('Не удалось загрузить модели распознавания');
        console.error(err);
      }
    };

    loadModels();
  }, []);

  const startVideo = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Не удалось получить доступ к камере');
      console.error(err);
    }
  }, []);

  const detectEmotions = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (detections.length > 0) {
      const expressions = detections[0].expressions;
      const sorted = Object.entries(expressions).sort(([, a], [, b]) => b - a);
      const [topEmotion, topConfidence] = sorted[0];
      setEmotion(topEmotion as EmotionType);
      setConfidence(topConfidence);
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;

    startVideo();

    const interval = setInterval(() => {
      if (videoRef.current?.readyState === 4) {
        detectEmotions();
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isLoading, startVideo, detectEmotions]);

  return { videoRef, canvasRef, isLoading, error, emotion, confidence };
}
