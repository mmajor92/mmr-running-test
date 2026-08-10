import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  Activity, 
  Clock, 
  MapPin, 
  Flame,
  Award,
  BarChart2,
  RefreshCw
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

  // New Run Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [durationMins, setDurationMins] = useState('');
  const [type, setType] = useState<Run['type']>('Easy');
  const [week, setWeek] = useState('1');
  const [notes, setNotes] = useState('');

  useEffect(() => {
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
    // Reset Form
    setTitle(''); setDate(''); setDistanceKm(''); setDurationMins(''); setType('Easy'); setWeek('1'); setNotes('');
  };

  // Grouping helper
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
      case 'Easy': return 'bg-emerald-950 text-emerald-400 border-emerald-800';
      case 'Tempo': return 'bg-amber-950 text-amber-400 border-amber-800';
      case 'Interval': return 'bg-rose-950 text-rose-400 border-rose-800';
      case 'Long': return 'bg-indigo-950 text-indigo-400 border-indigo-800';
      case 'Race': return 'bg-purple-950 text-purple-400 border-purple-800';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const upcomingRuns = runs.filter(r => !r.completed);
  const previousRuns = runs.filter(r => r.completed);

  const renderRunCard = (run: Run) => (
    <div key={run.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
      <div className="flex items-start space-x-3">
        <button 
          onClick={() => toggleComplete(run.id)}
          className={`mt-1 transition-colors ${run.completed ? 'text-emerald-500' : 'text-slate-600 hover:text-slate-400'}`}
        >
          <CheckCircle2 className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center space-x-2">
            <h4 className={`font-semibold ${run.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>{run.title}</h4>
            <span className={`text-xs px-2 py-0.5 border rounded-md font-medium ${getTypeBadgeColor(run.type)}`}>
              {run.type}
            </span>
          </div>
          <div className="flex items-center space-x-4 mt-2 text-xs text-slate-400">
            <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {run.date}</span>
            <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" /> {run.distanceKm} km</span>
            <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {run.durationMins} mins</span>
          </div>
          {run.notes && <p className="text-xs text-slate-400 mt-2 bg-slate-950 p-2 rounded border border-slate-800">{run.notes}</p>}
        </div>
      </div>
      <button onClick={() => deleteRun(run.id)} className="text-slate-600 hover:text-rose-400 p-2">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            MMR Running Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">Training & Progress Tracker</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center shadow-lg transition-colors"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Run
        </button>
      </header>

      {/* Navigation Tabs */}
      <nav className="flex space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800 mb-6">
        <button 
          onClick={() => setActiveTab('plan')}
          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'plan' ? 'bg-slate-800 text-blue-400 shadow' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Whole Plan
        </button>
        <button 
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'upcoming' ? 'bg-slate-800 text-blue-400 shadow' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Upcoming ({upcomingRuns.length})
        </button>
        <button 
          onClick={() => setActiveTab('previous')}
          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'previous' ? 'bg-slate-800 text-blue-400 shadow' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Previous ({previousRuns.length})
        </button>
      </nav>

      {/* WHOLE PLAN TAB */}
      {activeTab === 'plan' && (
        <div className="space-y-6">
          {Object.entries(groupRunsByWeek(runs)).map(([weekNum, weekRuns]) => (
            <div key={`plan-week-${weekNum}`} className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-base font-bold text-slate-200">Week {weekNum}</h3>
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
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
            <p className="text-slate-400 text-center py-8 text-sm">No upcoming runs.</p>
          ) : (
            Object.entries(groupRunsByWeek(upcomingRuns)).map(([weekNum, weekRuns]) => (
              <div key={`upcoming-week-${weekNum}`} className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-base font-bold text-slate-200">Week {weekNum}</h3>
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
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
            <p className="text-slate-400 text-center py-8 text-sm">No completed or past runs.</p>
          ) : (
            Object.entries(groupRunsByWeek(previousRuns)).map(([weekNum, weekRuns]) => (
              <div key={`previous-week-${weekNum}`} className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-base font-bold text-slate-200">Week {weekNum}</h3>
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
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
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Add New Run</h3>
            <form onSubmit={handleAddRun} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Title</label>
                <input 
                  type="text" required value={title} onChange={e => setTitle(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Easy Recovery Run"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Date</label>
                  <input 
                    type="date" required value={date} onChange={e => setDate(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Week #</label>
                  <input 
                    type="number" min="1" value={week} onChange={e => setWeek(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Distance (km)</label>
                  <input 
                    type="number" step="0.1" value={distanceKm} onChange={e => setDistanceKm(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Duration (min)</label>
                  <input 
                    type="number" value={durationMins} onChange={e => setDurationMins(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Type</label>
                  <select 
                    value={type} onChange={e => setType(e.target.value as Run['type'])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
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
                <label className="text-xs text-slate-400 block mb-1">Notes (Optional)</label>
                <textarea 
                  value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button 
                  type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
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
