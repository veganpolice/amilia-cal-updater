import React, { useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { ActivityOccurrence } from '../types';
import { formatActivityName, formatInstructor, getActivityIcon } from '../utils/formatUtils';

interface CalendarProps {
  occurrences: ActivityOccurrence[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ occurrences, currentMonth, onMonthChange }) => {
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getOccurrencesForDay = (day: number) => {
    return occurrences.filter(occurrence => {
      const occurrenceDate = occurrence.date;
      return (
        occurrenceDate.getDate() === day &&
        occurrenceDate.getMonth() === currentMonth.getMonth() &&
        occurrenceDate.getFullYear() === currentMonth.getFullYear()
      );
    });
  };

  const positionTooltip = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const tooltip = event.currentTarget.querySelector('.calendar-event-expanded') as HTMLElement;
    if (!tooltip) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceRight = window.innerWidth - rect.left;

    // Position tooltip
    tooltip.style.top = `${rect.top}px`;
    tooltip.style.left = `${rect.left}px`;

    // Adjust if too close to bottom
    if (spaceBelow < 200) {
      tooltip.style.top = `${rect.top - tooltip.offsetHeight}px`;
    }

    // Adjust if too close to right edge
    if (spaceRight < 300) {
      tooltip.style.left = `${rect.left - tooltip.offsetWidth + rect.width}px`;
    }
  }, []);

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className="bg-cms-white rounded-xl shadow-lg border border-primary/20">
      <div className="flex items-center justify-between p-4 border-b border-primary/20">
        <button onClick={previousMonth} className="nav-button">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-semibold text-cms-black">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={nextMonth} className="nav-button">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-primary/10">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="calendar-header">
            {day}
          </div>
        ))}

        {blanks.map((blank) => (
          <div key={`blank-${blank}`} className="bg-cms-white p-2 min-h-[12rem]" />
        ))}

        {days.map((day) => {
          const dayOccurrences = getOccurrencesForDay(day);
          return (
            <div key={day} className="calendar-cell p-2">
              <div className="calendar-day">{day}</div>
              <div className="space-y-1">
                {dayOccurrences.map((occurrence, idx) => {
                  const Icon = getActivityIcon(occurrence.Name);
                  const formattedName = formatActivityName(occurrence.Name);
                  return (
                    <div 
                      key={idx} 
                      className="calendar-event"
                      onMouseEnter={positionTooltip}
                    >
                      <div className="calendar-event-content">
                        <div className="activity-title">
                          <Icon size={14} className="flex-shrink-0" />
                          <span className="calendar-title">
                            {formattedName}
                          </span>
                        </div>
                        <div className="calendar-time">
                          {occurrence.timeRange.start} - {occurrence.timeRange.end}
                        </div>
                        {occurrence.Staff?.[0] && (
                          <div className="calendar-instructor">
                            {formatInstructor(occurrence.Staff)}
                          </div>
                        )}
                        <a
                          href={occurrence.Url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="calendar-book-now"
                        >
                          Book now <ExternalLink className="ml-1" size={12} />
                        </a>
                      </div>

                      <div className="calendar-event-expanded">
                        <div className="activity-title mb-2">
                          <Icon size={16} className="flex-shrink-0" />
                          <span className="calendar-title-expanded">
                            {formattedName}
                          </span>
                        </div>
                        <div className="text-sm text-cms-black/70">
                          {occurrence.timeRange.start} - {occurrence.timeRange.end}
                        </div>
                        {occurrence.Staff?.[0] && (
                          <div className="text-sm text-cms-black/50 mt-1">
                            {formatInstructor(occurrence.Staff)}
                          </div>
                        )}
                        <a
                          href={occurrence.Url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="book-now-link mt-2 inline-flex items-center"
                        >
                          Book now <ExternalLink className="ml-1" size={12} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;