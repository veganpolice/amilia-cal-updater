import { Activity, ActivityOccurrence } from '../types';

export const parseScheduleDays = (summary: string): { day: number; date?: Date }[] => {
  const days = {
    sunday: 0, sun: 0,
    monday: 1, mon: 1,
    tuesday: 2, tue: 2,
    wednesday: 3, wed: 3,
    thursday: 4, thu: 4,
    friday: 5, fri: 5,
    saturday: 6, sat: 6
  };

  // Try to match a specific date first (e.g., "Thursday, November 14, 2024")
  const datePattern = /([A-Za-z]+day),\s+([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})/i;
  const dateMatch = summary.match(datePattern);
  
  if (dateMatch) {
    const date = new Date(`${dateMatch[2]} ${dateMatch[3]}, ${dateMatch[4]}`);
    if (!isNaN(date.getTime())) {
      return [{ day: date.getDay(), date }];
    }
  }

  // If no specific date, look for recurring days
  const scheduleDays: { day: number }[] = [];
  const lowercaseSummary = summary.toLowerCase();

  Object.entries(days).forEach(([day, value]) => {
    if (lowercaseSummary.includes(day)) {
      scheduleDays.push({ day: value });
    }
  });

  return scheduleDays;
};

export const parseScheduleTime = (summary: string): { start: string; end: string } | null => {
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
  const scheduleTime = parseScheduleTime(activity.ScheduleSummary);

  if (!scheduleTime) {
    console.warn(`No time found in schedule summary for activity: ${activity.Name}`);
    return [];
  }

  // For activities with a specific date
  const specificDate = scheduleDays.find(d => d.date);
  if (specificDate?.date) {
    const staff = getStaffForDate(activity, specificDate.date);
    return [{
      ...activity,
      date: specificDate.date,
      timeRange: scheduleTime,
      Staff: staff ? [staff] : []
    }];
  }

  // For recurring activities
  const startDate = new Date(activity.StartDate);
  const endDate = new Date(activity.EndDate);
  
  let currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0); // Reset time part

  while (currentDate <= endDate) {
    const currentDay = currentDate.getDay();
    if (scheduleDays.some(d => d.day === currentDay)) {
      const staff = getStaffForDate(activity, currentDate);
      occurrences.push({
        ...activity,
        date: new Date(currentDate),
        timeRange: scheduleTime,
        Staff: staff ? [staff] : []
      });
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return occurrences;
};