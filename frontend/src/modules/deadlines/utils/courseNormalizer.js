export const POPULAR_CATEGORIES = [
  { id: 'engineering', name: 'Engineering', stream: 'PCM', icon: 'Cpu', count: 'MHT-CET, JEE Main, BITSAT' },
  { id: 'medicine', name: 'Medical & AYUSH', stream: 'PCB', icon: 'HeartPulse', count: 'NEET UG, Maharashtra CAP' },
  { id: 'law', name: 'Law (5-Yr Integrated)', stream: 'Any', icon: 'Scale', count: 'CLAT, AILET, MH CET Law' },
  { id: 'architecture', name: 'Architecture', stream: 'PCM', icon: 'Compass', count: 'NATA, JEE Main Paper 2' },
  { id: 'design', name: 'Design & Fashion', stream: 'Any', icon: 'Palette', count: 'UCEED, NID, NIFT' },
  { id: 'agriculture', name: 'Agriculture & Allied', stream: 'PCB', icon: 'Sprout', count: 'Maharashtra CET Agri, CAP' },
  { id: 'bca', name: 'BCA / BBA / BMS', stream: 'Any', icon: 'Briefcase', count: 'MAH-BCA-BBA-BMS-CET, CUET' },
  { id: 'fyjc', name: 'FYJC Std. 11 Admission', stream: 'General', icon: 'GraduationCap', count: 'Maharashtra 11th Centralized' }
];

export const EDUCATION_LEVELS = [
  { label: 'All Levels', value: '' },
  { label: 'Class 10 (Post-SSC)', value: '10th' },
  { label: 'Class 12 (Post-HSC)', value: '12th' }
];

export const STREAMS = [
  { label: 'All Streams', value: '' },
  { label: 'PCM (Physics, Chem, Math)', value: 'PCM' },
  { label: 'PCB (Physics, Chem, Bio)', value: 'PCB' },
  { label: 'Commerce', value: 'Commerce' },
  { label: 'Arts / Humanities', value: 'Arts' },
  { label: 'Vocational / General', value: 'General' }
];

export const STATES = [
  { label: 'All India', value: 'All India' },
  { label: 'Maharashtra', value: 'Maharashtra' }
];

export const EVENT_TYPES = [
  { label: 'All Event Types', value: '' },
  { label: 'Application Deadline', value: 'APPLICATION_DEADLINE' },
  { label: 'Application Start', value: 'APPLICATION_START' },
  { label: 'Examination', value: 'EXAMINATION' },
  { label: 'Correction Window', value: 'CORRECTION_WINDOW' },
  { label: 'Admit Card', value: 'ADMIT_CARD' },
  { label: 'Result', value: 'RESULT' },
  { label: 'Counselling & CAP', value: 'COUNSELLING_REGISTRATION' },
  { label: 'Choice Filling', value: 'CHOICE_FILLING' },
  { label: 'Seat Allotment', value: 'SEAT_ALLOTMENT' },
  { label: 'Document Verification', value: 'DOCUMENT_VERIFICATION' }
];

export const URGENCY_OPTIONS = [
  { label: 'All Urgency', value: '' },
  { label: '🔴 Urgent (0 - 7 Days)', value: 'URGENT' },
  { label: '🟠 Soon (8 - 30 Days)', value: 'SOON' },
  { label: '🟢 Upcoming (31 - 90 Days)', value: 'UPCOMING' },
  { label: '🔵 Later (91+ Days)', value: 'LATER' }
];

export default {
  POPULAR_CATEGORIES,
  EDUCATION_LEVELS,
  STREAMS,
  STATES,
  EVENT_TYPES,
  URGENCY_OPTIONS
};
