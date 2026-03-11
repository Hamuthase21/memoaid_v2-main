import { useState, useRef } from 'react';
import { Type, Mic, Image as ImageIcon, Tag, Clock, Bell, Video, Play, Pause, X } from 'lucide-react';
import { Note } from '../../types';
import { useData } from '../../contexts/DataContext';
import { ReminderModal } from '../Reminders/ReminderModal';
import { AddNoteModal } from './AddNoteModal';

interface NoteCardProps {
  note: Note;
}

export const NoteCard = ({ note }: NoteCardProps) => {
  const { deleteNote } = useData();
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this memory?')) {
      deleteNote(note.id);
    }
  };

  const getIcon = () => {
    switch (note.type) {
      case 'text':
        return <Type className="w-6 h-6" />;
      case 'audio':
        return <Mic className="w-6 h-6" />;
      case 'image':
        return <ImageIcon className="w-6 h-6" />;
      case 'video':
        return <Video className="w-6 h-6" />;
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isTextOnly = note.type === 'text';

  return (
    <>
      <div className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border-2 border-gray-100 hover:border-emerald-200 relative flex flex-col cursor-pointer ${isTextOnly ? 'min-h-[140px]' : 'min-h-[260px]'}`} onClick={() => setShowViewModal(true)}>
        <div className="flex items-start justify-between mb-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
              {getIcon()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{note.title}</h3>
              <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                <Clock className="w-4 h-4" />
                <span>{formatDate(note.timestamp)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowReminderModal(true);
              }}
              className="p-1 hover:bg-emerald-50 rounded-md transition-colors text-emerald-600"
              title="Set reminder"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1">
          {note.content && note.type === 'text' && (
            <p className="text-gray-700 text-base mb-4 leading-relaxed">{note.content}</p>
          )}

          {(note.mediaUrl || (note as any).mediaData) && note.type === 'image' && (
            <img
              src={note.mediaUrl || (note as any).mediaData}
              alt={note.title}
              className="w-full rounded-xl mb-4 h-40 object-cover"
            />
          )}

          {(note.mediaUrl || (note as any).mediaData) && note.type === 'video' && (
            <div className="mb-4">
              <div className="relative rounded-xl overflow-hidden h-40">
                <video
                  className="w-full h-full object-cover"
                  src={note.mediaUrl || (note as any).mediaData}
                  controls={false}
                />
                <button onClick={() => setShowViewModal(true)} className="absolute inset-0 m-auto w-12 h-12 text-white bg-black/40 rounded-full flex items-center justify-center">
                  <Play className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}

          {(note.mediaUrl || (note as any).mediaData) && note.type === 'audio' && (
            <div className="mb-4">
              <audio ref={audioRef} src={note.mediaUrl || (note as any).mediaData} />
            </div>
          )}

          {note.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-gray-400" />
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-4">
          <div>
            {/* empty left area for balance */}
          </div>
          <div className="flex items-center gap-3">
            {note.type === 'audio' && (
              <button
                onClick={async () => {
                  if (!audioRef.current) return;
                  try {
                    if (isPlaying) {
                      audioRef.current.pause();
                      audioRef.current.currentTime = 0;
                      setIsPlaying(false);
                    } else {
                      await audioRef.current.play();
                      setIsPlaying(true);
                      audioRef.current.onended = () => setIsPlaying(false);
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="text-sm px-3 py-1 border rounded bg-white"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            )}
            {note.type === 'video' && (
              <button onClick={() => { setPreviewSrc(note.mediaUrl!); setPreviewType('video'); }} className="text-sm px-3 py-1 border rounded bg-white">Play</button>
            )}
            <button onClick={(e) => {
              e.stopPropagation();
              setShowEditModal(true);
            }} className="text-sm px-3 py-1 border rounded bg-white text-emerald-600 hover:bg-emerald-50 transition-colors">Edit</button>
            <button onClick={handleDelete} className="text-sm px-3 py-1 border rounded text-red-600 hover:bg-red-50 transition-colors">Delete</button>
          </div>
        </div>
      </div>

      {showReminderModal && (
        <ReminderModal noteId={note.id} onClose={() => setShowReminderModal(false)} />
      )}
      {showEditModal && (
        <AddNoteModal onClose={() => setShowEditModal(false)} existing={note} />
      )}
      {showViewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[70vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b-2 border-gray-100 px-5 py-3 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-800 line-clamp-1">{note.title}</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <Clock className="w-3 h-3" />
                <span>{formatDate(note.timestamp)}</span>
              </div>

              {note.content && (
                <div>
                  <p className="text-gray-700 text-sm leading-relaxed">{note.content}</p>
                </div>
              )}

              {(note.mediaUrl || (note as any).mediaData) && note.type === 'image' && (
                <div>
                  <img src={note.mediaUrl || (note as any).mediaData} alt={note.title} className="w-full rounded-lg max-h-40 object-cover" />
                </div>
              )}

              {(note.mediaUrl || (note as any).mediaData) && note.type === 'video' && (
                <div>
                  <video src={note.mediaUrl || (note as any).mediaData} controls className="w-full rounded-lg max-h-40" />
                </div>
              )}

              {(note.mediaUrl || (note as any).mediaData) && note.type === 'audio' && (
                <div>
                  <audio src={note.mediaUrl || (note as any).mediaData} controls className="w-full text-xs" />
                </div>
              )}

              {note.location && (
                <div className="text-xs text-gray-600 pt-2 border-t">
                  <span className="font-semibold">📍 {note.location}</span>
                </div>
              )}

              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2 mt-4 pt-3 border-t">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setShowEditModal(true);
                  }}
                  className="flex-1 px-3 py-2 bg-emerald-500 text-white rounded-lg font-semibold text-sm hover:bg-emerald-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
