import React, { useState, useEffect } from 'react';
import { X, Volume2, VolumeX } from 'lucide-react';

interface AlarmModalProps {
  taskName: string;
  onDismiss: () => void;
  isPlaying: boolean;
  onToggleAudio: () => void;
}

export const AlarmModal: React.FC<AlarmModalProps> = ({ taskName, onDismiss, isPlaying, onToggleAudio }) => {
  const [pulse, setPulse] = useState(true);

  // Pulse animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((p) => !p);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999] p-4">
      <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl max-w-md w-full shadow-2xl p-8 text-white">
        {/* Pulsing indicator */}
        <div className="flex justify-center mb-6">
          <div
            className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all duration-500 ${
              pulse ? 'scale-100 opacity-100' : 'scale-110 opacity-70'
            }`}
          >
            <div className="w-16 h-16 rounded-full border-4 border-white" />
          </div>
        </div>

        {/* Task name */}
        <h2 className="text-4xl font-bold text-center mb-4 leading-tight">{taskName}</h2>
        <p className="text-center text-lg opacity-90 mb-8">Repeating Task</p>

        {/* Audio toggle */}
        <div className="flex justify-center mb-8">
          <button
            onClick={onToggleAudio}
            className="flex items-center gap-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full px-6 py-3 transition-all"
            title={isPlaying ? 'Mute' : 'Unmute'}
          >
            {isPlaying ? (
              <>
                <Volume2 className="w-6 h-6" />
                <span>Mute</span>
              </>
            ) : (
              <>
                <VolumeX className="w-6 h-6" />
                <span>Unmute</span>
              </>
            )}
          </button>
        </div>

        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          className="w-full bg-white text-red-500 font-bold py-4 px-6 rounded-2xl text-xl hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <X className="w-6 h-6" />
          Dismiss
        </button>

        {/* Additional info */}
        <p className="text-center text-sm opacity-75 mt-6">
          Tap Dismiss to stop the alarm
        </p>
      </div>
    </div>
  );
};

export default AlarmModal;
