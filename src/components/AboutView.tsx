import React from 'react';
import { motion } from 'motion/react';
import { useAdminData } from '../context/AdminDataContext';
import { CadetRankHierarchyTree } from './CadetRankHierarchyTree';
import { Shield, Target, Compass, Award, Users, BookOpen, Flag, Quote } from 'lucide-react';
import { framerSectionVariants, framerPopItemVariants, scrollViewportConfig } from '../utils/motionVariants';

interface AboutViewProps {
  onOpenJoinModal?: () => void;
}

const DEFAULT_PLATOON_TEXT = `BNCC activities began at this college in 1979, starting from the establishment of the No. 1 Mahasthan Battalion. Rooms 123 and 124, adjacent to the auditorium on the ground floor of the main building's south block, are allocated as the BNCC office and storehouse. BNCC works tirelessly with the noble objectives of developing the moral character of the country's youth, fostering leadership, building a spirit of national service and sympathy, and, above all, preparing second-line soldiers through military training for the defense of the motherland and creating volunteers to tackle internal disasters.

Among Bangladesh National Cadet Corps five regiments, the BNCC unit of New Govt. Degree College falls under the "Mahasthan Regiment." Established since the inception of the college, this organization comprises a 31-member male platoon, a 31-member female platoon, and a 15-member band platoon. A platoon commander is in charge of these platoons. Additionally, BNCC officers working at the college supervise the unit.`;

export const AboutView: React.FC<AboutViewProps> = () => {
  const {
    aboutOverview,
    bncco1Message,
    bncco2Message,
    platoonCommanderMessage,
    aboutSections,
  } = useAdminData();

  // Combine executive messages: BNCCO 1, BNCCO 2, and Platoon Commander
  const executiveMessages = [
    {
      id: 'bncco1',
      title: "Message from the BNCCO's",
      badge: bncco1Message?.badge || 'Mahasthan Regiment • BNCCO',
      data: bncco1Message,
    },
    {
      id: 'bncco2',
      title: "Message from the BNCCO's",
      badge: bncco2Message?.badge || 'Mahasthan Regiment • BNCCO',
      data: bncco2Message,
    },
    {
      id: 'commander',
      title: 'Message from the Platoon Commander',
      badge: platoonCommanderMessage?.badge || 'Platoon Commander',
      data: platoonCommanderMessage,
    },
  ];

  const platoonText = aboutOverview?.content || DEFAULT_PLATOON_TEXT;

  return (
    <div className="space-y-12 max-w-[1120px] mx-auto px-4 w-full">
      {/* About Our Platoon Section */}
      <motion.section
        variants={framerSectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewportConfig}
        className="bg-[#f6f3ed] dark:bg-[#1e1d19] p-6 sm:p-8 md:p-12 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs relative overflow-hidden"
      >
        <div className="max-w-4xl mx-auto space-y-5">
          <div className="text-center space-y-3">
            <motion.span
              variants={framerPopItemVariants}
              className="inline-block px-3.5 py-1 bg-[#eedc82] text-[#1c1c18] font-bold text-xs rounded-full uppercase tracking-wider shadow-2xs"
            >
              {aboutOverview?.badge || 'About Our Platoon'}
            </motion.span>
            <motion.h1
              variants={framerPopItemVariants}
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1c1c18] dark:text-[#fcfbf7] tracking-tight"
            >
              {aboutOverview?.title || 'About Our Platoon'}
            </motion.h1>
            {aboutOverview?.subtitle && (
              <motion.p
                variants={framerPopItemVariants}
                className="text-xs sm:text-sm font-semibold text-[#6b5e10] dark:text-[#eedc82] uppercase tracking-wider"
              >
                {aboutOverview.subtitle}
              </motion.p>
            )}
            {(aboutOverview?.established || aboutOverview?.motto) && (
              <motion.div variants={framerPopItemVariants} className="pt-1 flex justify-center gap-2.5">
                {aboutOverview?.established && (
                  <span className="bg-[#fcf9f3] dark:bg-[#26241f] border border-[#cdc6b3] dark:border-[#423e35] text-[#6b5e10] dark:text-[#eedc82] text-xs font-semibold px-3 py-1 rounded-full">
                    {aboutOverview.established}
                  </span>
                )}
                {aboutOverview?.motto && (
                  <span className="bg-[#fcf9f3] dark:bg-[#26241f] border border-[#cdc6b3] dark:border-[#423e35] text-[#6b5e10] dark:text-[#eedc82] text-xs font-semibold px-3 py-1 rounded-full">
                    {aboutOverview.motto}
                  </span>
                )}
              </motion.div>
            )}
          </div>

          <motion.div
            variants={framerPopItemVariants}
            className="pt-4 border-t border-[#cdc6b3]/40 dark:border-[#423e35]/60 space-y-4"
          >
            {platoonText
              .split('\n\n')
              .filter(Boolean)
              .map((paragraph, pIdx) => (
                <p
                  key={pIdx}
                  className="text-sm sm:text-base text-[#4a4738] dark:text-[#aca596] leading-relaxed font-normal text-justify sm:text-left"
                >
                  {paragraph.trim()}
                </p>
              ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Core Mission, Vision & Motto with Staggered Scroll Reveal */}
      <motion.section
        variants={framerSectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewportConfig}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          {
            icon: Compass,
            title: 'Our Mission',
            desc: 'To develop character, comradeship, ideals of service, and capacity for leadership in youth, fostering disciplined and patriotic citizens ready for national service.',
          },
          {
            icon: Target,
            title: 'Our Vision',
            desc: 'To be the premier youth organization instilling military grooming, moral integrity, physical endurance, and second-line defense preparedness across Bangladesh.',
          },
          {
            icon: Shield,
            title: 'Our Motto',
            desc: 'জ্ঞান ও শৃঙ্খলা (Knowledge & Discipline). Knowledge empowers the intellect, while unwavering discipline guides righteous collective action.',
          },
        ].map((item, index) => (
          <motion.div
            key={index}
            variants={framerPopItemVariants}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            className="japandi-card p-6 md:p-8 bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] space-y-3 shadow-xs hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82] flex items-center justify-center">
              <item.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">{item.title}</h3>
            <p className="text-sm text-[#4a4738] dark:text-[#aca596] leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* Executive Messages: 2 BNCCO Messages Above Platoon Commander Message (Alternating Zigzag Layout) */}
      <div className="space-y-8">
        {executiveMessages
          .filter((exec) => exec.data?.enabled !== false)
          .map((exec, idx) => {
            const isAvatarOnRight = idx % 2 === 1;
            return (
              <motion.section
                key={exec.id}
                variants={framerSectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={scrollViewportConfig}
                className="bg-[#f6f3ed] dark:bg-[#1e1d19] p-8 md:p-12 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  <motion.div
                    variants={framerPopItemVariants}
                    className={`lg:col-span-5 flex flex-col items-center text-center ${
                      isAvatarOnRight ? 'lg:order-2' : 'lg:order-1'
                    }`}
                  >
                    {/* Official Officer Photograph - Display only (No public upload) */}
                    <div className="w-44 h-44 rounded-full overflow-hidden border-2 border-[#cdc6b3] dark:border-[#464237] shadow-md bg-[#ded2be] dark:bg-[#1a1813] mb-4 shrink-0 relative group">
                      {exec.data?.photoUrl ? (
                        <img
                          src={exec.data.photoUrl}
                          alt={exec.data.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[#6b5e10] dark:text-[#eedc82] bg-[#eedc82]/30">
                          {exec.data?.name?.charAt(0) || 'O'}
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                      {exec.data?.name}
                    </h3>
                    <p className="text-sm font-semibold text-[#6b5e10] dark:text-[#eedc82] mt-0.5">
                      {exec.data?.designation}
                    </p>
                    {exec.data?.subDesignation && (
                      <p className="text-xs text-[#7c7767] dark:text-[#aca596] mt-1 max-w-xs">
                        {exec.data.subDesignation}
                      </p>
                    )}
                    {exec.data?.badge && (
                      <span className="mt-2.5 inline-block px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#eedc82]/30 text-[#6b5e10] dark:text-[#eedc82] border border-[#eedc82]/60">
                        {exec.data.badge}
                      </span>
                    )}
                  </motion.div>

                  <motion.div
                    variants={framerPopItemVariants}
                    className={`lg:col-span-7 space-y-4 ${
                      isAvatarOnRight ? 'lg:order-1' : 'lg:order-2'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-[#eedc82] text-[#1c1c18] font-bold text-xs rounded-full uppercase tracking-wider shadow-2xs">
                        {exec.title}
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                      {exec.title}
                    </h2>
                    {exec.data?.quote && (
                      <blockquote className="border-l-4 border-[#eedc82] pl-4 italic text-sm md:text-base text-[#4a4738] dark:text-[#aca596] leading-relaxed">
                        {exec.data.quote}
                      </blockquote>
                    )}
                    {exec.data?.message && (
                      <p className="text-sm text-[#4a4738] dark:text-[#aca596] leading-relaxed whitespace-pre-line">
                        {exec.data.message}
                      </p>
                    )}
                  </motion.div>
                </div>
              </motion.section>
            );
          })}
      </div>

      {/* 4 Pillars of BNCC Training */}
      <motion.section
        variants={framerSectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewportConfig}
        className="bg-[#fcf9f3] dark:bg-[#1e1d19] p-8 md:p-12 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs space-y-8"
      >
        <motion.div variants={framerPopItemVariants} className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
            Pillars of Cadet Training
          </h2>
          <p className="text-sm text-[#695c4e] dark:text-[#aca596] mt-1">
            Holistic grooming for academic, mental, and physical triumph
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={framerPopItemVariants} className="p-5 bg-[#f6f3ed] dark:bg-[#161512] rounded-2xl border border-[#cdc6b3]/40 dark:border-[#3a372e] space-y-2">
            <div className="p-2.5 w-fit rounded-xl bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
              <Flag className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-[#1c1c18] dark:text-[#fcfbf7]">Military Drill & Bearing</h4>
            <p className="text-xs text-[#4a4738] dark:text-[#aca596] leading-relaxed">
              Squad drill, rifle handling, guard of honor, slow and quick march, building posture and instinctive synchronization.
            </p>
          </motion.div>

          <motion.div variants={framerPopItemVariants} className="p-5 bg-[#f6f3ed] dark:bg-[#161512] rounded-2xl border border-[#cdc6b3]/40 dark:border-[#3a372e] space-y-2">
            <div className="p-2.5 w-fit rounded-xl bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-[#1c1c18] dark:text-[#fcfbf7]">Academic & Moral Growth</h4>
            <p className="text-xs text-[#4a4738] dark:text-[#aca596] leading-relaxed">
              Military history, leadership ethics, public speaking, decision-making under stress, and academic mentorship.
            </p>
          </motion.div>

          <motion.div variants={framerPopItemVariants} className="p-5 bg-[#f6f3ed] dark:bg-[#161512] rounded-2xl border border-[#cdc6b3]/40 dark:border-[#3a372e] space-y-2">
            <div className="p-2.5 w-fit rounded-xl bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-[#1c1c18] dark:text-[#fcfbf7]">Community & Disaster Relief</h4>
            <p className="text-xs text-[#4a4738] dark:text-[#aca596] leading-relaxed">
              First-responder medical training, flood relief, tree plantation drives, blood donation camps, and traffic control.
            </p>
          </motion.div>

          <motion.div variants={framerPopItemVariants} className="p-5 bg-[#f6f3ed] dark:bg-[#161512] rounded-2xl border border-[#cdc6b3]/40 dark:border-[#3a372e] space-y-2">
            <div className="p-2.5 w-fit rounded-xl bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-[#1c1c18] dark:text-[#fcfbf7]">Excellence & Defense Pathway</h4>
            <p className="text-xs text-[#4a4738] dark:text-[#aca596] leading-relaxed">
              Direct guidance for ISSB (Army, Navy, Air Force) and priority quota advantages for Certificate B & C holders.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Dynamic Serving Cadet Rank Hierarchy from Cadet Corner & Directory */}
      <motion.section
        variants={framerSectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewportConfig}
        className="bg-[#fcf9f3] dark:bg-[#1e1d19] p-5 sm:p-7 md:p-10 rounded-3xl border border-[#cdc6b3]/60 dark:border-[#423e35] shadow-xs space-y-6"
      >
        <motion.div variants={framerPopItemVariants} className="text-center max-w-2xl mx-auto space-y-2">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#6b5e10] dark:text-[#eedc82] bg-[#eedc82]/30 dark:bg-[#eedc82]/15 px-3.5 py-1 rounded-full border border-[#eedc82]/50">
            Platoon Command Structure
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1c1c18] dark:text-[#fcfbf7]">
            Cadet Rank Hierarchy (Serving Cadets)
          </h2>
          <p className="text-xs sm:text-sm text-[#695c4e] dark:text-[#aca596]">
            Official command structure and organizational hierarchy for Male Platoon, Female Platoon, and Band Platoon.
          </p>
        </motion.div>

        {/* Dynamic Tree Hierarchy Component */}
        <CadetRankHierarchyTree />
      </motion.section>

      {/* Legacy Custom Added Sections (if configured) */}
      {aboutSections && aboutSections.length > 0 && (
        <div className="space-y-8">
          {aboutSections.map((sec) => (
            <motion.section
              key={sec.id}
              variants={framerSectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={scrollViewportConfig}
              className="bg-[#fcf9f3] dark:bg-[#1e1d19] p-8 md:p-12 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs space-y-4"
            >
              <div className="max-w-3xl">
                {sec.badge && (
                  <span className="inline-block px-3 py-1 bg-[#eedc82] text-[#1c1c18] font-bold text-xs rounded-full uppercase tracking-wider mb-2">
                    {sec.badge}
                  </span>
                )}
                <h2 className="text-2xl md:text-3xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                  {sec.title}
                </h2>
                <div className="mt-4 text-sm md:text-base text-[#4a4738] dark:text-[#aca596] leading-relaxed whitespace-pre-line">
                  {sec.content}
                </div>
              </div>
            </motion.section>
          ))}
        </div>
      )}
    </div>
  );
};

