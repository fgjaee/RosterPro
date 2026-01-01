import React, { useState } from 'react';
import { Trash2, Plus, X } from 'lucide-react';

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

interface VisualShiftEditorProps {
  shifts: Shift[];
  onUpdateShifts: (shifts: Shift[]) => void;
}

const DAYS: Array<keyof Shift> = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_LABELS = { sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat' };

const COMMON_SHIFTS = [
  { label: 'OFF', value: 'OFF', color: 'bg-gray-100 text-gray-500' },
  { label: '4a-12p', value: '4:00-12:00', color: 'bg-green-100 text-green-700' },
  { label: '5a-1p', value: '5:00-1:00', color: 'bg-green-100 text-green-700' },
  { label: '6a-2p', value: '6:00-2:00', color: 'bg-green-100 text-green-700' },
  { label: '7a-3p', value: '7:00-3:00', color: 'bg-green-100 text-green-700' },
  { label: '8a-4p', value: '8:00-4:00', color: 'bg-blue-100 text-blue-700' },
  { label: '10a-6p', value: '10:00-6:00', color: 'bg-blue-100 text-blue-700' },
  { label: '11a-7p', value: '11:00-7:00', color: 'bg-purple-100 text-purple-700' },
  { label: '12p-8p', value: '12:00-8:00', color: 'bg-purple-100 text-purple-700' },
  { label: '1p-9p', value: '1:00-9:00', color: 'bg-purple-100 text-purple-700' },
  { label: '11p-6a', value: '11:00-6:00', color: 'bg-indigo-100 text-indigo-700' },
  { label: 'LOAN', value: 'LOANED OUT', color: 'bg-amber-100 text-amber-700' },
];

export const VisualShiftEditor: React.FC<VisualShiftEditorProps> = ({
  shifts,
  onUpdateShifts
}) => {
  const [editModal, setEditModal] = useState<{ open: boolean; empIndex: number; day: keyof Shift } | null>(null);
  const [customInput, setCustomInput] = useState('');

  const updateShift = (empIndex: number, day: keyof Shift, value: string) => {
    const newShifts = [...shifts];
    newShifts[empIndex] = { ...newShifts[empIndex], [day]: value };
    onUpdateShifts(newShifts);
    setEditModal(null);
    setCustomInput('');
  };

  const addEmployee = () => {
    const name = prompt("Employee Name:");
    if (name) {
      const newEmployee: Shift = {
        id: Date.now().toString(),
        name,
        role: 'Associate',
        sun: 'OFF',
        mon: 'OFF',
        tue: 'OFF',
        wed: 'OFF',
        thu: 'OFF',
        fri: 'OFF',
        sat: 'OFF'
      };
      onUpdateShifts([...shifts, newEmployee]);
    }
  };

  const removeEmployee = (index: number) => {
    if (confirm(`Remove ${shifts[index].name} from schedule?`)) {
      onUpdateShifts(shifts.filter((_, i) => i !== index));
    }
  };

  const getShiftStyle = (value: string) => {
    const preset = COMMON_SHIFTS.find(s => s.value === value);
    if (preset) return preset.color;
    // Custom shifts
    if (value === 'OFF' || !value) return 'bg-gray-100 text-gray-500';
    if (value.includes('LOAN')) return 'bg-amber-100 text-amber-700';
    return 'bg-indigo-100 text-indigo-700';
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center bg-slate-50">
        <h2 className="font-bold text-slate-800 text-lg">Visual Shift Editor</h2>
        <button
          onClick={addEmployee}
          className="flex items-center gap-1 text-blue-600 font-bold hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
        >
          <Plus size={18} /> Add Row
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-slate-100 font-bold sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="p-3 bg-white border-r border-b sticky left-0 z-20 text-left min-w-[180px]">Name</th>
              {DAYS.map(d => (
                <th key={d} className="p-3 border-r border-b min-w-[100px] text-center capitalize">
                  {DAY_LABELS[d]}
                </th>
              ))}
              <th className="p-3 border-b"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {shifts.map((emp, i) => (
              <tr key={emp.id} className="hover:bg-slate-50">
                <td className="p-3 border-r font-bold sticky left-0 bg-white z-10">
                  {emp.name}
                  <div className="text-[10px] text-slate-400 font-normal uppercase tracking-wide">
                    {emp.role}
                  </div>
                </td>
                {DAYS.map(d => {
                  const val = emp[d];
                  return (
                    <td
                      key={d}
                      className="p-1 border-r cursor-pointer hover:ring-2 hover:ring-blue-300 hover:ring-inset transition-all"
                      onClick={() => setEditModal({ open: true, empIndex: i, day: d })}
                    >
                      <div className={`p-2 rounded text-center text-xs font-bold ${getShiftStyle(val)}`}>
                        {val === 'OFF' ? '-' : val}
                      </div>
                    </td>
                  );
                })}
                <td className="p-2 text-center">
                  <button
                    onClick={() => removeEmployee(i)}
                    className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editModal?.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Select Shift</h3>
              <button
                onClick={() => setEditModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Shift Presets */}
            <div className="p-4 grid grid-cols-2 gap-2">
              {COMMON_SHIFTS.map(s => (
                <button
                  key={s.label}
                  onClick={() => updateShift(editModal.empIndex, editModal.day, s.value)}
                  className={`p-3 rounded text-sm font-bold border-2 border-transparent hover:border-blue-400 transition-all ${s.color}`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="p-4 border-t bg-slate-50 flex gap-2">
              <input
                className="flex-1 border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. 9:00-5:00"
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && customInput) {
                    updateShift(editModal.empIndex, editModal.day, customInput);
                  }
                }}
              />
              <button
                onClick={() => {
                  if (customInput) {
                    updateShift(editModal.empIndex, editModal.day, customInput);
                  }
                }}
                className="bg-slate-800 hover:bg-slate-900 text-white px-4 rounded font-bold text-sm transition-colors"
              >
                Set
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
