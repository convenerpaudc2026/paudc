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
  Settings,
  PlusCircle,
  ShieldCheck,
  ListChecks,
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
          api.entities.courses.query({ limit: 50 }),
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
  const completedCourseIds = new Set(
    enrollments.filter((e) => e.status === "completed").map((e) => e.course_id),
  );
  const completedCount = enrollments.filter(
    (e) => e.status === "completed",
  ).length;
  const allCoursesComplete =
    courses.length > 0 && courses.every((c) => completedCourseIds.has(c.id));
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

  const isAdmin = user?.role === 'admin';

  const ADMIN_ACTIONS = [
    {
      icon: PlusCircle,
      label: 'Create Course',
      desc: 'Add a new course or module',
      href: '/lms/admin',
      color: '#1B5E3B',
    },
    {
      icon: ListChecks,
      label: 'Manage Content',
      desc: 'Edit modules & quizzes',
      href: '/lms/admin',
      color: '#C8A046',
    },
    {
      icon: Users,
      label: 'Participants',
      desc: 'View enrolled delegates',
      href: '/team',
      color: '#022512',
    },
    {
      icon: BarChart2,
      label: 'Analytics',
      desc: 'Enrolment & progress data',
      href: '/dashboard',
      color: '#A4372C',
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
          <span
            className="text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide"
            style={{
              background: isAdmin ? '#C8A046' : '#1B5E3B',
              color: isAdmin ? '#022512' : '#F6F0E1',
            }}
          >
            {isAdmin ? '⚙ Admin' : (user?.role || 'Participant')}
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

          {/* Certificate banner — shown when every course is complete */}
          {allCoursesComplete && (
            <Link
              to="/lms/certificate"
              className="flex items-center gap-4 bg-gradient-to-r from-[#1B5E3B] to-[#022512] rounded-2xl p-5 border border-[#C8A046]/30 hover:-translate-y-0.5 transition-transform"
            >
              <div className="rounded-xl bg-[#C8A046] p-3 shrink-0">
                <Award className="w-6 h-6 text-[#022512]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-black text-[#F6F0E1] text-sm">
                  🎉 All courses complete — your certificate is ready!
                </p>
                <p className="text-xs text-[#F6F0E1]/55 mt-0.5">
                  View and print your PAUDC 2026 Certificate of Completion.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-[#C8A046] shrink-0" />
            </Link>
          )}

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

          {/* Admin Panel — visible only to admin role */}
          {isAdmin && (
            <section className="bg-[#022512] rounded-2xl p-6 border border-[#022512]/10">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-[#C8A046]" />
                <h2 className="text-sm font-black text-[#F6F0E1]">Admin Panel</h2>
                <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-[#C8A046] text-[#022512] px-2 py-0.5 rounded-full">
                  Admin Only
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {ADMIN_ACTIONS.map(({ icon: Icon, label, desc, href, color }) => (
                  <Link
                    key={href + label}
                    to={href}
                    className="bg-white/8 hover:bg-white/14 rounded-xl p-4 flex items-start gap-3 transition-colors group"
                  >
                    <div
                      className="rounded-lg p-2 shrink-0 mt-0.5"
                      style={{ background: `${color}30` }}
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#F6F0E1] text-xs leading-tight group-hover:text-[#C8A046] transition-colors">
                        {label}
                      </p>
                      <p className="text-[10px] text-[#F6F0E1]/45 mt-0.5 leading-tight">
                        {desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
                <Settings className="w-3.5 h-3.5 text-[#F6F0E1]/35" />
                <p className="text-xs text-[#F6F0E1]/40">
                  Full admin settings are available in the backend dashboard.
                </p>
              </div>
            </section>
          )}

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
