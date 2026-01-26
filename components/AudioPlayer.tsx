import React, { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  track: {
    id: string;
    title: string;
    duration: string;
    audioUrl: string;
    imageUrl: string;
  };
  onClose: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ track, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.volume = volume;

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [volume, isRepeat]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(audio.currentTime + 30, audio.duration);
  };

  const skipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(audio.currentTime - 30, 0);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progressBar = progressBarRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickPercent = clickX / width;
    audio.currentTime = clickPercent * audio.duration;
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-end">
      <div className="bg-white dark:bg-neutral-dark rounded-t-3xl w-full max-w-[430px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
          <button onClick={onClose} className="size-10 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">expand_more</span>
          </button>
          <h3 className="font-serif text-lg font-bold dark:text-white">Áudio Emocional</h3>
          <button className="size-10 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">more_vert</span>
          </button>
        </div>

        {/* Cover Image */}
        <div className="p-8">
          <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
            <img src={track.imageUrl} alt={track.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        </div>

        {/* Track Info */}
        <div className="px-8 text-center">
          <h2 className="font-serif text-2xl font-bold dark:text-white mb-2">{track.title}</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Meditação Guiada • {track.duration}</p>
        </div>

        {/* Progress Bar */}
        <div className="px-8 mb-6">
          <div 
            ref={progressBarRef}
            className="relative h-1 bg-gray-200 dark:bg-white/20 rounded-full overflow-hidden cursor-pointer"
            onClick={handleProgressClick}
          >
            <div 
              className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-primary rounded-full shadow-lg"
              style={{ left: `${progress}%`, transform: `translateX(-50%) translateY(-50%)` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(currentTime)}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="px-8 pb-8">
          <div className="flex items-center justify-center gap-6">
            <button 
              onClick={() => setIsShuffle(!isShuffle)}
              className={`${isShuffle ? 'text-primary' : 'text-gray-400'} hover:text-gray-600 dark:hover:text-gray-300 transition-colors`}
            >
              <span className="material-symbols-outlined text-3xl">shuffle</span>
            </button>
            <button 
              onClick={skipBackward}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <span className="material-symbols-outlined text-3xl">replay_30</span>
            </button>
            <button 
              onClick={togglePlay}
              className="size-16 bg-primary text-white rounded-full flex items-center justify-center shadow-xl shadow-primary/30 hover:scale-105 transition-transform"
            >
              <span className="material-symbols-outlined text-4xl filled-icon">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <button 
              onClick={skipForward}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <span className="material-symbols-outlined text-3xl">forward_30</span>
            </button>
            <button 
              onClick={() => setIsRepeat(!isRepeat)}
              className={`${isRepeat ? 'text-primary' : 'text-gray-400'} hover:text-gray-600 dark:hover:text-gray-300 transition-colors`}
            >
              <span className="material-symbols-outlined text-3xl">repeat</span>
            </button>
          </div>
        </div>

        {/* Hidden Audio Element */}
        <audio ref={audioRef} src={track.audioUrl} />
      </div>
    </div>
  );
};

export default AudioPlayer;
