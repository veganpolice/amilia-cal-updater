import { Activity, ActivityOccurrence } from '../types';

export const parseScheduleDays = (summary: string): { day: number; date?: Date; time?: { start: string; end: string } }[] => {
  const days = {
    sunday: 0, sun: 0,
    monday: 1, mon: 1,
    tuesday: 2, tue: 2,
    wednesday: 3, wed: 3,
    thursday: 4, thu: 4,
    friday: 5, fri: 5,
    saturday: 6, sat: 6
  };

  // Try to match specific dates with times first
  const dateTimePattern = /([A-Za-z]+day),\s+([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})[^]*?(\d{1,2}:\d{2}\s*(?:AM|PM))\s*(?:-|to)\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/gi;
  const dateTimeMatches = [...summary.matchAll(dateTimePattern)];
  
  if (dateTimeMatches.length > 0) {
    return dateTimeMatches.map(match => {
      const date = new Date(`${match[2]} ${match[3]}, ${match[4]}`);
      if (!isNaN(date.getTime())) {
        const formatTime = (time: string) => {
          const [hours, minutesPeriod] = time.split(':');
          const [minutes, period] = minutesPeriod.split(/\s+/);
          return minutes === '00' ? `${hours}${period.toLowerCase()}` : `${hours}:${minutes}${period.toLowerCase()}`;
        };
        return {
          day: date.getDay(),
          date,
          time: {
            start: formatTime(match[5].trim()),
            end: formatTime(match[6].trim())
          }
        };
      }
      return null;
    }).filter((item): item is { day: number; date: Date; time: { start: string; end: string } } => item !== null);
  }

  // If no specific dates with times, look for recurring days
  const scheduleDays: { day: number }[] = [];
  const lowercaseSummary = summary.toLowerCase();

  // Look for day ranges (e.g., "Monday to Friday" or "Monday - Friday")
  const rangePattern = /([a-z]+day)\s*(?:to|-)\s*([a-z]+day)/gi;
  const rangeMatches = [...lowercaseSummary.matchAll(rangePattern)];

  for (const match of rangeMatches) {
    const startDay = Object.entries(days).find(([day]) => match[1].includes(day.toLowerCase()))?.[1];
    const endDay = Object.entries(days).find(([day]) => match[2].includes(day.toLowerCase()))?.[1];
    
    if (startDay !== undefined && endDay !== undefined) {
      let currentDay = startDay;
      while (currentDay !== endDay) {
        scheduleDays.push({ day: currentDay });
        currentDay = (currentDay + 1) % 7;
      }
      scheduleDays.push({ day: endDay });
    }
  }

  // Look for individual days if no ranges were found
  if (scheduleDays.length === 0) {
    Object.entries(days).forEach(([day, value]) => {
      if (lowercaseSummary.includes(day)) {
        // Avoid duplicates
        if (!scheduleDays.some(d => d.day === value)) {
          scheduleDays.push({ day: value });
        }
      }
    });
  }

  return scheduleDays;
};

export const parseScheduleTime = (summary: string, date?: Date): { start: string; end: string } | null => {
  // If we have a specific date, try to find time associated with that date first
  if (date) {
    const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const dateSection = summary.split(/(?=[A-Z][a-z]+day)/).find(section => 
      section.includes(dateStr)
    );
    
    if (dateSection) {
      const timePattern = /(\d{1,2}:\d{2}\s*(?:AM|PM))\s*(?:-|to)\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i;
      const match = dateSection.match(timePattern);
      
      if (match) {
        const formatTime = (time: string) => {
          const [hours, minutesPeriod] = time.split(':');
          const [minutes, period] = minutesPeriod.split(/\s+/);
          return minutes === '00' ? `${hours}${period.toLowerCase()}` : `${hours}:${minutes}${period.toLowerCase()}`;
        };

        return {
          start: formatTime(match[1].trim()),
          end: formatTime(match[2].trim())
        };
      }
    }
  }

  // Fall back to general time pattern if no specific date time found
  const timePattern = /(\d{1,2}:\d{2}\s*(?:AM|PM))\s*(?:-|to)\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i;
  const match = summary.match(timePattern);
  
  if (match) {
    const formatTime = (time: string) => {
      const [hours, minutesPeriod] = time.split(':');
      const [minutes, period] = minutesPeriod.split(/\s+/);
      return minutes === '00' ? `${hours}${period.toLowerCase()}` : `${hours}:${minutes}${period.toLowerCase()}`;
    };

    return {
      start: formatTime(match[1].trim()),
      end: formatTime(match[2].trim())
    };
  }
  return null;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getStaffForDate = (activity: Activity, date: Date) => {
  // First try to find a schedule that matches the exact date
  const schedule = activity.Schedules?.find(schedule => {
    const scheduleDate = new Date(schedule.TimePeriod.StartDate);
    return scheduleDate.toDateString() === date.toDateString();
  });

  // If no exact match, find the first schedule that covers this date
  if (!schedule && activity.Schedules?.length > 0) {
    return activity.Schedules[0].Staff?.[0] || null;
  }
  
  return schedule?.Staff?.[0] || null;
};

export const generateOccurrences = (activity: Activity): ActivityOccurrence[] => {
  const occurrences: ActivityOccurrence[] = [];
  const scheduleDays = parseScheduleDays(activity.ScheduleSummary);

  // For activities with specific dates and times
  const specificDates = scheduleDays.filter(d => d.date && d.time);
  if (specificDates.length > 0) {
    return specificDates.map(({ date, time }) => {
      const staff = getStaffForDate(activity, date!);
      return {
        ...activity,
        date: date!,
        timeRange: time!,
        Staff: staff ? [staff] : []
      };
    });
  }

  // For recurring activities
  const startDate = new Date(activity.StartDate);
  const endDate = new Date(activity.EndDate);
  
  let currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0); // Reset time part

  while (currentDate <= endDate) {
    const currentDay = currentDate.getDay();
    if (scheduleDays.some(d => d.day === currentDay)) {
      const scheduleTime = parseScheduleTime(activity.ScheduleSummary, currentDate);
      if (scheduleTime) {
        const staff = getStaffForDate(activity, currentDate);
        occurrences.push({
          ...activity,
          date: new Date(currentDate),
          timeRange: scheduleTime,
          Staff: staff ? [staff] : []
        });
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return occurrences;
};
