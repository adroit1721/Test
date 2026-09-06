import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { TabType, NoticeItem, BlogItem, MemoryItem } from '../types';
import { ASSETS, NOTICES_DATA, BLOGS_DATA, MEMORIES_DATA, HERO_SLIDES_DATA } from '../data/bnccData';
import { useAdminData, DEFAULT_ABOUT_OVERVIEW } from '../context/AdminDataContext';
import { 
  Megaphone, 
  FileText, 
  MapPin, 
  Send, 
  CheckCircle2, 
  ArrowRight, 
  UserCheck, 
  Shield, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  GraduationCap,
  Award
} from 'lucide-react';
import { framerSectionVariants, framerPopItemVariants, scrollViewportConfig } from '../utils/motionVariants';

interface HomeViewProps {
  setActiveTab: (tab: TabType) => void;
  onSelectNotice: (notice: NoticeItem) => void;
  onSelectBlog: (blog: BlogItem) => void;
  onSelectMemory: (memory: MemoryItem) => void;
  onOpenCadetLogin: () => void;
  onOpenCadetRegister: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  setActiveTab,
  onSelectNotice,
  onSelectBlog,
  onSelectMemory,
  onOpenCadetLogin,
  onOpenCadetRegister,
}) => {
  const {
    heroSlides,
    principalMessage,
    vicePrincipalMessage,
    aboutOverview,
    platoonCommanderMessage,
    notices,
    blogs,
    memories,
    addContactMessage,
  } = useAdminData();

  // Active slides fallback to HERO_SLIDES_DATA if empty
  const activeSlides = heroSlides && heroSlides.length > 0 ? heroSlides : HERO_SLIDES_DATA;

  // Hero section parallax ref and transforms
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Parallax calculations for background image and overlay elements
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const heroTextY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroTextOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.1]);

  // Hero Carousel Slider State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<number>(1);
  const [isSliderPaused, setIsSliderPaused] = useState(false);
  const totalSlides = activeSlides.length;

  const nextSlide = useCallback(() => {
    setSlideDirection(1);
    setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setSlideDirection(-1);
    setCurrentSlideIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setSlideDirection(index > currentSlideIndex ? 1 : -1);
    setCurrentSlideIndex(index);
  };

  // Auto-play interval for the 5-picture slider (3 seconds)
  useEffect(() => {
    if (isSliderPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 3000);
    return () => clearInterval(timer);
  }, [isSliderPaused, nextSlide]);

  // Touch Swipe Handling for Mobile
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    setTouchStartX(null);
  };

  // Keyboard navigation for carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Slide transition variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 1.05,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 260, damping: 30 },
        opacity: { duration: 0.5 },
        scale: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
      },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
      scale: 0.96,
      transition: {
        x: { type: 'spring' as const, stiffness: 260, damping: 30 },
        opacity: { duration: 0.4 },
      },
    }),
  };

  const currentSlide = activeSlides[currentSlideIndex % totalSlides] || activeSlides[0];

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactPhone.trim() || !contactMessage.trim()) {
      setFormError('Please fill in all fields including your mobile number.');
      return;
    }
    setFormError('');
    addContactMessage({
      name: contactName.trim(),
      phone: contactPhone.trim(),
      email: contactEmail.trim(),
      message: contactMessage.trim(),
    });
    setSubmitted(true);
    setTimeout(() => {
      setContactName('');
      setContactPhone('');
      setContactEmail('');
      setContactMessage('');
    }, 1000);
  };

  return (
    <div className="space-y-12 max-w-[1120px] mx-auto px-4 w-full">
      {/* 1. Hero 5-Picture Slider / Banner Section with Framer Animations */}
      <motion.section
        ref={heroRef}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        onMouseEnter={() => setIsSliderPaused(true)}
        onMouseLeave={() => setIsSliderPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full relative h-[60vh] sm:h-[65vh] md:h-[75vh] min-h-[420px] bg-[#1a1915] overflow-hidden rounded-2xl md:rounded-3xl shadow-sm border border-[#cdc6b3]/50 dark:border-white/10 mx-auto select-none group"
      >
        {/* Animated Image Slides */}
        <AnimatePresence initial={false} custom={slideDirection}>
          <motion.div
            key={currentSlide.id}
            custom={slideDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full will-change-transform"
          >
            <motion.div
              style={{ y: imageY }}
              className="w-full h-full"
            >
              <img
                src={currentSlide.imageUrl}
                alt={currentSlide.altText}
                className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-103 transition-transform duration-1000 ease-out"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Sophisticated gradient overlay for readability and depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 pointer-events-none z-10" />

        {/* Top Floating Badge & Slide Counter */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8 z-20 flex items-center gap-3">
          <motion.div
            key={`badge-${currentSlide.id}`}
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#eedc82] text-[#1c1c18] font-bold text-[11px] sm:text-xs rounded-full uppercase tracking-wider shadow-sm"
          >
            <Shield className="w-3.5 h-3.5 text-[#6b5e10]" />
            <span>{currentSlide.badge}</span>
          </motion.div>

          <div className="bg-black/40 backdrop-blur-md border border-white/15 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium text-white/90">
            {String(currentSlideIndex + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
          </div>
        </div>

        {/* Navigation Arrow Controls */}
        <button
          id="btn-hero-slider-prev"
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/70 active:scale-95 text-white/90 hover:text-white backdrop-blur-md border border-white/20 transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer shadow-lg"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          id="btn-hero-slider-next"
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/70 active:scale-95 text-white/90 hover:text-white backdrop-blur-md border border-white/20 transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer shadow-lg"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Hero Overlay Text Content with Entrance Animation */}
        <motion.div
          style={{ y: heroTextY, opacity: heroTextOpacity }}
          className="absolute bottom-14 left-4 right-4 sm:left-6 sm:right-6 md:bottom-16 md:left-10 md:right-10 z-20 max-w-2xl text-white will-change-transform"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${currentSlide.id}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
                {currentSlide.title}
              </h2>
              <p className="text-white/90 text-xs sm:text-sm md:text-base mt-2 font-medium leading-relaxed drop-shadow-xs max-w-xl">
                {currentSlide.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Interactive Indicator Dots & Progress Bars */}
        <div className="absolute bottom-4 inset-x-0 z-20 flex items-center justify-center gap-1.5 sm:gap-2">
          {HERO_SLIDES_DATA.map((slide, idx) => {
            const isActive = idx === currentSlideIndex;
            return (
              <button
                key={slide.id}
                id={`btn-hero-dot-${idx}`}
                onClick={() => goToSlide(idx)}
                aria-label={`Go to Slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer relative overflow-hidden ${
                  isActive
                    ? 'w-8 sm:w-10 h-2 bg-[#eedc82] shadow-xs'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
              >
                {isActive && !isSliderPaused && (
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 5, ease: 'linear' }}
                    className="h-full bg-[#1c1c18]/30 absolute top-0 left-0"
                  />
                )}
              </button>
            );
          })}
        </div>
      </motion.section>

      {/* 2. Message from the Principal Section */}
      {principalMessage?.enabled !== false && (
        <motion.section
          id="section-principal-message"
          variants={framerSectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewportConfig}
          className="px-6 sm:px-8 md:px-12 py-10 md:py-14 bg-[#f6f3ed] dark:bg-[#1e1d19] rounded-3xl border border-[#cdc6b3]/60 dark:border-[#423e35] shadow-xs relative overflow-hidden"
        >
          {/* Subtle decorative background watermark */}
          <div className="absolute -right-16 -bottom-16 w-80 h-80 pointer-events-none opacity-[0.035] dark:opacity-[0.05] text-[#1c1c18] dark:text-[#eedc82]">
            <GraduationCap className="w-full h-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            {/* Left Column: Portrait & Leader Meta */}
            <motion.div
              variants={framerPopItemVariants}
              className="lg:col-span-4 flex flex-col items-center text-center space-y-3"
            >
              <div className="relative group">
                <div className="w-44 h-44 sm:w-48 sm:h-48 md:w-52 md:h-52 rounded-full overflow-hidden border-4 border-[#cdc6b3] dark:border-[#464237] ring-4 ring-[#eedc82]/30 shadow-md bg-[#eae4d5] dark:bg-[#25231c]">
                  <img
                    src={principalMessage?.photoUrl}
                    alt={principalMessage?.name || 'Principal'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute bottom-1 right-2 bg-[#1c1c18] text-[#eedc82] p-2 rounded-full shadow-md border border-[#eedc82]/40">
                  <GraduationCap className="w-4 h-4" />
                </div>
              </div>

              <div className="pt-2">
                <h3 className="text-xl sm:text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7] tracking-tight">
                  {principalMessage?.name}
                </h3>
                <p className="text-sm font-semibold text-[#6b5e10] dark:text-[#eedc82] mt-0.5">
                  {principalMessage?.designation}
                </p>
                <p className="text-xs text-[#7c7767] dark:text-[#aca596] mt-0.5 font-medium">
                  {principalMessage?.subDesignation}
                </p>
                {principalMessage?.badge && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 mt-2.5 bg-[#eedc82]/30 dark:bg-[#eedc82]/15 text-[#6b5e10] dark:text-[#eedc82] text-[11px] font-bold rounded-full uppercase tracking-wider">
                    <Shield className="w-3 h-3" />
                    <span>{principalMessage.badge}</span>
                  </span>
                )}
              </div>
            </motion.div>

            {/* Right Column: Heading, Blockquote & Speech */}
            <motion.div
              variants={framerPopItemVariants}
              className="lg:col-span-8 space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#eedc82]/40 dark:bg-[#eedc82]/20 rounded-full text-xs font-bold text-[#6b5e10] dark:text-[#eedc82] uppercase tracking-wider">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Patron & Leadership</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1c1c18] dark:text-[#fcfbf7] tracking-tight">
                Message from the Principal
              </h2>

              {principalMessage?.quote && (
                <blockquote className="border-l-4 border-[#eedc82] pl-4 sm:pl-5 py-2 italic text-sm sm:text-base md:text-lg text-[#3a372c] dark:text-[#ded7c8] leading-relaxed font-serif bg-[#efeae0]/60 dark:bg-[#26241e]/60 rounded-r-xl my-3">
                  {principalMessage.quote}
                </blockquote>
              )}

              <p className="text-sm sm:text-base text-[#4a4738] dark:text-[#aca596] leading-relaxed whitespace-pre-line">
                {principalMessage?.message}
              </p>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* 3. Message from the Vice-Principal Section */}
      {vicePrincipalMessage?.enabled !== false && (
        <motion.section
          id="section-vice-principal-message"
          variants={framerSectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewportConfig}
          className="px-6 sm:px-8 md:px-12 py-10 md:py-14 bg-[#fcf9f3] dark:bg-[#181714] rounded-3xl border border-[#cdc6b3]/60 dark:border-[#38352b] shadow-xs relative overflow-hidden"
        >
          {/* Subtle decorative background watermark */}
          <div className="absolute -left-16 -bottom-16 w-80 h-80 pointer-events-none opacity-[0.035] dark:opacity-[0.05] text-[#1c1c18] dark:text-[#eedc82]">
            <Award className="w-full h-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            {/* Right Column on Desktop: Portrait & Leader Meta (Zigzag layout) */}
            <motion.div
              variants={framerPopItemVariants}
              className="lg:col-span-4 lg:order-2 flex flex-col items-center text-center space-y-3"
            >
              <div className="relative group">
                <div className="w-44 h-44 sm:w-48 sm:h-48 md:w-52 md:h-52 rounded-full overflow-hidden border-4 border-[#cdc6b3] dark:border-[#464237] ring-4 ring-[#eedc82]/30 shadow-md bg-[#eae4d5] dark:bg-[#25231c]">
                  <img
                    src={vicePrincipalMessage?.photoUrl}
                    alt={vicePrincipalMessage?.name || 'Vice-Principal'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute bottom-1 right-2 bg-[#1c1c18] text-[#eedc82] p-2 rounded-full shadow-md border border-[#eedc82]/40">
                  <Award className="w-4 h-4" />
                </div>
              </div>

              <div className="pt-2">
                <h3 className="text-xl sm:text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7] tracking-tight">
                  {vicePrincipalMessage?.name}
                </h3>
                <p className="text-sm font-semibold text-[#6b5e10] dark:text-[#eedc82] mt-0.5">
                  {vicePrincipalMessage?.designation}
                </p>
                <p className="text-xs text-[#7c7767] dark:text-[#aca596] mt-0.5 font-medium">
                  {vicePrincipalMessage?.subDesignation}
                </p>
                {vicePrincipalMessage?.badge && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 mt-2.5 bg-[#eedc82]/30 dark:bg-[#eedc82]/15 text-[#6b5e10] dark:text-[#eedc82] text-[11px] font-bold rounded-full uppercase tracking-wider">
                    <Shield className="w-3 h-3" />
                    <span>{vicePrincipalMessage.badge}</span>
                  </span>
                )}
              </div>
            </motion.div>

            {/* Left Column on Desktop: Heading, Blockquote & Speech */}
            <motion.div
              variants={framerPopItemVariants}
              className="lg:col-span-8 lg:order-1 space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#eedc82]/40 dark:bg-[#eedc82]/20 rounded-full text-xs font-bold text-[#6b5e10] dark:text-[#eedc82] uppercase tracking-wider">
                <Award className="w-3.5 h-3.5" />
                <span>Vice-Patron & Leadership</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1c1c18] dark:text-[#fcfbf7] tracking-tight">
                Message from the Vice-Principal
              </h2>

              {vicePrincipalMessage?.quote && (
                <blockquote className="border-l-4 border-[#eedc82] pl-4 sm:pl-5 py-2 italic text-sm sm:text-base md:text-lg text-[#3a372c] dark:text-[#ded7c8] leading-relaxed font-serif bg-[#efeae0]/60 dark:bg-[#26241e]/60 rounded-r-xl my-3">
                  {vicePrincipalMessage.quote}
                </blockquote>
              )}

              <p className="text-sm sm:text-base text-[#4a4738] dark:text-[#aca596] leading-relaxed whitespace-pre-line">
                {vicePrincipalMessage?.message}
              </p>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* 4. About Us Section with Framer Scroll Reveal (Taking data from About Our Platoon & Platoon Commander) */}
      <motion.section
        id="section-home-about"
        variants={framerSectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewportConfig}
        className="px-6 sm:px-8 md:px-12 py-10 md:py-14 bg-[#f6f3ed] dark:bg-[#1e1d19] rounded-3xl border border-[#cdc6b3]/60 dark:border-[#423e35] shadow-xs relative overflow-hidden"
      >
        {/* Subtle decorative background watermark */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 pointer-events-none opacity-[0.035] dark:opacity-[0.05] text-[#1c1c18] dark:text-[#eedc82]">
          <Shield className="w-full h-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center relative z-10">
          {/* Left Column: About Our Platoon Narrative */}
          <motion.div variants={framerPopItemVariants} className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#eedc82] text-[#1c1c18] font-bold text-xs rounded-full uppercase tracking-wider shadow-2xs">
                <Shield className="w-3.5 h-3.5 text-[#6b5e10]" />
                <span>{aboutOverview?.badge || 'About Our Platoon'}</span>
              </span>
              {aboutOverview?.established && (
                <span className="px-3 py-1 bg-[#eedc82]/30 dark:bg-[#eedc82]/15 text-[#6b5e10] dark:text-[#eedc82] text-xs font-semibold rounded-full border border-[#eedc82]/40">
                  {aboutOverview.established}
                </span>
              )}
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1c1c18] dark:text-[#fcfbf7] tracking-tight">
                {aboutOverview?.title || 'Bangladesh National Cadet Corps'}
              </h2>
              {aboutOverview?.subtitle && (
                <p className="text-xs sm:text-sm font-semibold text-[#6b5e10] dark:text-[#eedc82] mt-1.5">
                  {aboutOverview.subtitle}
                </p>
              )}
            </div>

            <p className="text-sm sm:text-base leading-relaxed text-[#4a4738] dark:text-[#aca596] whitespace-pre-line line-clamp-5 sm:line-clamp-6">
              {aboutOverview?.content || DEFAULT_ABOUT_OVERVIEW.content}
            </p>

            <div className="pt-2 flex items-center gap-4">
              <button
                id="btn-about-read-more"
                onClick={() => {
                  setActiveTab('about');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="japandi-btn-secondary group cursor-pointer"
              >
                <span>Read Full Platoon History</span>
                <ArrowRight className="w-4 h-4 text-[#6b5e10] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Right Column: PUO & Platoon Commander Card */}
          <motion.div variants={framerPopItemVariants} className="lg:col-span-5 flex justify-center lg:justify-end">
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="japandi-card p-6 sm:p-7 w-full max-w-sm flex flex-col items-center text-center space-y-4 bg-[#fcf9f3] dark:bg-[#141311] border border-[#cdc6b3]/60 dark:border-[#423e35] shadow-xs hover:shadow-md hover:border-[#7c7767] transition-all relative group rounded-3xl"
            >
              {/* Officer Photograph */}
              <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-[#cdc6b3] dark:border-[#464237] ring-4 ring-[#eedc82]/30 shadow-md bg-[#ded2be] dark:bg-[#25231c] shrink-0 relative">
                {platoonCommanderMessage?.photoUrl ? (
                  <img
                    src={platoonCommanderMessage.photoUrl}
                    alt={platoonCommanderMessage?.name || 'Platoon Commander'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-3xl text-[#6b5e10] dark:text-[#eedc82] bg-[#eedc82]/20">
                    {platoonCommanderMessage?.name?.charAt(0) || 'P'}
                  </div>
                )}
                <div className="absolute bottom-1 right-2 bg-[#1c1c18] text-[#eedc82] p-1.5 rounded-full shadow-md border border-[#eedc82]/40">
                  <Award className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Officer Details */}
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                  {platoonCommanderMessage?.name || 'Md. Abdul Matin'}
                </h3>
                <p className="text-sm font-semibold text-[#6b5e10] dark:text-[#eedc82] mt-1">
                  {platoonCommanderMessage?.designation || 'Professor Under Officer (PUO) & Platoon Commander'}
                </p>
                {platoonCommanderMessage?.subDesignation && (
                  <p className="text-xs text-[#7c7767] dark:text-[#aca596] mt-0.5 font-medium leading-tight">
                    {platoonCommanderMessage.subDesignation}
                  </p>
                )}
              </div>

              {/* Officer Personal Quote (if available) */}
              {platoonCommanderMessage?.quote && (
                <p className="text-xs italic text-[#4a4738] dark:text-[#aca596] px-2 leading-relaxed border-t border-b border-[#cdc6b3]/30 dark:border-[#423e35] py-2 font-serif">
                  "{platoonCommanderMessage.quote.replace(/^"|"$/g, '').slice(0, 140)}..."
                </p>
              )}

              {/* Badges & Mottos */}
              <div className="w-full pt-2 border-t border-[#cdc6b3]/40 dark:border-[#423e35] flex items-center justify-center gap-2 text-xs text-[#504537] dark:text-[#aca596]">
                <Shield className="w-3 h-3 text-[#6b5e10] dark:text-[#eedc82]" />
                <span className="font-semibold text-[#6b5e10] dark:text-[#eedc82]">
                  {platoonCommanderMessage?.badge || 'Platoon Commander'}
                </span>
                {aboutOverview?.motto && (
                  <>
                    <span>•</span>
                    <span>{aboutOverview.motto}</span>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* 3. Notice Board & Recent Blogs Section with Framer Staggered Scroll Motion */}
      <motion.section
        variants={framerSectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewportConfig}
        className="bg-[#f6f3ed] py-12 md:py-16 px-6 md:px-10 rounded-3xl border border-[#cdc6b3]/50 shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Notice Board */}
          <motion.div
            variants={framerPopItemVariants}
            whileHover={{ y: -4 }}
            className="japandi-card p-6 md:p-8 flex flex-col h-full bg-[#fcf9f3] shadow-xs hover:shadow-md transition-all"
          >
            <div className="flex items-center space-x-3 mb-6 border-b border-[#cdc6b3] pb-4">
              <span className="p-2 rounded-xl bg-[#eedc82]/50 text-[#6b5e10]">
                <Megaphone className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-[#1c1c18]">
                  Notice Board
                </h3>
                <p className="text-xs text-[#7c7767]">Official circulars and orders</p>
              </div>
            </div>

            <ul className="space-y-3 flex-grow mb-6">
              {notices.slice(0, 5).map((notice, idx) => (
                <motion.li
                  key={notice.id}
                  variants={framerPopItemVariants}
                  onClick={() => onSelectNotice(notice)}
                  className="border-b border-[#cdc6b3]/40 pb-3 hover:bg-[#f0eee8] transition-all cursor-pointer p-3 rounded-xl group hover:translate-x-1"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#695c4e]">
                      {notice.date}
                    </span>
                    {notice.priority === 'high' && (
                      <span className="text-[10px] bg-[#eedc82] text-[#6b5e10] font-bold px-2 py-0.5 rounded-full uppercase">
                        Urgent
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm md:text-base font-semibold text-[#1c1c18] group-hover:text-[#6b5e10] transition-colors">
                    {notice.title}
                  </h4>
                </motion.li>
              ))}
            </ul>

            <button
              id="btn-read-more-notices"
              onClick={() => {
                setActiveTab('notices');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="japandi-btn-secondary w-full"
            >
              Read More Notices
            </button>
          </motion.div>

          {/* Recent Blogs */}
          <motion.div
            variants={framerPopItemVariants}
            whileHover={{ y: -4 }}
            className="japandi-card p-6 md:p-8 flex flex-col h-full bg-[#fcf9f3] shadow-xs hover:shadow-md transition-all"
          >
            <div className="flex items-center space-x-3 mb-6 border-b border-[#cdc6b3] pb-4">
              <span className="p-2 rounded-xl bg-[#eedc82]/50 text-[#6b5e10]">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-[#1c1c18]">
                  Recent Blogs
                </h3>
                <p className="text-xs text-[#7c7767]">Cadet stories & leadership insights</p>
              </div>
            </div>

            <ul className="space-y-3 flex-grow mb-6">
              {blogs.slice(0, 5).map((blog, idx) => (
                <motion.li
                  key={blog.id}
                  variants={framerPopItemVariants}
                  onClick={() => onSelectBlog(blog)}
                  className="border-b border-[#cdc6b3]/40 pb-3 hover:bg-[#f0eee8] transition-all cursor-pointer p-3 rounded-xl group hover:translate-x-1"
                >
                  <h4 className="text-sm md:text-base font-semibold text-[#1c1c18] group-hover:text-[#6b5e10] transition-colors">
                    {blog.title}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-[#695c4e] mt-1">
                    <span>{blog.author}</span>
                    <span className="text-[11px] text-[#7c7767]">{blog.readTime}</span>
                  </div>
                </motion.li>
              ))}
            </ul>

            <button
              id="btn-read-more-blogs"
              onClick={() => {
                setActiveTab('notices');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="japandi-btn-secondary w-full"
            >
              Read More Blogs
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* 4. Memories Section with Framer Scroll Stagger & Hover Scale */}
      <motion.section
        variants={framerSectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewportConfig}
        className="px-6 md:px-10 py-12 md:py-16 bg-[#f6f3ed] rounded-3xl border border-[#cdc6b3]/50 shadow-sm"
      >
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1c1c18] tracking-tight mb-2">
              Memories
            </h2>
            <p className="text-base text-[#4a4738]">
              Glimpses of our journey, training discipline, and community achievements.
            </p>
          </div>
          <button
            id="btn-view-gallery-top"
            onClick={() => {
              setActiveTab('memories');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="japandi-btn-secondary hidden md:inline-flex"
          >
            View Full Gallery
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {memories.slice(0, 4).map((memory, index) => (
            <motion.div
              key={memory.id}
              variants={framerPopItemVariants}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={() => onSelectMemory(memory)}
              className="aspect-video japandi-card overflow-hidden cursor-pointer relative group bg-[#ebe8e2] shadow-xs hover:shadow-md transition-all"
            >
              <img
                src={memory.imageUrl}
                alt={memory.altText}
                className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
                <span className="text-xs font-semibold text-[#eedc82] uppercase tracking-wider">
                  {memory.category} • {memory.date}
                </span>
                <h4 className="text-base md:text-lg font-bold text-white">
                  {memory.title}
                </h4>
                <p className="text-xs text-white/80 line-clamp-1 mt-0.5">
                  {memory.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <button
          id="btn-view-gallery-bottom"
          onClick={() => {
            setActiveTab('memories');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="japandi-btn-secondary w-full md:hidden"
        >
          View Full Gallery
        </button>
      </motion.section>

      {/* 5. Cadets Corner CTA Section */}
      <motion.section
        variants={framerSectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewportConfig}
        className="bg-[#f6f3ed] py-12 md:py-16 rounded-3xl border border-[#cdc6b3]/60 shadow-sm relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#eedc82]/25 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
        <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
          <motion.div variants={framerPopItemVariants} className="inline-flex items-center gap-1.5 p-2 px-4 rounded-full bg-[#fcf9f3] text-xs font-bold text-[#6b5e10] mb-3 border border-[#cdc6b3] shadow-xs">
            <UserCheck className="w-4 h-4" /> Cadet Self-Service Portal
          </motion.div>
          <motion.h2 variants={framerPopItemVariants} className="text-3xl md:text-4xl font-bold text-[#1c1c18] mb-3">
            Cadets Corner
          </motion.h2>
          <motion.p variants={framerPopItemVariants} className="text-base md:text-lg text-[#4a4738] mb-8 leading-relaxed">
            Access the portal to check attendance records, generate your digital Cadet ID, verify training camp eligibility, and download official manuals.
          </motion.p>
          <motion.div variants={framerPopItemVariants} className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              id="btn-cadet-login-home"
              onClick={onOpenCadetLogin}
              className="japandi-btn-primary text-base px-8 py-3.5 shadow-sm hover:scale-105 active:scale-95 transition-all"
            >
              <span>Cadet Login</span>
            </button>
            <button
              id="btn-cadet-register-home"
              onClick={onOpenCadetRegister}
              className="japandi-btn-secondary text-base px-8 py-3.5 bg-[#fcf9f3] hover:scale-105 active:scale-95 transition-all"
            >
              <span>Cadet Registration</span>
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* 6. Contact Us Section with Framer Scroll Reveal */}
      <motion.section
        variants={framerSectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewportConfig}
        className="px-6 md:px-10 py-12 md:py-16 bg-[#f6f3ed] rounded-3xl border border-[#cdc6b3]/50 shadow-sm"
      >
        <motion.h2 variants={framerPopItemVariants} className="text-3xl md:text-4xl font-bold text-[#1c1c18] mb-8">
          Contact Us
        </motion.h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
          {/* Form */}
          <motion.div variants={framerPopItemVariants} className="japandi-card p-6 md:p-8 bg-[#fcf9f3]">
            {submitted ? (
              <div className="py-12 flex flex-col items-center text-center space-y-4 animate-fadeIn">
                <div className="w-16 h-16 bg-[#eedc82]/50 text-[#6b5e10] rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-[#1c1c18]">Message Dispatched</h3>
                <p className="text-sm text-[#4a4738] max-w-sm">
                  Thank you for reaching out to the NGDC-BNCC Platoon. Our Cadet Adjutant or PUO Office will review your message shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="japandi-btn-secondary text-xs mt-4"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                {formError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl text-xs font-medium">
                    {formError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1.5 pl-1">
                    Your Name *
                  </label>
                  <input
                    id="contact-name-input"
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Cadet Sgt. Tanvir Ahmed"
                    className="w-full bg-[#f6f3ed] dark:bg-[#191815] border border-[#cdc6b3] dark:border-[#464237] focus:border-[#1c1c18] dark:focus:border-[#eedc82] focus:bg-[#fcf9f3] dark:focus:bg-[#201e19] px-4 py-2.5 rounded-full outline-none transition-all text-xs sm:text-sm text-[#1c1c18] dark:text-[#fcfbf7]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1.5 pl-1">
                      Mobile Number *
                    </label>
                    <input
                      id="contact-phone-input"
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="017XX-XXXXXX"
                      className="w-full bg-[#f6f3ed] dark:bg-[#191815] border border-[#cdc6b3] dark:border-[#464237] focus:border-[#1c1c18] dark:focus:border-[#eedc82] focus:bg-[#fcf9f3] dark:focus:bg-[#201e19] px-4 py-2.5 rounded-full outline-none transition-all text-xs sm:text-sm text-[#1c1c18] dark:text-[#fcfbf7]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1.5 pl-1">
                      Email Address *
                    </label>
                    <input
                      id="contact-email-input"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-[#f6f3ed] dark:bg-[#191815] border border-[#cdc6b3] dark:border-[#464237] focus:border-[#1c1c18] dark:focus:border-[#eedc82] focus:bg-[#fcf9f3] dark:focus:bg-[#201e19] px-4 py-2.5 rounded-full outline-none transition-all text-xs sm:text-sm text-[#1c1c18] dark:text-[#fcfbf7]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1.5 pl-1">
                    Message Details *
                  </label>
                  <textarea
                    id="contact-message-input"
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="How can we help you regarding BNCC recruitment, cadet verification, or platoon events?"
                    className="w-full bg-[#f6f3ed] dark:bg-[#191815] border border-[#cdc6b3] dark:border-[#464237] focus:border-[#1c1c18] dark:focus:border-[#eedc82] focus:bg-[#fcf9f3] dark:focus:bg-[#201e19] px-4 py-3 rounded-2xl outline-none transition-all resize-none text-xs sm:text-sm text-[#1c1c18] dark:text-[#fcfbf7]"
                  ></textarea>
                </div>
                <button
                  id="btn-submit-contact"
                  type="submit"
                  className="japandi-btn-primary w-full mt-2 cursor-pointer shadow-xs hover:shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </motion.div>

          {/* Map Graphic with styled Overlay Badge */}
          <motion.div variants={framerPopItemVariants} className="h-full min-h-[360px] japandi-card overflow-hidden bg-[#f0eee8] dark:bg-[#191815] flex flex-col justify-end relative border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3634.36096081011!2d88.58057617448783!3d24.368743478253503!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fbef0014219587%3A0x81b451b81c24ba14!2sNew%20Govt.%20Degree%20College%2C%20Rajshahi%20BNCC%20Unit!5e0!3m2!1sen!2sbd!4v1788400874455!5m2!1sen!2sbd"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="New Govt. Degree College, Rajshahi BNCC Unit Location"
              className="absolute inset-0 w-full h-full"
            />
            
            <div className="relative z-10 m-3 sm:m-4 p-4 bg-[#fcf9f3]/95 dark:bg-[#1e1d19]/95 backdrop-blur-md border border-[#cdc6b3] dark:border-[#423e35] rounded-2xl shadow-md max-w-sm pointer-events-none">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#eedc82]/60 dark:bg-[#eedc82]/20 text-[#6b5e10] dark:text-[#eedc82] rounded-xl shrink-0 shadow-xs">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                    New Govt. Degree College
                  </h3>
                  <p className="text-xs text-[#7c7767] dark:text-[#aca596]">
                    N6, Rajshahi
                  </p>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-[#cdc6b3]/50 dark:border-[#423e35] text-xs text-[#6b5e10] dark:text-[#eedc82] font-semibold flex items-center gap-1.5">
                <span>Platoon Office: Room 123, Front building, New Govt. Degree College, N6, Rajshahi</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};
