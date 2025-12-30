import React, { useState } from 'react';
import { Save, FolderOpen, Trash2, Calendar } from 'lucide-react';

interface ScheduleTemplate {
  id: string;
  name: string;
  scheduleData: any;
  createdAt: string;
}

interface ScheduleTemplatesProps {
  currentSchedule: any;
  onLoadTemplate: (schedule: any) => void;
}

export const ScheduleTemplates: React.FC<ScheduleTemplatesProps> = ({
  currentSchedule,
  onLoadTemplate
}) => {
  const [templates, setTemplates] = useState<ScheduleTemplate[]>(() => {
    const saved = localStorage.getItem('schedule_templates');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const saveTemplate = () => {
    if (!templateName.trim()) return;
    
    const newTemplate: ScheduleTemplate = {
      id: Date.now().toString(),
      name: templateName,
      scheduleData: currentSchedule,
      createdAt: new Date().toISOString()
    };

    const updated = [...templates, newTemplate];
    setTemplates(updated);
    localStorage.setItem('schedule_templates', JSON.stringify(updated));
    
    setTemplateName('');
    setShowSaveDialog(false);
    alert('Template saved!');
  };

  const loadTemplate = (template: ScheduleTemplate) => {
    if (confirm(`Load template "${template.name}"? This will replace the current schedule.`)) {
      onLoadTemplate(template.scheduleData);
      setShowLoadDialog(false);
      alert('Template loaded!');
    }
  };

  const deleteTemplate = (id: string) => {
    if (confirm('Delete this template?')) {
      const updated = templates.filter(t => t.id !== id);
      setTemplates(updated);
      localStorage.setItem('schedule_templates', JSON.stringify(updated));
    }
  };

  const loadLastWeek = () => {
    const lastWeek = localStorage.getItem('smartRoster_schedule_v7');
    if (lastWeek && confirm('Load last week\'s schedule?')) {
      onLoadTemplate(JSON.parse(lastWeek));
      alert('Last week\'s schedule loaded!');
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowSaveDialog(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-medium min-h-[56px]"
        >
          <Save size={24} />
          Save as Template
        </button>

        <button
          onClick={() => setShowLoadDialog(true)}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg font-medium min-h-[56px]"
        >
          <FolderOpen size={24} />
          Load Template
        </button>

        <button
          onClick={loadLastWeek}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-lg font-medium min-h-[56px]"
        >
          <Calendar size={24} />
          Load Last Week
        </button>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Save Template</h3>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Template name (e.g., 'Normal Week', 'Holiday Schedule')"
              className="w-full px-4 py-3 text-lg border rounded-lg mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={saveTemplate}
                disabled={!templateName.trim()}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-lg min-h-[56px]"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setTemplateName('');
                }}
                className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-lg min-h-[56px]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <h3 className="text-xl font-bold mb-4">Load Template</h3>
            
            {templates.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No templates saved yet</p>
            ) : (
              <div className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-lg">{template.name}</h4>
                      <p className="text-sm text-gray-500">
                        Saved {new Date(template.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadTemplate(template)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 min-h-[48px] min-w-[80px]"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="p-2 bg-red-600 text-white rounded hover:bg-red-700 min-h-[48px] min-w-[48px]"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowLoadDialog(false)}
              className="w-full mt-4 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-lg min-h-[56px]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};