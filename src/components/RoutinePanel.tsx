import React, { useState, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Check, Plus, X } from 'lucide-react';
import { api } from '../api';

const RoutinePanel: React.FC = () => {
  const { routines, addRoutine, updateRoutine, deleteRoutine, people, playVoice, stopVoice, loadRoutines } = useData() as any;
  const { user } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [timeStr, setTimeStr] = useState('08:00');
  const [voiceMode, setVoiceMode] = useState<'speech' | 'person' | 'custom'>('speech');
  const [voicePersonId, setVoicePersonId] = useState<string | undefined>(undefined);
  const [customVoicePreview, setCustomVoicePreview] = useState<string | null>(null);
  const [customVoiceFile, setCustomVoiceFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [tasks, setTasks] = useState<string[]>([]);
  const [newTask, setNewTask] = useState('');

  const openEdit = (id: string) => {
    const r = routines.find((x: any) => x.id === id);
    if (!r) return;
    setEditingId(id);
    setTitle(r.title);
    const d = new Date(r.time);
    setTimeStr(d.toISOString().slice(11, 16));
    setVoiceMode(r.voiceMode || 'speech');
    setVoicePersonId(r.voicePersonId);
    setCustomVoicePreview((r as any).voiceUrl || null);
    setTasks(r.tasks?.map((t: any) => t.description) || []);
    setShowAdd(true);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    const [hh, mm] = timeStr.split(':').map(Number);
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm).getTime();
    const payload: any = {
      title: title.trim(),
      time: next,
      enabled: enabled !== false,
      repeat: 'daily',
      voiceMode,
      voicePersonId,
      tasks: tasks.map(desc => ({ description: desc, completed: false }))
    };
    (async () => {
      try {
        if (voiceMode === 'custom' && customVoiceFile && customVoicePreview) {
          payload.voiceUrl = customVoicePreview;
        }
        if (editingId) {
          updateRoutine(editingId, payload);
        } else {
          addRoutine(payload);
        }
      } catch (e) {
        console.error('Routine save error', e);
      } finally {
        setShowAdd(false);
        setEditingId(null);
        setTitle('');
        setTimeStr('08:00');
        setTasks([]);
        setCustomVoiceFile(null);
        setCustomVoicePreview(null);
      }
    })();
  };

  const handleTaskToggle = async (routineId: string, taskIndex: number, currentCompleted: boolean) => {
    try {
      await api.routineStats.completeTask(routineId, taskIndex, !currentCompleted);
      loadRoutines(); // Reload to get updated data
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, newTask.trim()]);
      setNewTask('');
    }
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const getCompletionPercentage = (routine: any) => {
    if (!routine.tasks || routine.tasks.length === 0) return 0;
    const completed = routine.tasks.filter((t: any) => t.completed).length;
    return Math.round((completed / routine.tasks.length) * 100);
  };

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <button onClick={() => { setShowAdd(true); setTasks([]); }} className="bg-emerald-500 text-white px-3 py-1 rounded">Add</button>
      </div>

      <div className="space-y-3">
        {routines.map((r: any, index: number) => {
          const completionPct = getCompletionPercentage(r);
          return (
            <div key={r.id || `routine-${index}`} className="p-3 bg-emerald-50 rounded">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <div className="font-medium">{r.title}</div>
                  <div className="text-sm text-gray-600">{new Date(r.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(r.id)} className="text-sm px-2 py-1 border rounded">Edit</button>
                  <button onClick={() => updateRoutine(r.id, { enabled: !r.enabled })} title={r.enabled ? 'Disable' : 'Enable'} className={`text-sm px-2 py-1 border rounded ${r.enabled ? 'bg-emerald-200' : ''}`}>{r.enabled ? 'On' : 'Off'}</button>
                  <button onClick={() => { if (confirm('Delete routine?')) deleteRoutine(r.id); }} className="text-sm px-2 py-1 border rounded text-red-600">Delete</button>
                </div>
              </div>

              {/* Task List */}
              {r.tasks && r.tasks.length > 0 && (
                <div className="mt-3 space-y-2">
                  {/* Progress Bar */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-emerald-500 h-2.5 rounded-full transition-all"
                        style={{ width: `${completionPct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 min-w-[3rem] text-right">{completionPct}%</span>
                  </div>

                  {/* Task Checkboxes */}
                  {r.tasks.map((task: any, taskIdx: number) => (
                    <div key={taskIdx} className="flex items-center gap-2 bg-white p-2 rounded">
                      <button
                        onClick={() => handleTaskToggle(r.id, taskIdx, task.completed)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${task.completed
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-gray-300 hover:border-emerald-400'
                          }`}
                      >
                        {task.completed && <Check className="w-4 h-4 text-white" />}
                      </button>
                      <span className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {task.description}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showAdd && (
        <div className="mt-4 bg-white rounded-lg p-4 shadow-md">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold">{editingId ? 'Edit Routine' : 'Add Routine'}</h4>
            <button onClick={() => { setShowAdd(false); setTasks([]); }} className="p-1">✕</button>
          </div>
          <div className="space-y-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" className="w-full px-3 py-2 border rounded" />
            <div className="flex gap-2">
              <input type="time" value={timeStr} onChange={(e) => setTimeStr(e.target.value)} className="px-3 py-2 border rounded" />
            </div>
            <div className="flex items-center gap-2">
              <input id="routine-enabled" type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
              <label htmlFor="routine-enabled" className="text-sm">Enable Reminder</label>
            </div>

            {/* Task Management */}
            <div className="border-t pt-3">
              <h5 className="font-semibold text-sm mb-2">Tasks (Optional)</h5>
              <div className="space-y-2 mb-2">
                {tasks.map((task, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                    <span className="flex-1 text-sm">{task}</span>
                    <button onClick={() => removeTask(idx)} className="text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  placeholder="Add a task..."
                  className="flex-1 px-3 py-2 border rounded text-sm"
                />
                <button onClick={addTask} className="px-3 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button onClick={() => { setShowAdd(false); setTasks([]); }} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-emerald-500 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutinePanel;
