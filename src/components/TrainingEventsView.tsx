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
  CheckCircle2
} from 'lucide-react';
import { framerFadeUp, framerSectionVariants, framerPopItemVariants, scrollViewportConfig } from '../utils/motionVariants';

export const TrainingEventsView: React.FC = () => {
  const {
    trainingAnnouncements,
    customFormTitle,
    customFormDescription,
    customFormFields,
    addCustomSubmission,
  } = useAdminData();

  // Mode: 'trainings' | 'events'
  const [activeMode, setActiveMode] = useState<'trainings' | 'events'>('trainings');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Custom Form builder state in Public view
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  // Filter announcements according to mode
  const currentAnnouncements = trainingAnnouncements.filter((item) =>
    activeMode === 'trainings' ? item.type === 'training' : item.type === 'event'
  );

  const handleDownloadPDF = () => {
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 4000);
  };

  const handleCustomFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Check required fields
    for (const field of customFormFields) {
      if (field.required && (!formData[field.id] || !formData[field.id].trim())) {
        setFormError(`Please fill in the required field: "${field.label}"`);
        return;
      }
    }

    // Submit into context
    addCustomSubmission({
      formTitle: customFormTitle,
      submittedData: formData,
    });

    setFormSubmitted(true);
    setFormData({});
  };

  return (
    <div className="space-y-12 max-w-[1120px] mx-auto px-4 w-full">
      {/* Header with Framer entrance */}
      <motion.section
        variants={framerSectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewportConfig}
        className="bg-[#f6f3ed] dark:bg-[#1e1d19] p-8 md:p-12 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs"
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
              className="text-sm md:text-base text-[#695c4e] dark:text-[#aca596]"
            >
              Official drill notifications, ceremonial event announcements, and interactive registration forms.
            </motion.p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-print-schedule"
              onClick={() => setShowPrintModal(true)}
              className="japandi-btn-secondary text-xs sm:text-sm bg-[#fcf9f3] dark:bg-[#26241f] hover:scale-103 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
              <span>Print Schedule</span>
            </button>
            <button
              id="btn-download-routine-pdf"
              onClick={handleDownloadPDF}
              className="japandi-btn-primary text-xs sm:text-sm hover:scale-103 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{downloadSuccess ? 'Downloaded!' : 'Download PDF Routine'}</span>
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Official Training Routine PDF generated for offline reference.</span>
          </div>
        )}
      </motion.section>

      {/* 2 Dedicated Navigation Tabs: Trainings vs Events */}
      <div className="flex bg-[#ebe8e2] dark:bg-[#1a1915] p-1.5 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#423e35] max-w-md mx-auto">
        <button
          onClick={() => setActiveMode('trainings')}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeMode === 'trainings'
              ? 'bg-[#1c1c18] text-white shadow-xs'
              : 'text-[#555042] dark:text-[#cdc6b3] hover:text-[#1c1c18]'
          }`}
        >
          <Compass className="w-4 h-4 text-[#eedc82]" />
          <span>1. Training Sessions</span>
          <span className="text-[10px] opacity-75 font-mono px-1.5 py-0.5 bg-white/20 rounded-full">
            {trainingAnnouncements.filter((t) => t.type === 'training').length}
          </span>
        </button>
        <button
          onClick={() => setActiveMode('events')}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeMode === 'events'
              ? 'bg-[#1c1c18] text-white shadow-xs'
              : 'text-[#555042] dark:text-[#cdc6b3] hover:text-[#1c1c18]'
          }`}
        >
          <Trophy className="w-4 h-4 text-[#eedc82]" />
          <span>2. Platoon Events</span>
          <span className="text-[10px] opacity-75 font-mono px-1.5 py-0.5 bg-white/20 rounded-full">
            {trainingAnnouncements.filter((t) => t.type === 'event').length}
          </span>
        </button>
      </div>

      {/* Announcements Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentAnnouncements.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-[#fcf9f3] dark:bg-[#1e1d19] rounded-3xl border border-[#cdc6b3]/40">
            <p className="text-xs text-[#7c7767]">No announcements in this category currently.</p>
          </div>
        ) : (
          currentAnnouncements.map((routine, index) => (
            <motion.div
              key={routine.id}
              variants={framerPopItemVariants}
              whileHover={{ y: -4 }}
              className="japandi-card p-6 bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] space-y-4 shadow-xs hover:shadow-md transition-all rounded-3xl"
            >
              <div className="flex items-center justify-between border-b border-[#cdc6b3]/50 dark:border-[#423e35] pb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6b5e10] dark:text-[#eedc82] bg-[#eedc82]/40 dark:bg-[#eedc82]/15 px-3 py-1 rounded-full uppercase">
                  <Calendar className="w-3.5 h-3.5" /> {routine.day}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#695c4e] dark:text-[#aca596]">
                  <Clock className="w-3.5 h-3.5 text-[#7c7767]" /> {routine.time}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b5e10] dark:text-[#eedc82] block mb-1">
                  {routine.category || routine.type}
                </span>
                <h3 className="text-lg font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                  {routine.activity}
                </h3>
              </div>

              <div className="space-y-2 text-xs text-[#4a4738] dark:text-[#aca596] bg-[#f6f3ed] dark:bg-[#161512] p-4 rounded-2xl border border-[#cdc6b3]/30 dark:border-[#3a372e]">
                {routine.instructor && (
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82] shrink-0" />
                    <span><strong>Instructor:</strong> {routine.instructor}</span>
                  </div>
                )}
                {routine.venue && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82] shrink-0" />
                    <span><strong>Venue:</strong> {routine.venue}</span>
                  </div>
                )}
                {routine.uniform && (
                  <div className="flex items-center gap-2">
                    <Shirt className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82] shrink-0" />
                    <span><strong>Uniform:</strong> {routine.uniform}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </section>

      {/* Admin Custom Built Form to Collect Details */}
      {customFormFields && customFormFields.length > 0 && (
        <motion.section
          variants={framerSectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewportConfig}
          className="bg-[#fcf9f3] dark:bg-[#1e1d19] p-8 md:p-12 rounded-3xl border border-[#cdc6b3]/60 dark:border-[#423e35] shadow-xs space-y-6"
        >
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6b5e10] dark:text-[#eedc82] bg-[#eedc82]/40 dark:bg-[#eedc82]/15 px-3 py-1 rounded-full">
              Registration / Information Collector
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
              {customFormTitle || 'Online Information & Registration Form'}
            </h2>
            <p className="text-xs sm:text-sm text-[#695c4e] dark:text-[#aca596] leading-relaxed">
              {customFormDescription || 'Please submit your details for platoon roster, camp attendance, or equipment verification.'}
            </p>
          </div>

          {formSubmitted ? (
            <div className="p-8 text-center bg-[#f6f3ed] dark:bg-[#141311] rounded-2xl border border-emerald-300 dark:border-emerald-800 space-y-3 max-w-md mx-auto">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-lg font-bold text-[#1c1c18] dark:text-[#fcfbf7]">Information Submitted Successfully</h4>
              <p className="text-xs text-[#695c4e] dark:text-[#aca596]">
                Your response has been dispatched to the PUO office records. Thank you!
              </p>
              <button
                onClick={() => setFormSubmitted(false)}
                className="japandi-btn-secondary text-xs mt-2"
              >
                Submit Another Response
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomFormSubmit} className="max-w-xl mx-auto space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs font-semibold text-center">
                  {formError}
                </div>
              )}

              <div className="space-y-3">
                {customFormFields.map((field, fIdx) => (
                  <div key={field.id ? `tf-${field.id}-${fIdx}` : `tf-${fIdx}`} className="space-y-1">
                    <label className="block text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>

                    {field.type === 'textarea' ? (
                      <textarea
                        required={field.required}
                        placeholder={field.placeholder || `Enter ${field.label}...`}
                        value={formData[field.id] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                        rows={3}
                        className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] p-3 rounded-xl text-xs outline-none focus:border-[#1c1c18] dark:focus:border-[#eedc82] resize-none text-[#1c1c18] dark:text-[#fcfbf7]"
                      />
                    ) : field.type === 'select' && field.options ? (
                      <select
                        required={field.required}
                        value={formData[field.id] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                        className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-[#1c1c18] dark:focus:border-[#eedc82] text-[#1c1c18] dark:text-[#fcfbf7]"
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
                        className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-[#1c1c18] dark:focus:border-[#eedc82] text-[#1c1c18] dark:text-[#fcfbf7]"
                      />
                    )}
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="japandi-btn-primary w-full py-3 text-xs sm:text-sm font-bold cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Details to Platoon Records</span>
              </button>
            </form>
          )}
        </motion.section>
      )}

      {/* Attendance & Uniform Rules Notice Box */}
      <section className="bg-[#fcf9f3] dark:bg-[#1e1d19] p-6 md:p-8 rounded-3xl border border-[#cdc6b3] dark:border-[#423e35] flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="p-4 rounded-2xl bg-[#eedc82]/40 text-[#6b5e10] dark:text-[#eedc82] shrink-0">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h4 className="text-lg font-bold text-[#1c1c18] dark:text-[#fcfbf7]">Parade Attendance Mandate</h4>
          <p className="text-xs md:text-sm text-[#4a4738] dark:text-[#aca596] leading-relaxed">
            Minimum <strong>75% parade attendance</strong> is strictly enforced to qualify for uniform issuance, annual camp nominations, and Certificate examination eligibility. Unexcused absence on consecutive parade days leads to show-cause notices.
          </p>
        </div>
      </section>

      {/* Print Schedule Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#fcf9f3] border border-[#cdc6b3] rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#cdc6b3] pb-3">
              <div>
                <h3 className="text-xl font-bold text-[#1c1c18]">Official Training Routine Slip</h3>
                <p className="text-xs text-[#695c4e]">NGDC-BNCC Platoon • Academic Session</p>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-xs bg-[#f0eee8] hover:bg-[#ebe8e2] px-3 py-1.5 rounded-full font-bold text-[#1c1c18]"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs bg-[#f6f3ed] p-4 rounded-2xl border border-[#cdc6b3]/50">
              <div className="font-bold text-sm text-[#1c1c18] border-b border-[#cdc6b3]/40 pb-2 flex justify-between">
                <span>Platoon Training Matrix</span>
                <span className="text-[#6b5e10]">Approved by PUO</span>
              </div>
              {trainingAnnouncements.map((item) => (
                <div key={item.id} className="py-1.5 border-b border-[#cdc6b3]/20 flex justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#1c1c18]">{item.day}: </span>
                    <span>{item.activity}</span>
                  </div>
                  <span className="text-[#695c4e] font-medium shrink-0 ml-2">{item.time}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="japandi-btn-primary text-xs"
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
