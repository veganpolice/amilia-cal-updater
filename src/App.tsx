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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [occurrences, setOccurrences] = useState<ActivityOccurrence[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'update'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const storedClasses = localStorage.getItem('amilia-classes');
    if (storedClasses) {
      try {
        const parsed = JSON.parse(storedClasses) as AmiliaResponse;
        const sortedActivities = [...parsed.Items].sort((a, b) => 
          new Date(a.StartDate).getTime() - new Date(b.StartDate).getTime()
        );
        setActivities(sortedActivities);
        
        const allOccurrences = sortedActivities.flatMap(activity => 
          generateOccurrences(activity)
        );
        setOccurrences(allOccurrences);
      } catch (err) {
        console.error('Error loading stored classes:', err);
        setError('Failed to load stored classes');
      }
    }
  }, []);

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
          <div className="flex flex-col gap-6 mb-8">
            <h1 className="page-title mb-0">Create Makerspace Calendar Generator</h1>
            <button
              onClick={() => setViewMode(viewMode === 'update' ? 'calendar' : 'update')}
              className="action-button w-fit"
            >
              {viewMode === 'update' ? 'Back to Calendar' : 'Update Classes'}
            </button>
          </div>

          {viewMode === 'update' ? (
            <UpdatePage onClassesUpdate={(classes) => {
              localStorage.setItem('amilia-classes', JSON.stringify(classes));
              const sortedActivities = [...classes.Items].sort((a, b) => 
                new Date(a.StartDate).getTime() - new Date(b.StartDate).getTime()
              );
              setActivities(sortedActivities);
              const allOccurrences = sortedActivities.flatMap(activity => 
                generateOccurrences(activity)
              );
              setOccurrences(allOccurrences);
              setViewMode('calendar');
            }} />
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
                    <button
                      onClick={handleDownloadIcs}
                      className="view-button ml-auto"
                    >
                      <Download size={20} /> Download Calendar
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
            </>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;
