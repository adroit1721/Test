import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ASSETS } from '../data/bnccData';
import { useAdminData } from '../context/AdminDataContext';
import { MapPin, Mail, Phone, Clock, Send, CheckCircle2, ChevronDown, ChevronUp, ShieldQuestion } from 'lucide-react';
import { framerSectionVariants, framerPopItemVariants, scrollViewportConfig } from '../utils/motionVariants';

export const ContactView: React.FC = () => {
  const { contactConfig, addContactMessage } = useAdminData();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('New Cadet Recruitment Inquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Who is eligible to join the NGDC BNCC Platoon?',
      a: 'Any regular student enrolled in HSC 1st Year or Degree/Honours 1st Year at New Govt. Degree College, Rajshahi is eligible. Minimum physical height requirement is 5ft 6in for male candidates and 5ft 2in for female candidates.',
    },
    {
      q: 'Does BNCC membership require any admission fees or monthly cost?',
      a: 'No. BNCC is a voluntary government institution under the Ministry of Defence. All uniform issues, drill accessories, and camp accommodations are provided by the government free of cost.',
    },
    {
      q: 'Will cadet training interfere with regular college classes and exams?',
      a: 'Not at all. Parades and physical training take place early on Friday and Saturday mornings before regular academic lecture hours. During college term examinations, parades are adjusted accordingly.',
    },
    {
      q: 'What benefits does a BNCC ‘C’ Certificate provide in future careers?',
      a: 'Holders of BNCC Certificate ‘B’ and ‘C’ receive special preference and direct green-card privilege in Bangladesh Army, Navy, and Air Force ISSB officer selection, as well as quota considerations in various government civil services.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim() || !message.trim()) {
      setFormError('Please fill in all mandatory fields including your mobile number.');
      return;
    }
    setFormError('');
    addContactMessage({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });
    setSubmitted(true);
    setTimeout(() => {
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
    }, 1000);
  };

  return (
    <div className="space-y-12 max-w-[1120px] mx-auto px-4 w-full">
      {/* Header */}
      <motion.section
        variants={framerSectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewportConfig}
        className="bg-[#f6f3ed] p-8 md:p-12 rounded-3xl border border-[#cdc6b3]/50 shadow-sm text-center"
      >
        <motion.span variants={framerPopItemVariants} className="inline-block px-3 py-1 bg-[#eedc82] text-[#1c1c18] font-bold text-xs rounded-full uppercase tracking-wider mb-3">
          Get in Touch
        </motion.span>
        <motion.h1 variants={framerPopItemVariants} className="text-3xl md:text-4xl font-extrabold text-[#1c1c18] tracking-tight">
          Contact Platoon Command
        </motion.h1>
        <motion.p variants={framerPopItemVariants} className="text-sm md:text-base text-[#4a4738] max-w-lg mx-auto mt-2">
          Have queries about new cadet recruitment, cadet verification, or collaborative humanitarian drives? Reach out to the platoon office.
        </motion.p>
      </motion.section>

      {/* Main Grid: Form + Info Map */}
      <motion.section
        variants={framerSectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewportConfig}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      >
        {/* Contact Form */}
        <motion.div variants={framerPopItemVariants} className="lg:col-span-7 japandi-card p-6 md:p-8 bg-[#fcf9f3]">
          <h2 className="text-xl md:text-2xl font-bold text-[#1c1c18] mb-4">
            Send Official Message
          </h2>

          {submitted ? (
            <div className="py-12 flex flex-col items-center text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 bg-[#eedc82]/50 text-[#6b5e10] rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-[#1c1c18]">Message Transmitted</h3>
              <p className="text-sm text-[#4a4738] max-w-sm">
                Your communication has been dispatched to the NGDC Platoon Adjutant and PUO Office. We usually respond within 24-48 business hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="japandi-btn-secondary text-xs mt-4"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl text-xs font-medium">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1.5 pl-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cadet Sgt. Tanvir Ahmed / Guardian"
                  className="w-full bg-[#f6f3ed] dark:bg-[#191815] border border-[#cdc6b3] dark:border-[#464237] focus:border-[#1c1c18] dark:focus:border-[#eedc82] px-4 py-2.5 rounded-full outline-none text-xs md:text-sm text-[#1c1c18] dark:text-[#fcfbf7] transition-all"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1.5 pl-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XX-XXXXXX"
                    className="w-full bg-[#f6f3ed] dark:bg-[#191815] border border-[#cdc6b3] dark:border-[#464237] focus:border-[#1c1c18] dark:focus:border-[#eedc82] px-4 py-2.5 rounded-full outline-none text-xs md:text-sm text-[#1c1c18] dark:text-[#fcfbf7] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1.5 pl-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-[#f6f3ed] dark:bg-[#191815] border border-[#cdc6b3] dark:border-[#464237] focus:border-[#1c1c18] dark:focus:border-[#eedc82] px-4 py-2.5 rounded-full outline-none text-xs md:text-sm text-[#1c1c18] dark:text-[#fcfbf7] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1.5 pl-1">
                  Subject / Category
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#f6f3ed] dark:bg-[#191815] border border-[#cdc6b3] dark:border-[#464237] focus:border-[#1c1c18] dark:focus:border-[#eedc82] px-4 py-2.5 rounded-full outline-none text-xs md:text-sm text-[#1c1c18] dark:text-[#fcfbf7] transition-all"
                >
                  <option>New Cadet Recruitment Inquiry</option>
                  <option>Cadet Verification / Record Clearance</option>
                  <option>Blood Donation / Relief Collaboration</option>
                  <option>Alumni Association Network</option>
                  <option>General Message</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1.5 pl-1">
                  Message Details *
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="State your question or proposal clearly..."
                  className="w-full bg-[#f6f3ed] dark:bg-[#191815] border border-[#cdc6b3] dark:border-[#464237] focus:border-[#1c1c18] dark:focus:border-[#eedc82] px-4 py-3 rounded-2xl outline-none text-xs md:text-sm text-[#1c1c18] dark:text-[#fcfbf7] transition-all resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="japandi-btn-primary w-full py-3 text-xs md:text-sm mt-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Transmit Official Message</span>
              </button>
            </form>
          )}
        </motion.div>

        {/* Info & Map Card */}
        <motion.div variants={framerPopItemVariants} className="lg:col-span-5 space-y-6">
          <div className="japandi-card p-6 bg-[#fcf9f3] dark:bg-[#23211c] border border-[#cdc6b3]/50 dark:border-[#423e35] space-y-4">
            <h3 className="font-bold text-lg text-[#1c1c18] dark:text-[#fcfbf7]">Platoon Office Headquarters</h3>
            <div className="space-y-3 text-xs text-[#4a4738] dark:text-[#aca596]">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#1c1c18] dark:text-[#fcfbf7] block">Location:</strong>
                  <span>{contactConfig.address}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82] shrink-0" />
                <div>
                  <strong className="text-[#1c1c18] dark:text-[#fcfbf7] block">Office & Parade Hours:</strong>
                  <span>{contactConfig.paradeHours}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82] shrink-0" />
                <div>
                  <strong className="text-[#1c1c18] dark:text-[#fcfbf7] block">Official Email:</strong>
                  <span>{contactConfig.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82] shrink-0" />
                <div>
                  <strong className="text-[#1c1c18] dark:text-[#fcfbf7] block">Duty Cadet Desk:</strong>
                  <span>{contactConfig.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Google Maps Embed */}
          <div className="h-64 japandi-card overflow-hidden bg-[#ebe8e2] dark:bg-[#191815] relative border border-[#cdc6b3]/60 dark:border-[#423e35] rounded-3xl shadow-xs">
            <iframe
              src={contactConfig.mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="New Govt. Degree College, Rajshahi BNCC Unit Location"
              className="w-full h-full"
            />
            <div className="absolute bottom-3 left-3 z-10 px-3 py-1.5 bg-[#fcf9f3]/95 dark:bg-[#1e1d19]/95 backdrop-blur-md rounded-full border border-[#cdc6b3] dark:border-[#423e35] shadow-xs text-left pointer-events-none">
              <span className="text-xs font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
                {contactConfig.address}
              </span>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* FAQ Accordion Section */}
      <motion.section
        variants={framerSectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewportConfig}
        className="bg-[#f6f3ed] p-8 md:p-12 rounded-3xl border border-[#cdc6b3]/50 shadow-sm space-y-6"
      >
        <div className="flex items-center gap-2">
          <ShieldQuestion className="w-6 h-6 text-[#6b5e10]" />
          <h2 className="text-2xl font-bold text-[#1c1c18]">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              variants={framerPopItemVariants}
              className="japandi-card p-4 md:p-5 bg-[#fcf9f3] transition-all cursor-pointer"
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm md:text-base text-[#1c1c18]">{faq.q}</h4>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-[#6b5e10] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#7c7767] shrink-0" />
                )}
              </div>
              {openFaq === idx && (
                <p className="mt-3 pt-3 border-t border-[#cdc6b3]/40 text-xs md:text-sm text-[#4a4738] leading-relaxed animate-fadeIn">
                  {faq.a}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};
