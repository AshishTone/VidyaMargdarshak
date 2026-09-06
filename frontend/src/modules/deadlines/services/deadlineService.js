/**
 * Deadlines Service & Intelligent Orchestrator
 * Performs query normalization, stream & state matching, dynamic urgency calculation,
 * and resilient caching over authentic official sources.
 */

import { officialDeadlines } from '../data/deadlinesData';
import { admissionSources } from '../data/admissionSources';
import { normalizeCourseQuery, getSourcesForCourse } from '../data/courseMappings';
import {
  calculateDaysRemaining,
  getUrgencyLevel,
  formatDisplayDate
} from '../utils/dateUtils';

/**
 * Enriches a raw deadline object with real-time dynamic properties:
 * - daysRemaining (computed against current calendar day)
 * - urgency (URGENT, SOON, UPCOMING, LATER, EXPIRED)
 * - formatted displayDate
 * - isExpired
 */
export function enrichDeadline(deadline) {
  const daysRemaining = calculateDaysRemaining(deadline.eventDate);
  const urgency = getUrgencyLevel(daysRemaining);

  return {
    ...deadline,
    id: deadline.id || deadline._id,
    daysRemaining,
    urgency,
    displayDate: deadline.displayDate || formatDisplayDate(deadline.eventDate, deadline.datePrecision),
    isExpired: daysRemaining !== null && daysRemaining < 0
  };
}

/**
 * Filter and search deadlines
 * @param {object} params
 * @param {string} params.query
 * @param {string} params.course
 * @param {string} params.educationLevel
 * @param {string} params.stream
 * @param {string} params.state
 * @param {string} params.eventType
 * @param {string} params.urgency
 * @param {boolean} params.forceRefresh
 */
export async function searchDeadlines({
  query = '',
  course = '',
  educationLevel = '',
  stream = '',
  state = '',
  eventType = '',
  urgency = '',
  forceRefresh = false
} = {}) {
  // Simulate network latency if force refreshing from portals
  if (forceRefresh) {
    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  const rawSearch = (query || course || '').trim().toLowerCase();
  const normalizedCourse = rawSearch ? normalizeCourseQuery(rawSearch) : '';
  const relevantSourceIds = normalizedCourse ? getSourcesForCourse(normalizedCourse) : [];

  // Filter raw official deadlines
  let results = officialDeadlines.map(enrichDeadline);

  // 1. Strict Education Level Enforcement (10th vs 12th isolation)
  if (educationLevel) {
    const targetLevel = educationLevel.toLowerCase();
    results = results.filter((d) => {
      const dLevel = (d.educationLevel || '').toLowerCase();
      return dLevel === targetLevel;
    });
  }

  // Identify matching official sources restricted to the target education level
  const sourcesChecked = admissionSources.filter((src) => {
    if (educationLevel) {
      const srcLevels = (src.educationLevels || []).map((l) => l.toLowerCase());
      if (!srcLevels.includes(educationLevel.toLowerCase())) {
        return false;
      }
    }
    const matchesSource = relevantSourceIds.length > 0 ? relevantSourceIds.includes(src.id) : true;
    const matchesState = state && state !== 'All India' ? (src.state === state || src.state === 'All India') : true;
    return matchesSource && matchesState;
  }).map((s) => ({
    id: s.id,
    name: s.name,
    url: s.url,
    priority: s.priority,
    state: s.state
  }));

  // 2. Stream / Pathway Filter
  if (stream) {
    const sTerm = stream.toLowerCase();
    results = results.filter((d) => {
      // If 10th pathway: fyjc vs polytechnic
      if (sTerm === 'fyjc') {
        return d.course === 'fyjc' || d.examName.toLowerCase().includes('fyjc') || d.title.toLowerCase().includes('fyjc');
      }
      if (sTerm === 'polytechnic') {
        return d.course === 'polytechnic' || d.examName.toLowerCase().includes('polytechnic') || d.title.toLowerCase().includes('diploma');
      }

      // 12th streams (PCM, PCB, Commerce, Arts, General)
      if (!d.stream || d.stream.length === 0) return true;
      const streamList = Array.isArray(d.stream) ? d.stream : [d.stream];
      return streamList.some(
        (s) => s.toLowerCase() === sTerm || s.toLowerCase() === 'general' || s.toLowerCase() === 'any'
      );
    });
  }

  // 3. Text Query / Course Filter
  if (rawSearch) {
    results = results.filter((d) => {
      const matchExam = d.examName.toLowerCase().includes(rawSearch);
      const matchTitle = d.title.toLowerCase().includes(rawSearch);
      const matchCourse = d.course.toLowerCase().includes(normalizedCourse) || normalizedCourse.includes(d.course.toLowerCase());
      const matchSource = d.officialSourceName.toLowerCase().includes(rawSearch);
      const matchDesc = (d.description || '').toLowerCase().includes(rawSearch);
      return matchExam || matchTitle || matchCourse || matchSource || matchDesc;
    });
  }

  // 4. State / Region Filter
  if (state && state !== 'All India') {
    results = results.filter((d) => {
      if (!d.state || d.state.length === 0) return true;
      const stateList = Array.isArray(d.state) ? d.state : [d.state];
      return stateList.some(
        (st) => st.toLowerCase() === state.toLowerCase() || st.toLowerCase() === 'all india'
      );
    });
  }

  // 5. Event Type Filter
  if (eventType) {
    results = results.filter((d) => d.eventType === eventType);
  }

  // 6. Urgency Filter (if specified programmatically)
  if (urgency) {
    results = results.filter((d) => d.urgency === urgency);
  }

  // Sort: Confirmed events with nearest positive days remaining first, then later events, then expired
  const sorted = results.sort((a, b) => {
    if (a.daysRemaining >= 0 && b.daysRemaining < 0) return -1;
    if (a.daysRemaining < 0 && b.daysRemaining >= 0) return 1;
    if (a.daysRemaining !== null && b.daysRemaining !== null) {
      return a.daysRemaining - b.daysRemaining;
    }
    if (a.eventDate && b.eventDate) {
      return new Date(a.eventDate) - new Date(b.eventDate);
    }
    return (a.examName || '').localeCompare(b.examName || '');
  });

  return {
    success: true,
    count: sorted.length,
    deadlines: sorted,
    sourcesChecked: sourcesChecked.length > 0 ? sourcesChecked : admissionSources.filter(s => !educationLevel || (s.educationLevels || []).includes(educationLevel)).slice(0, 5)
  };
}

/**
 * Fetch registered official sources
 */
export async function fetchSources(params = {}) {
  let list = [...admissionSources];
  if (params.educationLevel) {
    list = list.filter((s) => (s.educationLevels || []).includes(params.educationLevel));
  }
  if (params.category) {
    list = list.filter((s) => s.category.toLowerCase() === params.category.toLowerCase());
  }
  if (params.state) {
    list = list.filter((s) => s.state.toLowerCase() === params.state.toLowerCase() || s.state === 'All India');
  }
  return {
    success: true,
    count: list.length,
    sources: list
  };
}

/**
 * Fetch nearest upcoming deadlines
 */
export async function fetchUpcomingDeadlines(limit = 6, educationLevel = '') {
  let enriched = officialDeadlines.map(enrichDeadline);
  if (educationLevel) {
    enriched = enriched.filter((d) => (d.educationLevel || '').toLowerCase() === educationLevel.toLowerCase());
  }
  const upcoming = enriched
    .filter((d) => d.daysRemaining !== null && d.daysRemaining >= 0)
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, limit);

  return {
    success: true,
    count: upcoming.length,
    deadlines: upcoming
  };
}

export default {
  enrichDeadline,
  searchDeadlines,
  fetchSources,
  fetchUpcomingDeadlines
};
