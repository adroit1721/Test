import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAdminData } from '../context/AdminDataContext';
import { TrainingAnnouncement } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Shirt,
  Download,
  CheckCircle,
  ShieldAlert,
  Sparkles,
  Printer,
  Compass,
  Trophy,
  Send,
  HelpCircle,
  CheckCircle2,
  FileText,
  X,
  ExternalLink,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { framerFadeUp, framerSectionVariants, framerPopItemVariants, scrollViewportConfig } from '../utils/motionVariants';

export const TrainingEventsView: React.FC = () => {
  const {
    trainingAnnouncements,
    trainingFormFields,
    addTrainingSubmission,
    platoonRoutineConfig,
  } = useAdminData();

  // Active filter: 'all' | 'trainings' | 'events'
  const [activeFilter, setActiveFilter] = useState<'all' | 'trainings' | 'events'>('all');
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Selected event for registration modal
  const [registeringEvent, setRegisteringEvent] = useState<TrainingAnnouncement | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  // Counts
  const trainingCount = trainingAnnouncements.filter(
    (item) => (item.type || (item.category === 'Camp' || item.category === 'Parade' || item.category === 'Special Drill' ? 'training' : 'event')) === 'training'
  ).length;

  const eventCount = trainingAnnouncements.filter(
    (item) => (item.type || (item.category === 'Camp' || item.category === 'Parade' || item.category === 'Special Drill' ? 'training' : 'event')) === 'event'
  ).length;

  // Filtered announcements
  const currentAnnouncements = trainingAnnouncements.filter((item) => {
    if (activeFilter === 'all') return true;
    const itemType = item.type || (item.category === 'Camp' || item.category === 'Parade' || item.category === 'Special Drill' ? 'training' : 'event');
    return activeFilter === 'trainings' ? itemType === 'training' : itemType === 'event';
  });

  const handleOpenRegistration = (event: TrainingAnnouncement) => {
    setRegisteringEvent(event);
    setFormData({});
    setFormSubmitted(false);
    setFormError('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!registeringEvent) return;

    // Check required fields
    for (const field of trainingFormFields) {
      if (field.required && (!formData[field.id] || !formData[field.id].trim())) {
        setFormError(`Please fill in the required field: "${field.label}"`);
        return;
      }
    }

    addTrainingSubmission({
      formTitle: registeringEvent.title || registeringEvent.activity || 'Platoon Event Registration',
      data: {
        ...formData,
        'Event ID': registeringEvent.id,
        'Event Title': registeringEvent.title || registeringEvent.activity,
        'Event Date': registeringEvent.date || registeringEvent.day || '',
      },
    });

    setFormSubmitted(true);
    setFormData({});
  };

  const handleDownloadRoutinePDF = () => {
    if (platoonRoutineConfig?.pdfUrl) {
      // Direct file download or open
      const link = document.createElement('a');
      link.href = platoonRoutineConfig.pdfUrl;
      link.download = platoonRoutineConfig.fileName || 'NGDC_Platoon_Routine.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      setShowPrintModal(true);
    }
  };

  return (
    <div className="space-y-10 max-w-[1120px] mx-auto px-4 w-full">
      {/* Top Banner */}
      <motion.section
        variants={framerSectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewportConfig}
        className="bg-[#f6f3ed] dark:bg-[#1e1d19] p-6 md:p-10 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <motion.span
              variants={framerPopItemVariants}
              className="inline-block px-3 py-1 bg-[#eedc82] text-[#1c1c18] font-bold text-xs rounded-full uppercase tracking-wider"
            >
              Trainings & Events Center
            </motion.span>
            <motion.h1
              variants={framerPopItemVariants}
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1c1c18] dark:text-[#fcfbf7] tracking-tight"
            >
              Platoon Operations & Activities
            </motion.h1>
            <motion.p
              variants={framerPopItemVariants}
              className="text-xs sm:text-sm md:text-base text-[#695c4e] dark:text-[#aca596]"
            >
              Official drill notifications, ceremonial event announcements, and contingent activity schedules.
            </motion.p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-print-schedule"
              onClick={() => setShowPrintModal(true)}
              className="japandi-btn-secondary text-xs sm:text-sm bg-[#fcf9f3] dark:bg-[#26241f] hover:scale-102 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
              <span>Print Schedule</span>
            </button>
          </div>
        </div>
      </motion.section>

      {/* DYNAMIC PLATOON OPERATIONS ROUTINE & PDF DOWNLOAD - ONLY SHOWN IF ADMIN PUBLISHED */}
      {platoonRoutineConfig?.isPublished && (
        <motion.section
          variants={framerFadeUp}
          initial="hidden"
          animate="visible"
          className="bg-gradient-to-r from-[#fcf9f3] via-[#f7f4ec] to-[#f4f0e4] dark:from-[#1e1d19] dark:via-[#191814] dark:to-[#141310] p-6 md:p-8 rounded-3xl border-2 border-[#eedc82]/80 dark:border-[#eedc82]/30 shadow-md relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#eedc82] text-[#1c1c18]">
                  <FileText className="w-4 h-4" />
                </span>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#6b5e10] dark:text-[#eedc82]">
                  Official Platoon Routine
                </span>
                {platoonRoutineConfig.effectiveDate && (
                  <span className="text-[11px] font-semibold text-[#7c7767] dark:text-[#aca596] bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full">
                    {platoonRoutineConfig.effectiveDate}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                {platoonRoutineConfig.title || 'Official Routine & Operations Schedule'}
              </h2>

              {platoonRoutineConfig.instructions && (
                <p className="text-xs sm:text-sm text-[#555042] dark:text-[#cdc6b3] leading-relaxed">
                  {platoonRoutineConfig.instructions}
                </p>
              )}

              {platoonRoutineConfig.fileName && (
                <p className="text-[11px] text-[#7c7767] dark:text-[#999] font-mono">
                  Document: {platoonRoutineConfig.fileName}
                </p>
              )}
            </div>

            <div className="shrink-0 flex items-center">
              <button
                id="btn-download-routine-pdf"
                onClick={handleDownloadRoutinePDF}
                className="japandi-btn-primary text-xs sm:text-sm py-3 px-5 hover:scale-103 active:scale-95 transition-all shadow-md flex items-center gap-2 font-bold cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Routine</span>
              </button>
            </div>
          </div>
        </motion.section>
      )}

      {/* Navigation Filter Tabs: All vs Trainings vs Events */}
      <div className="flex bg-[#ebe8e2] dark:bg-[#1a1915] p-1 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#423e35] max-w-lg mx-auto">
        <button
          onClick={() => setActiveFilter('all')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-[#1c1c18] text-white shadow-xs'
              : 'text-[#555042] dark:text-[#cdc6b3] hover:text-[#1c1c18]'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-[#eedc82]" />
          <span>All Schedules</span>
          <span className="text-[10px] opacity-80 font-mono px-1.5 py-0.2 bg-white/20 dark:bg-white/10 rounded-full">
            {trainingAnnouncements.length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('trainings')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeFilter === 'trainings'
              ? 'bg-[#1c1c18] text-white shadow-xs'
              : 'text-[#555042] dark:text-[#cdc6b3] hover:text-[#1c1c18]'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-[#eedc82]" />
          <span>Trainings</span>
          <span className="text-[10px] opacity-80 font-mono px-1.5 py-0.2 bg-white/20 dark:bg-white/10 rounded-full">
            {trainingCount}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('events')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeFilter === 'events'
              ? 'bg-[#1c1c18] text-white shadow-xs'
              : 'text-[#555042] dark:text-[#cdc6b3] hover:text-[#1c1c18]'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-[#eedc82]" />
          <span>Platoon Events</span>
          <span className="text-[10px] opacity-80 font-mono px-1.5 py-0.2 bg-white/20 dark:bg-white/10 rounded-full">
            {eventCount}
          </span>
        </button>
      </div>

      {/* Announcements Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentAnnouncements.length === 0 ? (
          <div className="col-span-1 md:col-span-2 text-center py-16 bg-[#fcf9f3] dark:bg-[#1e1d19] rounded-3xl border border-[#cdc6b3]/40 p-6 space-y-2">
            <Calendar className="w-8 h-8 text-[#7c7767] mx-auto opacity-50" />
            <h3 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7]">No Announcements Found</h3>
            <p className="text-xs text-[#7c7767]">
              There are currently no announcements in this category. Check back soon for newly published training sessions or platoon events.
            </p>
          </div>
        ) : (
          currentAnnouncements.map((routine) => {
            const isEvent = (routine.type || (routine.category === 'Workshop' || routine.category === 'Competition' ? 'event' : 'training')) === 'event';
            return (
              <motion.div
                key={routine.id}
                variants={framerPopItemVariants}
                whileHover={{ y: -3 }}
                className="p-6 bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] space-y-4 shadow-xs hover:shadow-md transition-all rounded-3xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#cdc6b3]/50 dark:border-[#423e35] pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        isEvent
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300'
                          : 'bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]'
                      }`}>
                        {isEvent ? 'Platoon Event' : 'Training'}
                      </span>
                      <span className="text-xs font-semibold text-[#7c7767] dark:text-[#aca596]">
                        {routine.category}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      routine.status === 'Upcoming'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                        : routine.status === 'Ongoing'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        : 'bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}>
                      {routine.status || 'Upcoming'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                      {routine.title || routine.activity}
                    </h3>
                    {routine.description && (
                      <p className="text-xs text-[#695c4e] dark:text-[#aca596] mt-1 leading-relaxed">
                        {routine.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-[#4a4738] dark:text-[#aca596] bg-[#f6f3ed] dark:bg-[#161512] p-3.5 rounded-2xl border border-[#cdc6b3]/30 dark:border-[#3a372e]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82] shrink-0" />
                      <span className="font-semibold text-[#1c1c18] dark:text-[#fcfbf7]">
                        {routine.date || routine.day}
                      </span>
                      {routine.time && (
                        <span className="text-[#7c7767]">• {routine.time}</span>
                      )}
                    </div>

                    {routine.venue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82] shrink-0" />
                        <span className="truncate"><strong>Venue:</strong> {routine.venue}</span>
                      </div>
                    )}

                    {routine.instructor && (
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82] shrink-0" />
                        <span className="truncate"><strong>Instructor:</strong> {routine.instructor}</span>
                      </div>
                    )}

                    {routine.uniform && (
                      <div className="flex items-center gap-2">
                        <Shirt className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82] shrink-0" />
                        <span><strong>Uniform:</strong> {routine.uniform}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Conditional Action: ONLY if this specific event has a registration form */}
                {routine.hasRegistrationForm && (
                  <div className="pt-2 border-t border-[#cdc6b3]/40 dark:border-[#423e35]">
                    <button
                      onClick={() => handleOpenRegistration(routine)}
                      className="w-full japandi-btn-primary text-xs py-2 px-3 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Register for this {isEvent ? 'Event' : 'Training'}</span>
                      <ChevronRight className="w-3 h-3 ml-auto opacity-70" />
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </section>

      {/* Attendance & Uniform Rules Notice Box */}
      <section className="bg-[#fcf9f3] dark:bg-[#1e1d19] p-6 md:p-8 rounded-3xl border border-[#cdc6b3] dark:border-[#423e35] flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="p-4 rounded-2xl bg-[#eedc82]/40 text-[#6b5e10] dark:text-[#eedc82] shrink-0">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h4 className="text-base sm:text-lg font-bold text-[#1c1c18] dark:text-[#fcfbf7]">Parade Attendance Mandate</h4>
          <p className="text-xs md:text-sm text-[#4a4738] dark:text-[#aca596] leading-relaxed">
            Minimum <strong>75% parade attendance</strong> is strictly enforced to qualify for uniform issuance, annual camp nominations, and Certificate examination eligibility. Unexcused absence on consecutive parade days leads to show-cause notices.
          </p>
        </div>
      </section>

      {/* REGISTRATION MODAL - ONLY OPENS WHEN A CADET CLICKS "REGISTER" ON A RELEVANT EVENT */}
      <AnimatePresence>
        {registeringEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between border-b border-[#cdc6b3]/50 dark:border-[#423e35] pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6b5e10] dark:text-[#eedc82] bg-[#eedc82]/40 px-2 py-0.5 rounded-full">
                    Enrollment
                  </span>
                  <h3 className="text-lg font-bold text-[#1c1c18] dark:text-[#fcfbf7] mt-1">
                    {registeringEvent.title || registeringEvent.activity}
                  </h3>
                  <p className="text-xs text-[#7c7767] dark:text-[#aca596]">
                    {registeringEvent.date || registeringEvent.day} • {registeringEvent.time}
                  </p>
                </div>
                <button
                  onClick={() => setRegisteringEvent(null)}
                  className="p-1 rounded-full text-[#7c7767] hover:text-[#1c1c18] dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formSubmitted ? (
                <div className="p-6 text-center bg-[#f6f3ed] dark:bg-[#141311] rounded-2xl border border-emerald-300 dark:border-emerald-800 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                    Registration Submitted Successfully!
                  </h4>
                  <p className="text-xs text-[#695c4e] dark:text-[#aca596]">
                    Your participation record has been logged in the Platoon office database.
                  </p>
                  <button
                    onClick={() => setRegisteringEvent(null)}
                    className="japandi-btn-primary text-xs py-2 px-4 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                  {formError && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs font-semibold">
                      {formError}
                    </div>
                  )}

                  {trainingFormFields.length === 0 ? (
                    <div className="p-4 bg-[#f6f3ed] dark:bg-[#141311] rounded-xl text-center text-[#7c7767]">
                      No custom fields are currently required. Click submit to confirm attendance.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {trainingFormFields.map((field) => (
                        <div key={field.id} className="space-y-1">
                          <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                          </label>

                          {field.type === 'textarea' ? (
                            <textarea
                              required={field.required}
                              placeholder={field.placeholder || `Enter ${field.label}...`}
                              value={formData[field.id] || ''}
                              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                              rows={2}
                              className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] p-2.5 rounded-xl text-xs outline-none focus:border-[#1c1c18] dark:focus:border-[#eedc82] resize-none text-[#1c1c18] dark:text-[#fcfbf7]"
                            />
                          ) : field.type === 'select' && field.options ? (
                            <select
                              required={field.required}
                              value={formData[field.id] || ''}
                              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                              className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-xs outline-none focus:border-[#1c1c18] dark:focus:border-[#eedc82] text-[#1c1c18] dark:text-[#fcfbf7]"
                            >
                              <option value="">Select option...</option>
                              {field.options.map((opt, oIdx) => (
                                <option key={oIdx} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={field.type}
                              required={field.required}
                              placeholder={field.placeholder || `Enter ${field.label}...`}
                              value={formData[field.id] || ''}
                              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                              className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-xs outline-none focus:border-[#1c1c18] dark:focus:border-[#eedc82] text-[#1c1c18] dark:text-[#fcfbf7]"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#cdc6b3]/40 dark:border-[#423e35]">
                    <button
                      type="button"
                      onClick={() => setRegisteringEvent(null)}
                      className="japandi-btn-secondary text-xs py-2 px-3 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="japandi-btn-primary text-xs py-2 px-5 font-bold cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Registration</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Print Schedule Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#cdc6b3] dark:border-[#423e35] pb-3">
              <div>
                <h3 className="text-xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">Official Training Routine Slip</h3>
                <p className="text-xs text-[#695c4e] dark:text-[#aca596]">NGDC-BNCC Platoon • Academic Session</p>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-xs bg-[#f0eee8] dark:bg-[#26241f] hover:bg-[#ebe8e2] px-3 py-1.5 rounded-full font-bold text-[#1c1c18] dark:text-[#fcfbf7] cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs bg-[#f6f3ed] dark:bg-[#141311] p-4 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#333]">
              <div className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] border-b border-[#cdc6b3]/40 dark:border-[#333] pb-2 flex justify-between">
                <span>Platoon Training Matrix</span>
                <span className="text-[#6b5e10] dark:text-[#eedc82]">Approved by PUO</span>
              </div>
              {trainingAnnouncements.map((item) => (
                <div key={item.id} className="py-2 border-b border-[#cdc6b3]/20 dark:border-[#333] flex justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#1c1c18] dark:text-[#fcfbf7]">{item.date || item.day}: </span>
                    <span className="text-[#4a4738] dark:text-[#aca596]">{item.title || item.activity}</span>
                  </div>
                  <span className="text-[#695c4e] dark:text-[#999] font-medium shrink-0 ml-2">{item.time}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="japandi-btn-primary text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
