import React, { useState, useEffect } from 'react';
import { CalendarDays, Upload, List, Download } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import Calendar from './components/Calendar';
import ActivityList from './components/ActivityList';
import UpdatePage from './components/UpdatePage';
import { Activity, AmiliaResponse, ActivityOccurrence } from './types';
import { generateOccurrences } from './utils/dateUtils';
import { downloadIcsFile } from './utils/icsUtils';

const App: React.FC = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [occurrences, setOccurrences] = useState<ActivityOccurrence[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'update'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    // Load example data on component mount
    handleExampleData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(jsonInput) as AmiliaResponse;
      const sortedActivities = [...parsed.Items].sort((a, b) => 
        new Date(a.StartDate).getTime() - new Date(b.StartDate).getTime()
      );
      setActivities(sortedActivities);
      
      const allOccurrences = sortedActivities.flatMap(activity => 
        generateOccurrences(activity)
      );
      setOccurrences(allOccurrences);
      setError(null);
    } catch (err) {
      console.error('Parsing error:', err);
      setError('Invalid JSON format. Please check your input.');
      setActivities([]);
      setOccurrences([]);
    }
  };

  const handleExampleData = async () => {
    try {
      const response = await fetch('/activities.json');
      if (!response.ok) throw new Error('Failed to fetch example data');
      const data = await response.text();
      
      const formattedJson = JSON.stringify(JSON.parse(data), null, 2);
      setJsonInput(formattedJson);
      
      const parsed = JSON.parse(data) as AmiliaResponse;
      const sortedActivities = [...parsed.Items].sort((a, b) => 
        new Date(a.StartDate).getTime() - new Date(b.StartDate).getTime()
      );
      setActivities(sortedActivities);
      
      const allOccurrences = sortedActivities.flatMap(activity => 
        generateOccurrences(activity)
      );
      setOccurrences(allOccurrences);
      setError(null);
    } catch (err) {
      console.error('Failed to load example data:', err);
      setError('Failed to load example data');
    }
  };

  const handleDownloadIcs = () => {
    if (occurrences.length === 0) {
      setError('No activities to download');
      return;
    }
    downloadIcsFile(occurrences);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="main-container">
          <div className="flex justify-between items-center mb-8">
            <h1 className="page-title">Create Makerspace Classes</h1>
            <button
              onClick={() => setViewMode(viewMode === 'update' ? 'calendar' : 'update')}
              className="action-button"
            >
              {viewMode === 'update' ? 'Back to Calendar' : 'Update Classes'}
            </button>
          </div>

          {viewMode === 'update' ? (
            <UpdatePage />
          ) : (
            <>
              {error && (
                <div className="bg-red-50 text-red-600 p-6 rounded-lg border border-red-200 mb-6">
                  {error}
                </div>
              )}

              {occurrences.length > 0 && (
                <div className="mb-8">
                  <div className="flex gap-3 mb-6">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`view-button ${
                        viewMode === 'list'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <List size={20} /> List View
                    </button>
                    <button
                      onClick={() => setViewMode('calendar')}
                      className={`view-button ${
                        viewMode === 'calendar'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <CalendarDays size={20} /> Calendar View
                    </button>
                  </div>

                  {viewMode === 'list' ? (
                    <ActivityList occurrences={occurrences} />
                  ) : (
                    <Calendar
                      occurrences={occurrences}
                      currentMonth={currentMonth}
                      onMonthChange={setCurrentMonth}
                    />
                  )}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="mt-12 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-semibold text-cms-black mb-4">Update Activities</h2>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="textarea-input"
                  placeholder="Paste the JSON response from the Amilia API here"
                />
                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="action-button"
                  >
                    <Upload size={20} /> Update events
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadIcs}
                    className="action-button ml-auto"
                  >
                    <Download size={20} /> Download Calendar
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;