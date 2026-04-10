import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  FolderOpen,
  ArrowRight,
  Award,
  Users,
  BarChart2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api, type Course, type Enrollment } from "@/lib/api";
import LMSSidebar from "@/components/lms/LMSSidebar";

export default function LMSDashboard() {
  const { user, loading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login";
    }
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [cr, er] = await Promise.all([
          api.entities.courses.query({ limit: 6 }),
          api.entities.enrollments.query({ limit: 50 }),
        ]);
        setCourses(cr.data.items);
        setEnrollments(er.data.items);
      } catch {
        // show empty state
      } finally {
        setDataLoading(false);
      }
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F0E1]">
        <div className="w-10 h-10 rounded-full border-4 border-[#1B5E3B] border-t-transparent animate-spin" />
      </div>
    );
  }

  const enrolledIds = new Set(enrollments.map((e) => e.course_id));
  const completedCount = enrollments.filter(
    (e) => e.status === "completed",
  ).length;
  const inProgressCount = enrollments.filter(
    (e) => e.status === "in_progress" || e.status === "enrolled",
  ).length;

  const STATS = [
    {
      label: "Enrolled",
      value: enrollments.length,
      icon: BookOpen,
      color: "#1B5E3B",
    },
    {
      label: "In Progress",
      value: inProgressCount,
      icon: Clock,
      color: "#C8A046",
    },
    {
      label: "Completed",
      value: completedCount,
      icon: CheckCircle2,
      color: "#A4372C",
    },
    {
      label: "Courses",
      value: courses.length,
      icon: BarChart2,
      color: "#022512",
    },
  ];

  const QUICK_LINKS = [
    {
      icon: Calendar,
      label: "Event Schedule",
      desc: "Full tournament timeline",
      href: "/schedule",
      color: "#1B5E3B",
    },
    {
      icon: FolderOpen,
      label: "Resources",
      desc: "Study materials & downloads",
      href: "/resources",
      color: "#C8A046",
    },
    {
      icon: Award,
      label: "Legacy Lab",
      desc: "Innovation initiatives",
      href: "/legacy-lab",
      color: "#A4372C",
    },
    {
      icon: Users,
      label: "Team",
      desc: "Organizing committee",
      href: "/team",
      color: "#022512",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#F6F0E1]">
      <LMSSidebar />

      <main className="flex-1 overflow-y-auto md:min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-[#F6F0E1]/95 backdrop-blur-sm border-b border-[#022512]/10 px-6 md:px-8 py-4 flex items-center justify-between mt-[52px] md:mt-0">
          <div>
            <h1 className="text-lg font-black text-[#022512] leading-tight">
              Welcome back, {user?.name?.split(" ")[0] || "Delegate"} 👋
            </h1>
            <p className="text-xs text-[#022512]/55 mt-0.5">
              PAUDC 2026 LMS Portal
            </p>
          </div>
          <span className="bg-[#1B5E3B] text-[#F6F0E1] text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
            {user?.role || "Participant"}
          </span>
        </header>

        <div className="px-6 md:px-8 py-7 space-y-9 max-w-6xl">
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-4 shadow-sm border border-[#022512]/5 flex items-center gap-3"
              >
                <div
                  className="rounded-xl p-2.5 shrink-0"
                  style={{ background: `${color}18` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <p className="text-xl font-black text-[#022512] leading-none">
                    {value}
                  </p>
                  <p className="text-xs text-[#022512]/55 font-medium mt-0.5">
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* My Courses */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-[#022512]">
                My Courses
              </h2>
              <Link
                to="/lms/courses"
                className="flex items-center gap-1 text-xs font-bold text-[#1B5E3B] hover:underline"
              >
                Browse all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {dataLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl h-44 animate-pulse"
                  />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-[#022512]/5">
                <BookOpen className="w-10 h-10 text-[#022512]/15 mx-auto mb-3" />
                <p className="font-bold text-sm text-[#022512]/60">
                  No courses available yet
                </p>
                <p className="text-xs text-[#022512]/40 mt-1">
                  Course content will appear here
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => {
                  const enr = enrollments.find(
                    (e) => e.course_id === course.id,
                  );
                  const progress = enr?.progress_percentage ?? 0;
                  return (
                    <Link
                      key={course.id}
                      to={`/lms/courses/${course.id}`}
                      className="bg-white rounded-2xl p-4 shadow-sm border border-[#022512]/5 hover:-translate-y-1 transition-transform duration-200 flex flex-col gap-3"
                    >
                      <div className="w-full h-24 rounded-xl bg-[#022512]/5 overflow-hidden flex items-center justify-center">
                        {course.thumbnail_url ? (
                          <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <BookOpen className="w-8 h-8 text-[#022512]/15" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-[#022512] text-sm leading-snug line-clamp-2">
                          {course.title}
                        </p>
                        <span className="inline-block mt-1.5 text-xs font-semibold bg-[#1B5E3B]/10 text-[#1B5E3B] px-2 py-0.5 rounded-full capitalize">
                          {course.difficulty_level}
                        </span>
                      </div>
                      {enrolledIds.has(course.id) && (
                        <div>
                          <div className="flex justify-between text-xs text-[#022512]/50 mb-1">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-[#022512]/10 rounded-full h-1.5">
                            <div
                              className="bg-[#1B5E3B] h-1.5 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Quick Links */}
          <section>
            <h2 className="text-base font-black text-[#022512] mb-4">
              Quick Access
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {QUICK_LINKS.map(({ icon: Icon, label, desc, href, color }) => (
                <Link
                  key={href}
                  to={href}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-[#022512]/5 hover:-translate-y-1 transition-transform duration-200 flex items-start gap-3"
                >
                  <div
                    className="rounded-xl p-2 shrink-0 mt-0.5"
                    style={{ background: `${color}18` }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#022512] text-xs leading-tight">
                      {label}
                    </p>
                    <p className="text-xs text-[#022512]/45 mt-0.5 leading-tight">
                      {desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
