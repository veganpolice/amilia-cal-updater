import React from 'react';
import { ExternalLink } from 'lucide-react';
import { ActivityOccurrence } from '../types';
import { formatDate } from '../utils/dateUtils';
import { formatActivityName, formatInstructor, getActivityIcon } from '../utils/formatUtils';

interface ActivityListProps {
  occurrences: ActivityOccurrence[];
}

const ActivityList: React.FC<ActivityListProps> = ({ occurrences }) => {
  const sortedOccurrences = [...occurrences].sort((a, b) => 
    a.date.getTime() - b.date.getTime()
  );

  return (
    <div className="space-y-4">
      {sortedOccurrences.map((occurrence, index) => {
        const Icon = getActivityIcon(occurrence.Name);
        return (
          <div 
            key={`${occurrence.Name}-${index}`} 
            className="activity-card"
          >
            <h3 className="list-activity-title">
              <Icon size={24} className="flex-shrink-0" />
              {formatActivityName(occurrence.Name)}
            </h3>
            <p className="text-cms-black/70">
              {formatDate(occurrence.date)} • {occurrence.timeRange.start} - {occurrence.timeRange.end}
            </p>
            {occurrence.Staff?.[0] && (
              <p className="text-cms-black/50 mt-1">
                Instructor: {formatInstructor(occurrence.Staff)}
              </p>
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
        );
      })}
    </div>
  );
};

export default ActivityList;