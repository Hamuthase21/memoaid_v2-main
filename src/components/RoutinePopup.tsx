import React from 'react';
import { X } from 'lucide-react';
import { useData } from '../contexts/DataContext';

const RoutinePopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { routines, people } = useData() as any;

  const morning = routines.filter((r: any) => {
    const d = new Date(r.time);
    return d.getHours() < 12;
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Morning Routine</h3>
          <button onClick={onClose} className="p-1"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          {morning.length === 0 ? (
            <p className="text-gray-600">No morning tasks set.</p>
          ) : (
            <ul className="space-y-2">
              {morning.map((r: any) => (
                <li key={r.id} className="p-3 bg-emerald-50 rounded flex items-center justify-between">
                  <div>
                    <div className="font-medium">{r.title}</div>
                    <div className="text-sm text-gray-600">{new Date(r.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{r.personId ? ` • ${people.find((p:any)=>p.id===r.personId)?.name}` : ''}</div>
                  </div>
                  <div className="text-sm text-gray-700">{r.enabled ? 'On' : 'Off'}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutinePopup;
