import { Staff } from '../types';
import { LucideIcon, 
  Hammer, 
  Scissors, 
  Cpu, 
  Wrench, 
  Waypoints, 
  Mountain, 
  CircleDot 
} from 'lucide-react';

export const formatActivityName = (name: string): string => {
  // Remove text in parentheses, then remove "Program", "Workshop" and hyphens
  return name
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*(Program|Workshop)\b/gi, '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ') // Clean up multiple spaces
    .trim();
};

export const formatInstructor = (staff: Staff[]): string => {
  return staff.map(person => `${person.FirstName} ${person.LastName}`).join(', ');
};

export const getActivityIcon = (name: string): LucideIcon => {
  const lowercaseName = name.toLowerCase();
  
  if (lowercaseName.includes('wood')) return Hammer;
  if (lowercaseName.includes('textile')) return Scissors;
  if (lowercaseName.includes('robot')) return Cpu;
  if (lowercaseName.includes('metal')) return Wrench;
  if (lowercaseName.includes('cnc') || lowercaseName.includes('laser')) return Waypoints;
  if (lowercaseName.includes('ski')) return Mountain;
  
  return CircleDot; // Default icon
};