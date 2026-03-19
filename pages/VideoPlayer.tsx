import React, { useState, useRef, useEffect } from 'react';
import { AppScreen } from '../types';
import BottomNav from '../components/BottomNav';

interface VideoPlayerProps {
  onNavigate: (screen: AppScreen) => void;
  videoUrl: string;
  title: string;
  category: string;
  duration: string;
  level: string;
  thumbnailUrl: string;
  instructions: string[];
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  onNavigate, 
  videoUrl, 
  title, 
  category, 
  duration: durationProp,
  level,
  thumbnailUrl,
  instructions
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGifExpanded, setIsGifExpanded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isGifExercise = /\.gif($|\?)/i.test(videoUrl);

  const detailInstructions = instructions.length > 0 ? instructions : [
    `Confira com atenção o treino ${title} antes de iniciar para entender a sequência proposta.`,
    `Respeite seu ritmo durante os ${durationProp} de prática e faça pausas quando necessário.`,
    `Mantenha a execução com atenção à postura e à respiração do início ao fim.`
  ];

  const repetitionGuidance = level
    ? `Nível ${level.toLowerCase()}: faça as repetições com controle, priorizando qualidade do movimento.`
    : 'Execute cada movimento com atenção e ajuste a intensidade conforme sua necessidade.';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setVolume(newVolume);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, videoDuration);
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
    }
  };

  const progressPercentage = videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;

  return (
    <div className="flex flex-col h-full bg-neutral-light dark:bg-neutral-dark">
      {isGifExercise && isGifExpanded && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setIsGifExpanded(false)}
              className="size-10 rounded-full bg-white/10 text-white flex items-center justify-center"
            >
              <span className="material-symbols-outlined">arrow_back_ios_new</span>
            </button>
            <p className="text-white font-semibold text-sm truncate px-4">{title}</p>
            <button
              onClick={() => setIsGifExpanded(false)}
              className="size-10 rounded-full bg-white/10 text-white flex items-center justify-center"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <img
              src={videoUrl}
              alt={title}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 bg-neutral-light/80 dark:bg-neutral-dark/80 backdrop-blur-md p-4 flex items-center justify-between z-10 border-b border-gray-100 dark:border-white/5">
        <button 
          onClick={() => onNavigate(AppScreen.TREINOS)}
          className="size-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined dark:text-white">arrow_back_ios_new</span>
        </button>
        <div className="flex-1 text-center">
          <h2 className="font-bold text-lg truncate dark:text-white">{title}</h2>
          <p className="text-gray-500 dark:text-gray-300 text-sm">{category} • {durationProp}</p>
        </div>
        <div className="size-10" />
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {/* Video Container */}
        <div className="p-4 space-y-4">
          <div 
            ref={containerRef}
            className="relative bg-black rounded-3xl overflow-hidden ios-shadow"
          >
            <div className="relative aspect-video">
              {isGifExercise ? (
                <>
                  <img
                    src={videoUrl}
                    alt={title}
                    className="w-full h-full object-contain bg-black"
                  />
                  <button
                    onClick={() => setIsGifExpanded(true)}
                    className="absolute right-3 top-3 px-3 py-2 rounded-xl bg-black/55 text-white flex items-center gap-2 text-sm font-medium"
                  >
                    <span className="material-symbols-outlined text-base">open_in_full</span>
                    Ampliar
                  </button>
                </>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    poster={thumbnailUrl}
                    className="w-full h-full object-cover"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    playsInline
                  />

                  {!isPlaying && (
                    <button
                      onClick={togglePlay}
                      className="absolute inset-0 flex items-center justify-center bg-black/25"
                    >
                      <span className="size-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <span className="material-symbols-outlined text-4xl text-primary">play_arrow</span>
                      </span>
                    </button>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <input
                        type="range"
                        min="0"
                        max={videoDuration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${progressPercentage}%, #4b5563 ${progressPercentage}%, #4b5563 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-300 mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(videoDuration)}</span>
                      </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={skipBackward}
                          className="size-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                          <span className="material-symbols-outlined text-white">replay_10</span>
                        </button>
                        <button 
                          onClick={togglePlay}
                          className="size-12 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                          <span className="material-symbols-outlined text-black">
                            {isPlaying ? 'pause' : 'play_arrow'}
                          </span>
                        </button>
                        <button 
                          onClick={skipForward}
                          className="size-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                          <span className="material-symbols-outlined text-white">forward_10</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2">
                          <span className="material-symbols-outlined text-white text-sm">volume_up</span>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <button 
                          onClick={toggleFullscreen}
                          className="size-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                          <span className="material-symbols-outlined text-white">
                            {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <section className="bg-white dark:bg-white/5 rounded-3xl p-6 ios-shadow border border-gray-100 dark:border-white/5">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide">{category}</span>
              <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 text-xs font-semibold">{durationProp}</span>
              {level && (
                <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 text-xs font-semibold">{level}</span>
              )}
            </div>

            <h1 className="font-serif text-2xl font-bold dark:text-white mb-2">{title}</h1>
            <p className="text-gray-500 dark:text-gray-300 leading-relaxed">
              Assista ao vídeo acima quando estiver pronto. Logo abaixo você encontra as orientações do treino antes de dar play.
            </p>
          </section>

          <section className="bg-white dark:bg-white/5 rounded-3xl p-6 ios-shadow border border-gray-100 dark:border-white/5 space-y-5">
            <div>
              <h2 className="font-serif text-xl font-bold dark:text-white mb-2">Instruções do treino</h2>
              <p className="text-gray-500 dark:text-gray-300 text-sm leading-relaxed">
                Leia estas orientações antes de iniciar para garantir uma execução mais segura e organizada.
              </p>
            </div>

            <div className="space-y-3">
              {detailInstructions.map((instruction, index) => (
                <div key={`${title}-${index}`} className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                  <div className="size-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{instruction}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-white/5 rounded-3xl p-6 ios-shadow border border-gray-100 dark:border-white/5 space-y-4">
            <h2 className="font-serif text-xl font-bold dark:text-white">Orientações</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="rounded-2xl bg-gray-50 dark:bg-white/5 p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Repetições e ritmo</p>
                <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{repetitionGuidance}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 dark:bg-white/5 p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Duração</p>
                <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">Reserve aproximadamente {durationProp} para concluir esse treino com tranquilidade.</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <BottomNav currentScreen={AppScreen.TREINOS} onNavigate={onNavigate} />
    </div>
  );
};

export default VideoPlayer;
