import React, { useState, useRef } from 'react';

interface RecorderProps {
  onRecorded: (blob: Blob) => void;
}

const RecorderControl: React.FC<RecorderProps> = ({ onRecorded }) => {
  const [recording, setRecording] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        chunksRef.current = [];
        onRecorded(blob);
      };
      mediaRef.current = mr;
      mr.start();
      setRecording(true);
    } catch (e) {
      console.error('Recorder start failed', e);
    }
  };

  const stop = () => {
    if (mediaRef.current && mediaRef.current.state !== 'inactive') {
      mediaRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className="flex gap-2">
      {!recording ? (
        <button type="button" onClick={start} className="px-3 py-2 bg-emerald-500 text-white rounded">Record</button>
      ) : (
        <button type="button" onClick={stop} className="px-3 py-2 bg-red-500 text-white rounded">Stop</button>
      )}
    </div>
  );
};

export default RecorderControl;
