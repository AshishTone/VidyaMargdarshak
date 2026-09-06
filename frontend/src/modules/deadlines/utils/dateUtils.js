/**
 * Date Utility Functions for Admission Deadlines
 */

/**
 * Formats a Date object or ISO string to student-friendly format e.g. "15 March 2027" or "Mar 2027"
 * @param {Date|string} dateInput 
 * @param {string} precision 'exact' | 'month' | 'tentative'
 * @returns {string}
 */
export function formatDisplayDate(dateInput, precision = 'exact') {
  if (!dateInput) return 'TBA (Check Official Site)';
  
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return 'TBA (Check Official Site)';

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (precision === 'month') {
    return `${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  }

  const day = d.getUTCDate();
  const month = months[d.getUTCMonth()];
  const year = d.getUTCFullYear();

  return `${day} ${month} ${year}`;
}

export function formatFullDate(dateInput) {
  if (!dateInput) return 'Date not declared';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return 'Date not declared';

  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Calculates dynamic calendar days remaining from today to target date
 * @param {Date|string} targetDate 
 * @returns {number|null}
 */
export function calculateDaysRemaining(targetDate) {
  if (!targetDate) return null;
  const target = new Date(targetDate);
  if (isNaN(target.getTime())) return null;

  const now = new Date();
  const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const utcTarget = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((utcTarget - utcNow) / msPerDay);
}

/**
 * Categorizes urgency based on days remaining:
 * URGENT: 0 - 7 days
 * SOON: 8 - 30 days
 * UPCOMING: 31 - 90 days
 * LATER: 91+ days
 * EXPIRED: < 0 days
 * @param {number|null} daysRemaining 
 * @returns {'URGENT'|'SOON'|'UPCOMING'|'LATER'|'EXPIRED'|'UNKNOWN'}
 */
export function getUrgencyLevel(daysRemaining) {
  if (daysRemaining === null || daysRemaining === undefined) return 'UNKNOWN';
  if (daysRemaining < 0) return 'EXPIRED';
  if (daysRemaining <= 7) return 'URGENT';
  if (daysRemaining <= 30) return 'SOON';
  if (daysRemaining <= 90) return 'UPCOMING';
  return 'LATER';
}

/**
 * Visual styling and label configuration for countdowns
 */
export function getUrgencyConfig(urgency, daysRemaining) {
  switch (urgency) {
    case 'URGENT':
      return {
        label: daysRemaining === 0 ? 'Today is the deadline!' : `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} left`,
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
        badge: '🔴 Urgent'
      };
    case 'SOON':
      return {
        label: `${daysRemaining} days left`,
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
        badge: '🟠 Soon'
      };
    case 'UPCOMING':
      return {
        label: `${daysRemaining} days left`,
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
        badge: '🟢 Upcoming'
      };
    case 'LATER':
      return {
        label: `${daysRemaining} days left`,
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
        badge: '🔵 Scheduled'
      };
    case 'EXPIRED':
      return {
        label: 'Deadline Passed',
        bg: 'bg-slate-100',
        text: 'text-slate-500',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
        badge: '⚪ Closed'
      };
    default:
      return {
        label: 'Awaiting Official Dates',
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
        badge: '⚪ Official Portal'
      };
  }
}

export function isValidISODate(dateString) {
  if (!dateString || typeof dateString !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const d = new Date(dateString);
  return !isNaN(d.getTime());
}

export default {
  formatDisplayDate,
  formatFullDate,
  calculateDaysRemaining,
  getUrgencyLevel,
  getUrgencyConfig,
  isValidISODate
};
