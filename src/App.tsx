import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Download, 
  Copy,
  Clock, 
  MapPin, 
  Check,
  Flame,
  BarChart2,
  List
} from 'lucide-react';

interface Run {
  id: string;
  title: string;
  date: string;
  distanceKm: number;
  durationMins: number;
  type: 'Easy' | 'Tempo' | 'Interval' | 'Long' | 'Race';
  completed: boolean;
  notes?: string;
  week: number;
}

const DEFAULT_RUNS: Run[] = [
  { id: '1', title: 'Easy Recovery Run', date: '2026-08-10', distanceKm: 5, durationMins: 30, type: 'Easy', completed: true, week: 1, notes: 'Felt light and steady.' },
  { id: '2', title: 'Tempo Session', date: '2026-08-12', distanceKm: 8, durationMins: 45, type: 'Tempo', completed: false, week: 1, notes: 'Target 5:30 min/km pace.' },
  { id: '3', title: 'Sunday Long Run', date: '2026-08-16', distanceKm: 14, durationMins: 85, type: 'Long', completed: false, week: 1, notes: 'Keep HR in zone 2.' },
  { id: '4', title: 'Speed Intervals', date: '2026-08-18', distanceKm: 7, durationMins: 40, type: 'Interval', completed: false, week: 2, notes: '6x 400m intervals.' },
  { id: '5', title: 'Easy Mid-week Run', date: '2026-08-20', distanceKm: 6, durationMins: 36, type: 'Easy', completed: false, week: 2 },
  { id: '6', title: 'Weekend Long Run', date: '2026-08-23', distanceKm: 16, durationMins: 98, type: 'Long', completed: false, week: 2 },
];

export default function App() {
  const [runs, setRuns] = useState<Run[]>(() => {
    const saved = localStorage.getItem('mmr_runs');
    return saved ? JSON.parse(saved) : DEFAULT_RUNS;
  });

  const [activeTab, setActiveTab] = useState<'plan' | 'upcoming' | 'previous'>('plan');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [durationMins, setDurationMins] = useState('');
  const [type, setType] = useState<Run['type']>('Easy');
  const [week, setWeek] = useState('1');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    localStorage.getItem('mmr_runs');
    localStorage.setItem('mmr_runs', JSON.stringify(runs));
  }, [runs]);

  const toggleComplete = (id: string) => {
    setRuns(prev => prev.map(run => run.id === id ? { ...run, completed: !run.completed } : run));
  };

  const deleteRun = (id: string) => {
    setRuns(prev => prev.filter(run => run.id !== id));
  };

  const handleAddRun = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    const newRun: Run = {
      id: Date.now().toString(),
      title,
      date,
      distanceKm: parseFloat(distanceKm) || 0,
      durationMins: parseInt(durationMins, 10) || 0,
      type,
      week: parseInt(week, 10) || 1,
      completed: false,
      notes: notes || undefined
    };

    setRuns(prev => [...prev, newRun]);
    setShowAddModal(false);
    setTitle(''); setDate(''); setDistanceKm(''); setDurationMins(''); setType('Easy'); setWeek('1'); setNotes('');
  };

  // Export single run to iCal (.ics)
  const exportToICal = (run: Run) => {
    const formatDate = (d: string) => d.replace(/-/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MMR Running Hub//NONSGML v1.0//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${run.type} Run: ${run.title}`,
      `DESCRIPTION:${run.distanceKm} km | ${run.durationMins} mins\\n${run.notes || ''}`,
      `DTSTART;VALUE=DATE:${formatDate(run.date)}`,
      `DTEND;VALUE=DATE:${formatDate(run.date)}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${run.title.toLowerCase().replace(/\s+/g, '-')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy run details to clipboard
  const copyRunDetails = (run: Run) => {
    const text = `🏃 ${run.title}\n📅 Date: ${run.date} (Week ${run.week})\n🎯 Type: ${run.type}\n📏 Distance: ${run.distanceKm} km\n⏱️ Duration: ${run.durationMins} mins${run.notes ? `\n📝 Notes: ${run.notes}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(run.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper function to group runs by Week
  const groupRunsByWeek = (runsList: Run[]) => {
    return runsList.reduce((grouped: { [key: number]: Run[] }, run) => {
      const w = run.week || 1;
      if (!grouped[w]) grouped[w] = [];
      grouped[w].push(run);
      return grouped;
    }, {});
  };

  const getTypeBadgeColor = (runType: Run['type']) => {
    switch (runType) {
      case 'Easy': return 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80';
      case 'Tempo': return 'bg-amber-950/80 text-amber-400 border-amber-800/80';
      case 'Interval': return 'bg-rose-950/80 text-rose-400 border-rose-800/80';
      case 'Long': return 'bg-indigo-950/80 text-indigo-400 border-indigo-800/80';
      case 'Race': return 'bg-purple-950/80 text-purple-400 border-purple-800/80';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const upcomingRuns = runs.filter(r => !r.completed);
  const previousRuns = runs.filter(r => r.completed);

  const renderRunCard = (run: Run) => (
    <div key={run.id} className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 flex items-start justify-between shadow-sm transition-all hover:border-slate-700">
      <div className="flex items-start space-x-3.5 flex-1 pr-2">
        <button 
          onClick={() => toggleComplete(run.id)}
          className={`mt-0.5 transition-colors ${run.completed ? 'text-emerald-500' : 'text-slate-600 hover:text-slate-400'}`}
          title={run.completed ? "Mark as pending" : "Mark as completed"}
        >
          <CheckCircle2 className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className={`font-semibold text-sm ${run.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>{run.title}</h4>
            <span className={`text-[11px] px-2 py-0.5 border rounded-md font-medium ${getTypeBadgeColor(run.type)}`}>
              {run.type}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
            <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" /> {run.date}</span>
            <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" /> {run.distanceKm} km</span>
            <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-slate-500" /> {run.durationMins} mins</span>
          </div>

          {run.notes && (
            <p className="text-xs text-slate-400 mt-2.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
              {run.notes}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-1">
        <button 
          onClick={() => copyRunDetails(run)} 
          className="text-slate-500 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          title="Copy details"
        >
          {copiedId === run.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
        <button 
          onClick={() => exportToICal(run)} 
          className="text-slate-500 hover:text-blue-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          title="Export to Calendar (.ics)"
        >
          <Download className="w-4 h-4" />
        </button>
        <button 
          onClick={() => deleteRun(run.id)} 
          className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          title="Delete run"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
            MMR Running Hub
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Training & Progress Tracker</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center shadow-lg shadow-blue-900/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Run
        </button>
      </header>

      {/* Navigation Tabs */}
      <nav className="flex space-x-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80 mb-6">
        <button 
          onClick={() => setActiveTab('plan')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === 'plan' ? 'bg-slate-800 text-blue-400 shadow' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Whole Plan ({runs.length})
        </button>
        <button 
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === 'upcoming' ? 'bg-slate-800 text-blue-400 shadow' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Upcoming ({upcomingRuns.length})
        </button>
        <button 
          onClick={() => setActiveTab('previous')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === 'previous' ? 'bg-slate-800 text-blue-400 shadow' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Previous ({previousRuns.length})
        </button>
      </nav>

      {/* WHOLE PLAN TAB */}
      {activeTab === 'plan' && (
        <div className="space-y-6">
          {Object.entries(groupRunsByWeek(runs)).map(([weekNum, weekRuns]) => (
            <div key={`plan-week-${weekNum}`} className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Week {weekNum}</h3>
                <span className="text-[11px] bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full border border-slate-700/50">
                  {weekRuns.length} {weekRuns.length === 1 ? 'run' : 'runs'}
                </span>
              </div>
              <div className="space-y-3">
                {weekRuns.map(renderRunCard)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPCOMING RUNS TAB */}
      {activeTab === 'upcoming' && (
        <div className="space-y-6">
          {Object.keys(groupRunsByWeek(upcomingRuns)).length === 0 ? (
            <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800/50 p-6">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-80" />
              <p className="text-slate-300 font-medium text-sm">All caught up!</p>
              <p className="text-slate-500 text-xs mt-1">No upcoming runs pending in your schedule.</p>
            </div>
          ) : (
            Object.entries(groupRunsByWeek(upcomingRuns)).map(([weekNum, weekRuns]) => (
              <div key={`upcoming-week-${weekNum}`} className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Week {weekNum}</h3>
                  <span className="text-[11px] bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full border border-slate-700/50">
                    {weekRuns.length} {weekRuns.length === 1 ? 'run' : 'runs'}
                  </span>
                </div>
                <div className="space-y-3">
                  {weekRuns.map(renderRunCard)}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* PREVIOUS RUNS TAB */}
      {activeTab === 'previous' && (
        <div className="space-y-6">
          {Object.keys(groupRunsByWeek(previousRuns)).length === 0 ? (
            <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800/50 p-6">
              <Clock className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-slate-300 font-medium text-sm">No completed runs yet</p>
              <p className="text-slate-500 text-xs mt-1">Mark runs as complete to track your history here.</p>
            </div>
          ) : (
            Object.entries(groupRunsByWeek(previousRuns)).map(([weekNum, weekRuns]) => (
              <div key={`previous-week-${weekNum}`} className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Week {weekNum}</h3>
                  <span className="text-[11px] bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full border border-slate-700/50">
                    {weekRuns.length} {weekRuns.length === 1 ? 'run' : 'runs'}
                  </span>
                </div>
                <div className="space-y-3">
                  {weekRuns.map(renderRunCard)}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Run Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100">Add New Run</h3>
            <form onSubmit={handleAddRun} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">Title</label>
                <input 
                  type="text" required value={title} onChange={e => setTitle(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. Easy Recovery Run"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Date</label>
                  <input 
                    type="date" required value={date} onChange={e => setDate(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Week #</label>
                  <input 
                    type="number" min="1" value={week} onChange={e => setWeek(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Distance (km)</label>
                  <input 
                    type="number" step="0.1" value={distanceKm} onChange={e => setDistanceKm(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Duration (min)</label>
                  <input 
                    type="number" value={durationMins} onChange={e => setDurationMins(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Type</label>
                  <select 
                    value={type} onChange={e => setType(e.target.value as Run['type'])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Tempo">Tempo</option>
                    <option value="Interval">Interval</option>
                    <option value="Long">Long</option>
                    <option value="Race">Race</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">Notes (Optional)</label>
                <textarea 
                  value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button 
                  type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-xs font-semibold transition-colors shadow-lg shadow-blue-900/30"
                >
                  Save Run
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
