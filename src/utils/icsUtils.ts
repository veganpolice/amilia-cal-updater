import { createEvents } from 'ics';
import { ActivityOccurrence } from '../types';
import { formatInstructor } from './formatUtils';

const LOCATION = 'Create Makerspace, 39449 Queens Way #1, Squamish, BC V8B 0R5';

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]; // This naturally includes dashes (YYYY-MM-DD)
};

const downloadIcsContent = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadIcsFile = (occurrences: ActivityOccurrence[]) => {
  const events = occurrences.map(occurrence => {
    const date = occurrence.date;
    const [startHours, startMinutes] = occurrence.timeRange.start.replace(/[ap]m/i, '').split(':').map(Number);
    const [endHours, endMinutes] = occurrence.timeRange.end.replace(/[ap]m/i, '').split(':').map(Number);
    
    const adjustedStartHours = occurrence.timeRange.start.toLowerCase().includes('pm') && startHours !== 12 
      ? startHours + 12 
      : startHours;
    const adjustedEndHours = occurrence.timeRange.end.toLowerCase().includes('pm') && endHours !== 12
      ? endHours + 12
      : endHours;

    const instructorInfo = occurrence.Staff && occurrence.Staff.length > 0 
      ? `Instructor: ${formatInstructor(occurrence.Staff)}\n\n`
      : '';
    
    const bookingInfo = `<a href="${occurrence.Url}">Book now</a>`;
    const descriptionText = occurrence.Description ? `\n\n${occurrence.Description}` : '';
    
    const description = `${occurrence.ScheduleSummary}\n\n${instructorInfo}${bookingInfo}${descriptionText}`;

    return {
      title: occurrence.Name,
      location: LOCATION,
      start: [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        adjustedStartHours,
        startMinutes || 0
      ],
      end: [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        adjustedEndHours,
        endMinutes || 0
      ],
      description
    };
  });

  createEvents(events, (error, value) => {
    if (error) {
      console.error(error);
      return;
    }

    if (!value) return;

    const today = formatDate(new Date());
    
    // Download regular calendar
    downloadIcsContent(value, `amilia-cal-${today}.ics`);
    
    // Create and download cancelled events calendar
    const cancelledContent = value.split('\n').map(line => {
      if (line.trim() === 'END:VEVENT') {
        return 'STATUS:CANCELLED\n' + line;
      }
      return line;
    }).join('\n');
    
    downloadIcsContent(cancelledContent, `amilia-cal-${today}-remove.ics`);
  });
};
