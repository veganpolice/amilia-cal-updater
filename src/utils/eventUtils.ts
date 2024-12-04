import { Activity } from '../types';

export const isEventVisible = (activity: Activity): boolean => {
  // Check if the activity or any of its schedules have a "hidden" status
  if (activity.Status?.toLowerCase() === 'hidden') {
    return false;
  }

  // Check schedules if they exist
  if (activity.Schedules?.some(schedule => schedule.Status?.toLowerCase() === 'hidden')) {
    return false;
  }

  return true;
};
