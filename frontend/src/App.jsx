import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./layouts/AppShell.jsx";
import ProtectedRoute from "./layouts/ProtectedRoute.jsx";
import CollegesPage from "./pages/CollegesPage.jsx";
import CourseDetailsPage from "./pages/CourseDetailsPage.jsx";
import CoursesPage from "./pages/CoursesPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import DeadlinesPage from "./pages/DeadlinesPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import RoadmapsPage from "./pages/RoadmapsPage.jsx";
import AssessmentPage from "./pages/AssessmentPage.jsx";
import ResultsPage from "./pages/ResultsPage.jsx";
import SavedPage from "./pages/SavedPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import PersonalizedRoadmapPage from "./pages/PersonalizedRoadmapPage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/roadmaps/public" element={<RoadmapsPage publicOnly />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/assessment" element={<AssessmentPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/my-roadmap" element={<PersonalizedRoadmapPage />} />
        <Route path="/roadmaps" element={<RoadmapsPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailsPage />} />
        <Route path="/colleges" element={<CollegesPage />} />
        <Route path="/deadlines" element={<DeadlinesPage />} />
        <Route path="/saved" element={<SavedPage />} />
      </Route>
      <Route path="/quiz" element={<Navigate to="/assessment" replace />} />
      <Route path="/home" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
