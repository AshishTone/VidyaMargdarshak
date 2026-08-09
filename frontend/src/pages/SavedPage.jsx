import SectionCard from "../components/ui/SectionCard";
import useAuth from "../hooks/useAuth";

export default function SavedPage() {
  const { user } = useAuth();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SectionCard>
        <p className="section-title">Saved Courses</p>
        <div className="mt-4 space-y-3">
          {user?.savedCourses?.length ? (
            user.savedCourses.map((course) => (
              <div key={course._id || course} className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">{course.name || "Saved course"}</p>
                <p className="mt-1 text-sm text-slate-600">{course.duration || "Details available in course explorer"}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600">You haven&apos;t saved any courses yet.</p>
          )}
        </div>
      </SectionCard>

      <SectionCard>
        <p className="section-title">Saved Colleges</p>
        <div className="mt-4 space-y-3">
          {user?.savedColleges?.length ? (
            user.savedColleges.map((college) => (
              <div key={college._id || college} className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">{college.name || "Saved college"}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {college.location?.city ? `${college.location.city}, ${college.location.state}` : "Details available in college explorer"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600">You haven&apos;t saved any colleges yet.</p>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
