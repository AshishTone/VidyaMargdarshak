import api from "./api";

export const fetchProfile = async () => (await api.get("/me")).data.user;
export const updateProfile = async (payload) => (await api.put("/me", payload)).data.user;
export const fetchQuestions = async (params = {}) =>
  (await api.get("/assessments/questions", { params })).data.questions;

export const submitAssessment = async (payload) =>
  (await api.post("/assessments", payload)).data;
export const fetchStreamRecommendation = async () =>
  (await api.get("/recommendations/streams")).data;
export const fetchRecommendedCourses = async () =>
  (await api.get("/recommendations/courses")).data.courses;
export const fetchRecommendedCareers = async () =>
  (await api.get("/recommendations/careers")).data.careers;
export const fetchRecommendedResources = async () =>
  (await api.get("/recommendations/resources")).data.resources;
export const fetchCourses = async (params = {}) =>
  (await api.get("/courses", { params })).data.courses;
export const fetchCourseById = async (id) => (await api.get(`/courses/${id}`)).data.course;
export const fetchColleges = async (params = {}) =>
  (await api.get("/colleges", { params })).data.colleges;
export const fetchDeadlines = async () => (await api.get("/deadlines")).data.deadlines;
export const saveCourse = async (courseId) => api.post(`/me/saved/courses/${courseId}`);
export const saveCollege = async (collegeId) => api.post(`/me/saved/colleges/${collegeId}`);
export const fetchPublicRoadmap = async () => (await api.get("/roadmaps/public")).data;
export const fetchPersonalizedRoadmap = async () =>
  (await api.get("/roadmaps/personalized")).data;
export const fetchAiOverview = async () => (await api.get("/recommendations/ai-overview")).data.aiOverview;
export const simulateAiOverview = async (payload) =>
  (await api.post("/recommendations/ai-overview/simulate", payload)).data.aiOverview;

