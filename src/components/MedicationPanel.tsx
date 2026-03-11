import React, { useState, useEffect } from 'react';
import { Pill, Plus, X, Clock, Calendar, Trash2, Edit2, Check } from 'lucide-react';
import { api } from '../api';

interface Medication {
    _id: string;
    name: string;
    dosage: string;
    frequency: string;
    times: number[];
    photoUrl: string;
    notes: string;
    refillDate?: Date;
    enabled: boolean;
    lastTaken?: Date;
}

export const MedicationPanel: React.FC = () => {
    const [medications, setMedications] = useState<Medication[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        dosage: '',
        frequency: '',
        times: [] as number[],
        notes: '',
        refillDate: '',
    });

    useEffect(() => {
        loadMedications();
    }, []);

    const loadMedications = async () => {
        try {
            const data = await api.medications.getAll();
            setMedications(data);
        } catch (error) {
            console.error('Error loading medications:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                refillDate: formData.refillDate ? new Date(formData.refillDate) : undefined,
            };

            if (editingId) {
                await api.medications.update(editingId, payload);
            } else {
                await api.medications.create(payload);
            }

            setShowForm(false);
            setEditingId(null);
            setFormData({ name: '', dosage: '', frequency: '', times: [], notes: '', refillDate: '' });
            loadMedications();
        } catch (error) {
            console.error('Error saving medication:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this medication?')) {
            try {
                await api.medications.delete(id);
                loadMedications();
            } catch (error) {
                console.error('Error deleting medication:', error);
            }
        }
    };

    const handleMarkTaken = async (id: string) => {
        try {
            await api.medications.markTaken(id);
            loadMedications();
        } catch (error) {
            console.error('Error marking medication as taken:', error);
        }
    };

    const startEdit = (med: Medication) => {
        setEditingId(med._id);
        setFormData({
            name: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            times: med.times,
            notes: med.notes,
            refillDate: med.refillDate ? new Date(med.refillDate).toISOString().split('T')[0] : '',
        });
        setShowForm(true);
    };

    const formatLastTaken = (lastTaken?: Date) => {
        if (!lastTaken) return 'Never';
        const date = new Date(lastTaken);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Pill className="w-5 h-5 text-blue-600" />
                    Medications
                </h3>
                <button
                    onClick={() => {
                        setShowForm(true);
                        setEditingId(null);
                        setFormData({ name: '', dosage: '', frequency: '', times: [], notes: '', refillDate: '' });
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Medication
                </button>
            </div>

            {/* Medication List */}
            <div className="space-y-3">
                {medications.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <Pill className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No medications added yet</p>
                        <p className="text-sm text-gray-400 mt-1">Click "Add Medication" to get started</p>
                    </div>
                ) : (
                    medications.map((med) => (
                        <div
                            key={med._id}
                            className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-100"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h4 className="font-bold text-lg text-gray-800">{med.name}</h4>
                                    {med.dosage && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            <span className="font-semibold">Dosage:</span> {med.dosage}
                                        </p>
                                    )}
                                    {med.frequency && (
                                        <p className="text-sm text-gray-600">
                                            <span className="font-semibold">Frequency:</span> {med.frequency}
                                        </p>
                                    )}
                                    {med.notes && (
                                        <p className="text-xs text-gray-500 mt-2 italic">{med.notes}</p>
                                    )}
                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Last taken: {formatLastTaken(med.lastTaken)}
                                        </span>
                                        {med.refillDate && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Refill: {new Date(med.refillDate).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleMarkTaken(med._id)}
                                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                        title="Mark as taken"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => startEdit(med)}
                                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(med._id)}
                                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add/Edit Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">
                                {editingId ? 'Edit Medication' : 'Add Medication'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingId(null);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Medication Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Aspirin"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Dosage
                                </label>
                                <input
                                    type="text"
                                    value={formData.dosage}
                                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., 1 tablet, 5ml"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Frequency
                                </label>
                                <input
                                    type="text"
                                    value={formData.frequency}
                                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Twice daily, Every 6 hours"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Refill Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.refillDate}
                                    onChange={(e) => setFormData({ ...formData, refillDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={3}
                                    placeholder="Any special instructions..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingId(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    {editingId ? 'Update' : 'Add'} Medication
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicationPanel;
