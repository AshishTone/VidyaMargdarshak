import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import SectionCard from "../components/ui/SectionCard";
import { fetchCourses, saveCourse } from "../services/platformService";
import useAuth from "../hooks/useAuth";

export default function CoursesPage() {
  const { refreshUser } = useAuth();
  const [stream, setStream] = useState("");
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchCourses(stream ? { stream } : {}).then(setCourses);
  }, [stream]);

  const handleSave = async (id) => {
    await saveCourse(id);
    await refreshUser();
  };

  return (
    <div className="space-y-6">
      <SectionCard className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="section-title">Course Explorer</p>
          <p className="mt-2 text-sm text-slate-600">
            Each card shows the study path, career outcomes, and next academic options.
          </p>
        </div>
        <select
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"
          value={stream}
          onChange={(event) => setStream(event.target.value)}
        >
          <option value="">All streams</option>
          <option value="Science">Science</option>
          <option value="Commerce">Commerce</option>
          <option value="Arts">Arts</option>
          <option value="Vocational">Vocational</option>
        </select>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        {courses.map((course) => (
          <SectionCard key={course._id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">{course.name}</h2>
                <p className="mt-2 text-sm text-slate-600">{course.overview}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {course.verifiedStatus}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {course.eligibleStreams.map((item) => (
                <span key={item} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-900">
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">Jobs it can lead to</p>
                <p className="mt-2 text-sm text-slate-600">{course.careerOutcomes.join(", ")}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Higher studies</p>
                <p className="mt-2 text-sm text-slate-600">{course.higherStudies.join(", ")}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={`/courses/${course._id}`}>
                <Button>View details</Button>
              </Link>
              <Button variant="secondary" onClick={() => handleSave(course._id)}>
                Save course
              </Button>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
