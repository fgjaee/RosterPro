import React, { useState } from 'react';
import { Clock, Trash2, Plus } from 'lucide-react';

interface Shift {
  id: string;
  name: string;
  role: string;
  sun: string;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
}

interface TouchSchedulerProps {
  shifts: Shift[];
  onUpdateShifts: (shifts: Shift[]) => void;
}

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Common shift presets - Big touch buttons
const SHIFT_PRESETS = [
  { label: 'OFF', value: 'OFF' },
  { label: '12AM-8AM', value: '12:00AM-8:00AM' },
  { label: '1AM-9AM', value: '1:00AM-9:00AM' },
  { label: '4AM-12PM', value: '4:00AM-12:00PM' },
  { label: '5AM-1PM', value: '5:00AM-1:00PM' },
  { label: '7AM-3PM', value: '7:00AM-3:00PM' },
  { label: '11:30AM-7PM', value: '11:30AM-7:00PM' },
  { label: '1PM-9PM', value: '1:00PM-9:00PM' },
];

export const TouchScheduler: React.FC<TouchSchedulerProps> = ({
  shifts,
  onUpdateShifts
}) => {
  const [editingCell, setEditingCell] = useState<{ personId: string; day: string } | null>(null);
  const [editingPerson, setEditingPerson] = useState<string | null>(null);

  const updateShift = (personId: string, day: string, value: string) => {
    const updated = shifts.map(shift =>
      shift.id === personId ? { ...shift, [day]: value } : shift
    );
    onUpdateShifts(updated);
    setEditingCell(null);
  };

  const copyShiftAcrossWeek = (personId: string, shift: string) => {
    const updated = shifts.map(s =>
      s.id === personId
        ? { ...s, sun: shift, mon: shift, tue: shift, wed: shift, thu: shift, fri: shift, sat: shift }
        : s
    );
    onUpdateShifts(updated);
  };

  return (
    <div className="space-y-4">
      {/* Mobile-optimized: One person at a time */}
      <div className="space-y-6">
        {shifts.map((person) => (
          <div key={person.id} className="bg-white rounded-lg shadow-md p-4">
            {/* Person Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b">
              <div>
                <h3 className="text-xl font-bold">{person.name}</h3>
                <p className="text-sm text-gray-500">{person.role}</p>
              </div>
              <button
                onClick={() => setEditingPerson(editingPerson === person.id ? null : person.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg min-h-[48px] min-w-[100px]"
              >
                {editingPerson === person.id ? 'Done' : 'Edit'}
              </button>
            </div>

            {/* Days Grid */}
            {editingPerson === person.id ? (
              <div className="space-y-3">
                {/* Quick Fill - Copy shift across all days */}
                <div className="pb-3 border-b">
                  <p className="text-sm font-medium mb-2">Quick Fill (applies to all days):</p>
                  <div className="grid grid-cols-2 gap-2">
                    {SHIFT_PRESETS.slice(0, 4).map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => copyShiftAcrossWeek(person.id, preset.value)}
                        className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 min-h-[56px] text-base font-medium"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Individual Days */}
                {DAYS.map((day, idx) => (
                  <div key={day} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-lg">{DAY_LABELS[idx]}</span>
                      <span className="text-blue-600 font-mono">
                        {person[day as keyof Shift]}
                      </span>
                    </div>
                    
                    {editingCell?.personId === person.id && editingCell?.day === day ? (
                      <div className="grid grid-cols-2 gap-2">
                        {SHIFT_PRESETS.map((preset) => (
                          <button
                            key={preset.value}
                            onClick={() => updateShift(person.id, day, preset.value)}
                            className={`px-3 py-3 rounded-lg min-h-[56px] text-base font-medium ${
                              person[day as keyof Shift] === preset.value
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                        <button
                          onClick={() => setEditingCell(null)}
                          className="col-span-2 px-3 py-2 bg-gray-300 rounded-lg min-h-[48px]"
                        >
                          Close
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingCell({ personId: person.id, day })}
                        className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-left min-h-[56px] flex items-center justify-between"
                      >
                        <span>Change</span>
                        <Clock size={20} className="text-blue-600" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Collapsed View */
              <div className="grid grid-cols-7 gap-1 text-center">
                {DAYS.map((day, idx) => (
                  <div key={day}>
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      {DAY_LABELS[idx]}
                    </div>
                    <div className={`text-xs py-2 rounded ${
                      person[day as keyof Shift] === 'OFF' 
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-green-100 text-green-700 font-medium'
                    }`}>
                      {person[day as keyof Shift] === 'OFF' 
                        ? 'OFF' 
                        : person[day as keyof Shift].split('-')[0]
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};