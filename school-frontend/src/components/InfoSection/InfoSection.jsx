import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  GraduationCap,
  Megaphone,
  Quote,
  RefreshCw,
  X
} from "lucide-react";
import principalImg from "../../assets/principle.jpg";
import { noticeService } from "../../services/noticeService";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Container } from "../ui/Container";
import { Section } from "../ui/Section";

const headerMotion = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 }
};

const panelMotion = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 }
};

const noticeContainerMotion = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06
    }
  }
};

const noticeItemMotion = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 }
};

const formatNoticeDate = (date) => {
  if (!date) return "Date to be announced";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
};

const getNoticeTime = (notice) => {
  const parsed = new Date(notice?.date || notice?.createdAt || 0);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const NoticeSkeleton = () => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-hidden="true">
    <div className="flex items-center justify-between gap-4">
      <div className="h-5 w-20 animate-pulse rounded-full bg-slate-100" />
      <div className="h-3 w-24 animate-pulse rounded-full bg-slate-100" />
    </div>
    <div className="mt-5 flex gap-3">
      <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-100" />
      <div className="flex-1 space-y-3 pt-1">
        <div className="h-4 w-4/5 animate-pulse rounded-full bg-slate-100" />
        <div className="h-3 w-2/3 animate-pulse rounded-full bg-slate-100" />
      </div>
    </div>
  </div>
);

const DirectorCard = ({ cmsDirector, onReadMore }) => {
  const title = cmsDirector?.title || "Learning grows best where children feel guided and respected.";
  const rawContent = cmsDirector?.content || "Welcome to Pareek Public English School. Our aim is to provide a sincere and disciplined learning environment where students receive patient guidance, strengthen their fundamentals, and build confidence step by step.\n\nWe value partnership with families, respectful conduct, and consistent effort in every classroom.";
  const paragraphs = rawContent.split("\n\n").filter(Boolean);

  return (
    <motion.article
      id="director-message"
      variants={panelMotion}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.42, ease: "easeOut" }}
      className="h-full"
    >
    <Card
      hoverLift={false}
      className="group h-full overflow-hidden rounded-[1.75rem] border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(15,23,42,0.09)] md:p-6"
    >
      <div className="grid h-full gap-6 md:grid-cols-[190px_1fr] lg:grid-cols-1 xl:grid-cols-[215px_1fr]">
        <div className="relative overflow-hidden rounded-2xl p-1 bg-gradient-to-tr from-blue-500 via-indigo-600 to-indigo-850 shadow-md">
          <img
            src={principalImg}
            alt="Director Rupesh Pareek"
            className="aspect-[4/5] h-full w-full object-cover object-top rounded-xl brightness-[1.04] contrast-[1.03] transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>

        <div className="flex flex-col justify-between gap-6 text-left">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <GraduationCap className="h-3.5 w-3.5 text-slate-700" aria-hidden="true" />
              Director's Message
            </div>

            <Quote className="mt-6 h-7 w-7 text-slate-300" aria-hidden="true" />
            <h3 className="mt-3 text-2xl font-extrabold leading-tight text-slate-950 font-display">
              {title}
            </h3>
            {paragraphs.map((p, idx) => (
              <p key={idx} className="mt-4 text-sm leading-7 text-slate-600">
                {p}
              </p>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-5">
            <p className="text-lg font-semibold text-slate-950 font-display">Rupesh Pareek</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Director, Pareek Public English School
            </p>
            <Button
              variant="outline"
              size="md"
              onClick={onReadMore}
              className="mt-5 gap-1 bg-white"
              aria-label="Read the full Director message"
            >
              Read Full Message
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  </motion.article>
  );
};

const NoticeCard = ({ notice, onSelect }) => (
  <motion.button
    type="button"
    variants={noticeItemMotion}
    transition={{ duration: 0.3, ease: "easeOut" }}
    onClick={() => onSelect(notice)}
    whileHover={{ y: -3 }}
    className="group w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-[0_10px_30px_rgba(15,23,42,0.035)] transition-all duration-300 hover:border-slate-300 hover:shadow-[0_18px_45px_rgba(15,23,42,0.07)] focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:ring-offset-2"
  >
    <div className="flex items-start justify-between gap-4">
      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-slate-500">
        {notice.category || "General"}
      </span>
      <span className="flex shrink-0 items-center gap-1.5 text-[10px] font-semibold text-slate-500">
        <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
        {formatNoticeDate(notice.date)}
      </span>
    </div>

    <div className="mt-4 flex gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition-colors group-hover:bg-white">
        <Megaphone className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h3 className="text-sm font-bold leading-6 text-slate-900 font-display">
          {notice.title}
        </h3>
        {notice.content && (
          <p className="mt-1 line-clamp-2 text-xs leading-6 text-slate-500">
            {notice.content}
          </p>
        )}
      </div>
    </div>
  </motion.button>
);

const NoticeList = ({ notices, loading, error, onRetry, onSelect }) => {
  if (loading) {
    return (
      <div className="space-y-3" aria-label="Loading latest notices" aria-live="polite">
        {Array.from({ length: 4 }).map((_, index) => (
          <NoticeSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm" role="status">
        <Bell className="mx-auto h-6 w-6 text-slate-400" aria-hidden="true" />
        <p className="mt-4 text-sm font-semibold text-slate-800">We could not load notices right now.</p>
        <p className="mt-2 text-xs leading-6 text-slate-500">Please try again in a moment.</p>
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-4 gap-2">
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Retry
        </Button>
      </div>
    );
  }

  if (notices.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm" role="status">
        <Bell className="mx-auto h-6 w-6 text-slate-400" aria-hidden="true" />
        <p className="mt-4 text-sm font-semibold text-slate-800">No notices have been published yet.</p>
        <p className="mt-2 text-xs leading-6 text-slate-500">New school updates will appear here when available.</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={noticeContainerMotion}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      className="max-h-[470px] space-y-3 overflow-y-auto pr-1"
      aria-label="Latest school notices"
    >
      {notices.map((notice) => (
        <NoticeCard key={notice._id || `${notice.title}-${notice.date}`} notice={notice} onSelect={onSelect} />
      ))}
    </motion.div>
  );
};

export const InfoSection = ({ cmsDirector }) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isDirectorModalOpen, setIsDirectorModalOpen] = useState(false);

  const loadNotices = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const data = await noticeService.getNotices();
      setNotices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading notices:", err);
      setError(true);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  const latestNotices = useMemo(() => {
    return [...notices].sort((a, b) => getNoticeTime(b) - getNoticeTime(a));
  }, [notices]);

  return (
    <Section
      id="notices"
      background="white"
      className="py-20 md:py-24 relative overflow-hidden"
      aria-labelledby="leadership-notices-heading"
    >
      {/* Decorative background color glow blobs */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[35rem] h-[35rem] rounded-full bg-blue-100/40 blur-[90px]" />
        <div className="absolute top-1/2 -left-48 w-[40rem] h-[40rem] rounded-full bg-indigo-100/30 blur-[100px]" />
        <div className="absolute -bottom-24 right-1/4 w-[30rem] h-[30rem] rounded-full bg-teal-50/40 blur-[80px]" />
      </div>
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            variants={headerMotion}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 shadow-sm"
          >
            School Leadership
          </motion.div>
          <motion.h2
            id="leadership-notices-heading"
            variants={headerMotion}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
            className="mt-5 text-3xl font-extrabold leading-tight text-slate-950 sm:text-4xl lg:text-5xl font-display"
          >
            Message from the Director & Latest Announcements
          </motion.h2>
          <motion.p
            variants={headerMotion}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.4, delay: 0.16, ease: "easeOut" }}
            className="mt-5 text-base leading-8 text-slate-600"
          >
            A clear space for school leadership, parent communication, and timely updates from Pareek Public English School.
          </motion.p>
        </div>

        <div className="mt-12 rounded-[2rem] border border-slate-200 bg-slate-50/80 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.05)] md:p-4">
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
            <DirectorCard cmsDirector={cmsDirector} onReadMore={() => setIsDirectorModalOpen(true)} />

            <motion.aside
              variants={panelMotion}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.22 }}
              transition={{ duration: 0.42, delay: 0.08, ease: "easeOut" }}
              className="h-full"
              aria-labelledby="notice-board-heading"
            >
              <Card
                hoverLift={false}
                className="h-full rounded-[1.75rem] border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.05)] md:p-6"
              >
                <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      <Bell className="h-3.5 w-3.5 text-slate-700" aria-hidden="true" />
                      Latest Notices
                    </div>
                    <h3 id="notice-board-heading" className="mt-4 text-2xl font-extrabold text-slate-950 font-display">
                      School Notice Board
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Recent announcements, events, and parent updates from the school office.
                    </p>
                  </div>
                </div>

                <NoticeList
                  notices={latestNotices}
                  loading={loading}
                  error={error}
                  onRetry={loadNotices}
                  onSelect={setSelectedNotice}
                />
              </Card>
            </motion.aside>
          </div>
        </div>
      </Container>

      <AnimatePresence>
        {selectedNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNotice(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="notice-dialog-title"
              className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                  {selectedNotice.category || "General"}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedNotice(null)}
                  className="rounded-xl bg-slate-50 p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  aria-label="Close notice details"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <h3 id="notice-dialog-title" className="mt-5 text-lg font-bold leading-7 text-slate-950 font-display">
                {selectedNotice.title}
              </h3>
              <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                {formatNoticeDate(selectedNotice.date)}
              </p>
              <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-600">
                {selectedNotice.content || "Details for this notice will be updated soon."}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDirectorModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDirectorModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="director-dialog-title"
              className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-2xl md:p-8"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Director's Message</p>
                  <h3 id="director-dialog-title" className="mt-1 text-xl font-bold text-slate-950 font-display">
                    A note to parents and students
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDirectorModalOpen(false)}
                  className="rounded-xl bg-slate-50 p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  aria-label="Close Director message"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-[110px_1fr]">
                <div className="h-32 w-28 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                  <img src={principalImg} alt="Director Rupesh Pareek" className="h-full w-full object-cover object-top" loading="lazy" />
                </div>
                <div className="space-y-4 text-sm leading-7 text-slate-600">
                  <p>
                    At Pareek Public English School, we believe that meaningful education is built through regular effort, respectful discipline, and a close partnership between school and family.
                  </p>
                  <p>
                    Our teachers work to create classrooms where students can ask questions, strengthen fundamentals, participate in activities, and develop confidence at their own pace.
                  </p>
                  <p>
                    We remain committed to a supportive school environment where children feel safe, guided, and motivated to do their best every day.
                  </p>
                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-base font-semibold text-slate-950 font-display">Rupesh Pareek</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Director, Pareek Public English School</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Section>
  );
};

export default InfoSection;