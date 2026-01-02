import React, { useState } from 'react';
import { CalendarEvent, CalendarEventType, EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from '../types';
import { ChevronLeft, ChevronRight, Plus, Trash2, Edit2, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarProps {
  events: CalendarEvent[];
  onAddEvent: (event: CalendarEvent) => void;
  onUpdateEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (eventId: string) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ events, onAddEvent, onUpdateEvent, onDeleteEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const getEventsForDate = (date: string): CalendarEvent[] => {
    return events.filter(e => e.date === date);
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const openNewEventModal = (date?: string) => {
    setSelectedDate(date || formatDate(new Date()));
    setEditingEvent(null);
    setShowEventModal(true);
  };

  const openEditEventModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    setSelectedDate(event.date);
    setShowEventModal(true);
  };

  const handleSaveEvent = (event: CalendarEvent) => {
    if (editingEvent) {
      onUpdateEvent(event);
    } else {
      onAddEvent(event);
    }
    setShowEventModal(false);
    setEditingEvent(null);
    setSelectedDate(null);
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth(currentDate);
  const today = formatDate(new Date());

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <CalendarIcon size={28} className="text-indigo-600" />
              Calendar & Notes
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                viewMode === 'month'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => openNewEventModal()}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 shadow-md transition-colors"
            >
              <Plus size={16} /> Add Event
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'month' ? (
        /* Month View */
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Month Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4">
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePreviousMonth}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-bold text-slate-800">{monthName}</h3>
                  <button
                    onClick={handleToday}
                    className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                  >
                    Today
                  </button>
                </div>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Day headers */}
              <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-3 text-center font-bold text-sm text-slate-600">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 divide-x divide-y divide-slate-200">
                {days.map((day, idx) => {
                  const dateStr = day ? formatDate(day) : '';
                  const dayEvents = day ? getEventsForDate(dateStr) : [];
                  const isToday = dateStr === today;

                  return (
                    <div
                      key={idx}
                      className={`min-h-[120px] p-2 ${day ? 'bg-white hover:bg-slate-50 cursor-pointer' : 'bg-slate-50'} transition-colors`}
                      onClick={() => day && openNewEventModal(dateStr)}
                    >
                      {day && (
                        <>
                          <div className={`text-sm font-bold mb-2 ${isToday ? 'bg-indigo-600 text-white w-7 h-7 rounded-full flex items-center justify-center' : 'text-slate-700'}`}>
                            {day.getDate()}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 3).map(event => {
                              const colors = EVENT_TYPE_COLORS[event.eventType];
                              return (
                                <div
                                  key={event.id}
                                  className={`text-xs px-2 py-1 rounded ${colors.bg} ${colors.text} border ${colors.border} truncate cursor-pointer hover:opacity-80`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditEventModal(event);
                                  }}
                                >
                                  {event.title}
                                </div>
                              );
                            })}
                            {dayEvents.length > 3 && (
                              <div className="text-xs text-slate-500 px-2">
                                +{dayEvents.length - 3} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-3">
            {events.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <CalendarIcon size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-600 mb-2">No events yet</h3>
                <p className="text-slate-500 mb-4">Start tracking important dates like deep cleans, birthdays, and audits</p>
                <button
                  onClick={() => openNewEventModal()}
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700"
                >
                  <Plus size={16} /> Add Your First Event
                </button>
              </div>
            ) : (
              events
                .sort((a, b) => a.date.localeCompare(b.date))
                .map(event => {
                  const colors = EVENT_TYPE_COLORS[event.eventType];
                  const eventDate = new Date(event.date + 'T00:00:00');
                  const isPast = event.date < today;

                  return (
                    <div
                      key={event.id}
                      className={`bg-white rounded-xl shadow-sm border-l-4 ${colors.border} p-4 hover:shadow-md transition-shadow ${isPast ? 'opacity-60' : ''}`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text}`}>
                              {EVENT_TYPE_LABELS[event.eventType]}
                            </span>
                            <span className="text-sm text-slate-500 font-medium">
                              {eventDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-slate-800 mb-1">{event.title}</h4>
                          {event.description && (
                            <p className="text-slate-600 text-sm">{event.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditEventModal(event)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this event?')) {
                                onDeleteEvent(event.id);
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && (
        <EventModal
          event={editingEvent}
          initialDate={selectedDate || formatDate(new Date())}
          onSave={handleSaveEvent}
          onClose={() => {
            setShowEventModal(false);
            setEditingEvent(null);
            setSelectedDate(null);
          }}
        />
      )}
    </div>
  );
};

// Event Modal Component
interface EventModalProps {
  event: CalendarEvent | null;
  initialDate: string;
  onSave: (event: CalendarEvent) => void;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, initialDate, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date || initialDate,
    eventType: event?.eventType || 'other' as CalendarEventType,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    const newEvent: CalendarEvent = {
      id: event?.id || String(Date.now()),
      title: formData.title,
      description: formData.description,
      date: formData.date,
      eventType: formData.eventType,
    };

    onSave(newEvent);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-800">
            {event ? 'Edit Event' : 'New Event'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Deep Clean - Produce Cooler"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Event Type *</label>
            <select
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value as CalendarEventType })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Notes (optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add any additional details..."
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
            >
              {event ? 'Update Event' : 'Create Event'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
