import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  HeroSlide,
  NoticeItem,
  BlogItem,
  MemoryItem,
  HonorEntryItem,
  HonorCategoryKey,
  TrainingAnnouncement,
  FormFieldConfig,
  CustomFormSubmission,
  CadetRankHierarchyItem,
  CustomAboutSection,
  CadetUserAccount,
  PlatoonCategory,
  PlatoonSection,
  ContactMessage,
  RecruitmentApplicant,
  RecruitmentAnnouncementConfig,
  RecruitmentSignatoriesConfig,
  ContactConfig,
  FooterConfig,
  ExecutiveMessageConfig,
  AboutOverviewConfig,
} from '../types';
import {
  HERO_SLIDES_DATA,
  NOTICES_DATA,
  BLOGS_DATA,
  MEMORIES_DATA,
  ASSETS,
} from '../data/bnccData';
import { INITIAL_CADET_USERS } from '../data/initialCadetUsers';
import {
  fetchCadetsFromSupabase,
  upsertCadetToSupabase,
  deleteCadetFromSupabase,
  isSupabaseConfigured,
  fetchSiteSettings,
  subscribeToSiteSettingsUpdates,
  upsertSiteSetting,
} from '../utils/supabaseClient';

// Initial default Honor Board entries in 3 categories
const DEFAULT_HONOR_ENTRIES: HonorEntryItem[] = [
  // a. List Of Platoon Commanders
  {
    id: 'cmd-1',
    category: 'commanders',
    sl: 1,
    name: 'Md. Abdul Matin',
    designation: 'Professor Under Officer (PUO) & Platoon Commander',
    tenure: '01/01/2018 to Present',
    remarks: 'Assistant Professor, Department of Management. Commanded to 4 Battalion Champion trophies.',
    badge: 'Current Commander',
  },
  {
    id: 'cmd-2',
    category: 'commanders',
    sl: 2,
    name: 'Dr. A. K. M. Shamsuddin',
    designation: 'Ex-PUO & Associate Professor',
    tenure: '15/03/2009 to 31/12/2017',
    remarks: 'Pioneered modernized parade ground facilities and battalion shooting squad.',
    badge: 'Veteran Commander',
  },
  {
    id: 'cmd-3',
    category: 'commanders',
    sl: 3,
    name: 'Prof. Md. Asaduzzaman',
    designation: 'Founder Platoon Commander & PUO',
    tenure: '01/07/1979 to 14/03/2009',
    remarks: 'Established the NGDC BNCC Platoon under Mahasthan Regiment in 1979.',
    badge: 'Founder Commander',
  },

  // b. List of BNCCO's
  {
    id: 'bnc-1',
    category: 'bnccos',
    sl: 1,
    name: 'Havildar Anisur Rahman',
    designation: 'Army Detachment BNCCO Instructor',
    tenure: '01/06/2022 to Present',
    remarks: 'In charge of squad drills, arms handling (.22 rifle), and battalion firing prep.',
    badge: 'Senior BNCCO',
  },
  {
    id: 'bnc-2',
    category: 'bnccos',
    sl: 2,
    name: 'Sergeant Belal Hossain',
    designation: 'Battalion Drill Instructor (BNCCO)',
    tenure: '15/01/2018 to 30/05/2022',
    remarks: 'Conducted rigorous annual winter camp drill preparation and field craft training.',
    badge: 'Ex-BNCCO',
  },
  {
    id: 'bnc-3',
    category: 'bnccos',
    sl: 3,
    name: 'Corporal Jahangir Alam',
    designation: 'Tactical & PT Instructor (BNCCO)',
    tenure: '10/02/2013 to 12/01/2018',
    remarks: 'Supervised physical endurance obstacle courses and national disaster drill maneuvers.',
    badge: 'Ex-BNCCO',
  },

  // c. List of Platoon Senior Cadets
  {
    id: 'snr-1',
    category: 'seniors',
    sl: 1,
    name: 'Mahmudul Hasan (Rahman)',
    designation: 'Cadet Under Officer (CUO)',
    tenure: '01/01/2023 to 31/12/2024',
    remarks: 'Platoon Senior. Youth Exchange Program (YEP) India Delegate. Best All-Round Cadet.',
    badge: 'CUO Senior',
  },
  {
    id: 'snr-2',
    category: 'seniors',
    sl: 2,
    name: 'Tania Sultana',
    designation: 'Cadet Sergeant Major (CSM)',
    tenure: '01/01/2022 to 31/12/2023',
    remarks: 'Platoon Senior NCO. Led National Victory Day Parade Contingent at National Parade Square.',
    badge: 'CSM Senior',
  },
  {
    id: 'snr-3',
    category: 'seniors',
    sl: 3,
    name: 'Zubair Al Mamun',
    designation: 'Cadet Sergeant (Senior Cadet)',
    tenure: '01/01/2021 to 31/12/2022',
    remarks: 'Commissioned into Bangladesh Army as Lieutenant via 84th BMA Long Course.',
    badge: 'Commissioned Officer',
  },
  {
    id: 'snr-4',
    category: 'seniors',
    sl: 4,
    name: 'Shakil Ahmed',
    designation: 'Cadet Under Officer (CUO)',
    tenure: '01/01/2020 to 31/12/2021',
    remarks: 'Commended for leading voluntary COVID-19 relief operations across Rajshahi city.',
    badge: 'Ex-CUO',
  },
];

// Default Cadet Rank Hierarchy for About Us
const DEFAULT_CADET_RANKS: CadetRankHierarchyItem[] = [
  {
    id: 'rank-1',
    rank: 'Cadet (Cdt)',
    holderName: 'Basic Trainee Cadets',
    description: 'Entry rank awarded upon physical assessment, enrolment clearance, and preliminary uniform issue.',
    order: 1,
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'rank-2',
    rank: 'Lance Corporal (LCpl)',
    holderName: 'Tanvir Hossain & 4 Others',
    description: 'Assistant Section 2IC. Earned through passing written theory, drill cadence, and first aid qualification.',
    order: 2,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'rank-3',
    rank: 'Corporal (Cpl)',
    holderName: 'Tariqul Karim & 3 Others',
    description: 'Section 2IC. Commands squad files on parade ground and assists in platoon armory logistics.',
    order: 3,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'rank-4',
    rank: 'Sergeant (Sgt)',
    holderName: 'Sumaiya Akter & Nahid Islam',
    description: 'Section Commander. Directs tactical field maneuvers, squad firing lines, and disaster relief.',
    order: 4,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'rank-5',
    rank: 'Cadet Sergeant Major (CSM)',
    holderName: 'Ariful Islam',
    description: 'Platoon Senior NCO. Enforces parade ground discipline, uniform standards, and daily roll calls.',
    order: 5,
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'rank-6',
    rank: 'Cadet Under Officer (CUO)',
    holderName: 'Hasan Mahmud',
    description: 'Highest Cadet Rank. Commands the entire New Govt. Degree College Platoon under the PUO.',
    order: 6,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
  },
];

// Default Custom About Section (empty by default)
const DEFAULT_ABOUT_SECTIONS: CustomAboutSection[] = [];

// Default Training & Event Announcements
const DEFAULT_TRAINING_ANNOUNCEMENTS: TrainingAnnouncement[] = [
  {
    id: 'tr-ann-1',
    title: 'Annual Battalion Winter Training Camp 2026',
    category: 'Camp',
    date: '15 Nov 2026 - 25 Nov 2026',
    time: '06:00 AM Daily',
    venue: 'Mahasthan Battalion Firing Range & Training Base, Bogura',
    instructor: 'Regiment Officers & Army Detachment BNCCOs',
    uniform: 'Camp Dungaree / Field Camouflage',
    status: 'Upcoming',
    description: '10-day central military grooming camp focusing on field craft, night tactical movement, live firing, and inter-college drill competitions.',
    hasRegistrationForm: true,
  },
  {
    id: 'tr-ann-2',
    title: 'Special Guard of Honor & Victory Day Rehearsal',
    category: 'Parade',
    date: '10 Dec 2026',
    time: '06:30 AM - 09:30 AM',
    venue: 'College Main Parade Ground, NGDC',
    instructor: 'PUO Md. Abdul Matin & CUO Hasan Mahmud',
    uniform: 'Service Dress (Khaki with Beret & Hackle)',
    status: 'Upcoming',
    description: 'Selection and precision drill practice for the college contingent representing Rajshahi district parade.',
    hasRegistrationForm: false,
  },
  {
    id: 'tr-ann-3',
    title: 'Disaster Management & Fire Rescue Workshop',
    category: 'Workshop',
    date: '05 Oct 2026',
    time: '10:00 AM - 01:30 PM',
    venue: 'Auditorium & Front Lawn, NGDC',
    instructor: 'Bangladesh Fire Service & Civil Defence Instructors',
    uniform: 'PT Kit / Working Dress',
    status: 'Upcoming',
    description: 'Hands-on training covering high-rise evacuation, chemical fire extinguishers, stretcher bearer protocols, and flood triage.',
    hasRegistrationForm: true,
  },
];

// Default Training Form Fields
const DEFAULT_TRAINING_FORM_FIELDS: FormFieldConfig[] = [
  { id: 'f-1', label: 'Cadet Number', type: 'text', placeholder: 'e.g. NGDC-2024-042', required: true },
  { id: 'f-2', label: 'Cadet Full Name', type: 'text', placeholder: 'Full Name as per College ID', required: true },
  { id: 'f-3', label: 'Cadet Rank', type: 'select', required: true, options: ['Cadet', 'Lance Corporal', 'Corporal', 'Sergeant', 'CSM', 'CUO'] },
  { id: 'f-4', label: 'Emergency Contact Mobile', type: 'tel', placeholder: '017XXXXXXXX', required: true },
  { id: 'f-5', label: 'Previous Camp Attended', type: 'text', placeholder: 'e.g. Winter Camp 2023', required: false },
  { id: 'f-6', label: 'Medical Fitness Confirmation', type: 'select', required: true, options: ['Fully Fit & Ready for Field Obstacles', 'Conditional / Minor Allergies'] },
];

// Default Cadet Registration Form Fields for Cadet Corner
const DEFAULT_CADET_REG_FIELDS: FormFieldConfig[] = [
  { id: 'cr-1', label: 'Cadet Full Name', type: 'text', placeholder: 'Enter cadet full name', required: true },
  { id: 'cr-2', label: 'Platoon Category', type: 'select', required: true, options: ['Male Platoon', 'Female Platoon', 'Band Platoon', 'Ex-cadets'] },
  { id: 'cr-3', label: 'Gender', type: 'select', required: true, options: ['Male', 'Female'] },
  { id: 'cr-4', label: 'Cadet Rank / Desired Rank', type: 'select', required: true, options: ['Cadet Under Officer/CUO', 'Cadet Seargent', 'Cadet Corporal', 'Cadet Lance Corporal', 'Cadet'] },
  { id: 'cr-5', label: 'College Roll / Student ID', type: 'text', placeholder: 'e.g. NGDC-110492 or Roll 204', required: true },
  { id: 'cr-6', label: 'Department / Group', type: 'text', placeholder: 'e.g. Dept. of Physics', required: true },
  { id: 'cr-7', label: 'Batch / Enrolment Session', type: 'text', placeholder: 'e.g. Batch 24 (2024-2025)', required: true },
  { id: 'cr-8', label: 'Blood Group', type: 'select', required: true, options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] },
  { id: 'cr-9', label: 'Contact Mobile Number', type: 'tel', placeholder: '01XXXXXXXXX', required: true },
  { id: 'cr-10', label: 'Email Address', type: 'email', placeholder: 'cadet@example.com', required: false },
  { id: 'cr-11', label: 'Section Preference / Designation', type: 'select', required: false, options: ['Section 01', 'Section 02', 'Section 03', 'Band Section', 'Platoon HQ', 'Ex-Cadet Alumni'] },
];

// Initial Cadet Database & Directory (Empty by default: admin will input cadets)
const DEFAULT_CADET_USERS: CadetUserAccount[] = [];

// Default Recruitment Form Fields
const DEFAULT_RECRUITMENT_FORM_FIELDS: FormFieldConfig[] = [
  { id: 'rec-1', label: 'Full Name in English', type: 'text', placeholder: 'As registered in SSC/HSC Certificate', required: true },
  { id: 'rec-2', label: 'Active Email Address', type: 'email', placeholder: 'student@example.com', required: true },
  { id: 'rec-3', label: 'Applicant Mobile Number', type: 'tel', placeholder: '01XXXXXXXXX', required: true },
  { id: 'rec-4', label: 'College Roll / Admission ID', type: 'text', placeholder: 'e.g. 24-SCI-0142', required: true },
  { id: 'rec-5', label: 'Class / Department', type: 'select', required: true, options: ['HSC 1st Year (Science)', 'HSC 1st Year (Humanities)', 'HSC 1st Year (Business Studies)', 'Degree / Honours 1st Year (Science)', 'Degree / Honours 1st Year (Arts)', 'Degree / Honours 1st Year (Commerce)'] },
  { id: 'rec-6', label: 'Academic Session', type: 'text', placeholder: 'e.g. 2024 - 2025', required: true },
  { id: 'rec-7', label: 'Height (Feet & Inches)', type: 'text', placeholder: 'e.g. 5 Feet 8 Inches (Min: 5\'6" for Male, 5\'2" for Female)', required: true },
  { id: 'rec-8', label: 'Weight (kg)', type: 'number', placeholder: 'e.g. 62', required: true },
  { id: 'rec-9', label: 'Blood Group', type: 'select', required: true, options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] },
  { id: 'rec-10', label: 'Motivation to Join BNCC', type: 'textarea', placeholder: 'Why do you wish to earn the BNCC uniform and serve Bangladesh?', required: true },
];

export const DEFAULT_RECRUITMENT_ANNOUNCEMENT: RecruitmentAnnouncementConfig = {
  isActive: true,
  title: 'Cadet Recruitment Batch 2024-2025 Enrolment Circular',
  batch: 'Batch 24',
  deadline: '2026-10-15',
  startDate: '2026-09-01T08:00',
  endDate: '2026-10-15T23:59',
  venue: 'College Gymnasium & Main Parade Ground, NGDC',
  description: 'Join the Bangladesh National Cadet Corps (Army Wing) at New Government Degree College, Rajshahi. Experience military drill discipline, adventure camps, firing, leadership training, and national service.',
  eligibilityCriteria: [
    'Regular student of New Govt. Degree College (HSC 1st/2nd Year or Degree/Honours)',
    'Minimum height: Male 5\'4", Female 5\'0"',
    'Good physical fitness, mental resilience, and medically sound',
    'High standard of discipline, moral character, and dedication to national defense',
  ],
  headerImageUrl: '',
  footerImageUrl: '',
  footerText: 'For recruitment inquiries, visit Platoon HQ Room 123 or call +880 1712-345678. Official Army Wing Circular.',
};

// Default Official Printable Form Signatories (Controlled and editable every year from Admin Recruitment)
export const DEFAULT_RECRUITMENT_SIGNATORIES: RecruitmentSignatoriesConfig = {
  countersignedName: 'PUO Md. Abdul Matin',
  countersignedPNo: 'P-8193',
  countersignedBattalion: '31 BNCC Battalion',
  countersignedRegiment: 'Mahasthan Regiment',
  countersignedTitle: 'Platoon Commander',
  countersignedInstitution: 'New Govt. Degree College, Rajshahi',
  countersignedSignatureUrl: '',

  seniorCadetRankAndName: 'Cadet Sergeant Touhid',
  seniorCadetNo: '',
  seniorCadetBattalion: '31 BNCC Battalion',
  seniorCadetRegiment: 'Mahasthan Regiment',
  seniorCadetInstitution: 'New Govt. Degree College, Rajshahi',
  seniorCadetSignatureUrl: '',

  formProviderTitle: 'Signature of Form Provider:',
  attachments: [
    'Photocopy of College ID Card / Admission Receipt',
    'Photocopy of SSC / HSC Marksheet',
    'Blood Group Certificate (if available)',
  ],
};

const DEFAULT_CADET_CORNER_MODULES = [
  {
    id: 'mod-1',
    title: 'Platoon Roll Call & Attendance',
    description: 'Daily morning parade attendance registers and physical fitness scoring.',
    icon: 'ClipboardCheck',
    status: 'Active',
  },
  {
    id: 'mod-2',
    title: 'Camp Preparation & Kit List',
    description: 'Standard kit checklist, webbing, bayonet scabbard, and uniform alignment guide.',
    icon: 'Shield',
    status: 'Active',
  },
  {
    id: 'mod-3',
    title: 'Cadet Knowledge Vault',
    description: 'Military abbreviations, BNCC Act regulations, drill commands, and firing fundamentals.',
    icon: 'BookOpen',
    status: 'Active',
  },
];

// Default Recruitment Applicants
const DEFAULT_RECRUITMENT_APPLICANTS: RecruitmentApplicant[] = [
  {
    id: 'app-1',
    token: 'NGDC-REC-8192',
    fullName: 'Tanvir Hossain Munna',
    email: 'munna.hsc@gmail.com',
    phone: '+880 1715-998811',
    collegeRoll: '24-SCI-0082',
    department: 'HSC 1st Year (Science)',
    session: '2024-2025',
    heightFeet: '5',
    heightInches: '9',
    weightKg: '66',
    bloodGroup: 'B+',
    reason: 'Passionate about military discipline, armed forces ISSB entry, and serving national emergency relief.',
    status: 'Shortlisted',
    appliedAt: '2026-08-20 10:45 AM',
  },
  {
    id: 'app-2',
    token: 'NGDC-REC-3741',
    fullName: 'Nusrat Jahan Bristy',
    email: 'bristy.arts@gmail.com',
    phone: '+880 1729-112233',
    collegeRoll: '24-HUM-0114',
    department: 'HSC 1st Year (Humanities)',
    session: '2024-2025',
    heightFeet: '5',
    heightInches: '4',
    weightKg: '52',
    bloodGroup: 'O+',
    reason: 'Dream of joining Army medical corps and representing Bangladesh in international Youth Exchange programs.',
    status: 'Pending',
    appliedAt: '2026-08-22 03:15 PM',
  },
  {
    id: 'app-3',
    token: 'NGDC-REC-5519',
    fullName: 'Al-Amin Sarkar',
    email: 'alamin.business@gmail.com',
    phone: '+880 1845-667788',
    collegeRoll: '24-BUS-0045',
    department: 'HSC 1st Year (Business Studies)',
    session: '2024-2025',
    heightFeet: '5',
    heightInches: '8',
    weightKg: '63',
    bloodGroup: 'A+',
    reason: 'Desire to build endurance, leadership character, and march in the national Victory Day parade contingent.',
    status: 'Selected',
    appliedAt: '2026-08-25 11:20 AM',
  },
];

// Default Contact Config
const DEFAULT_CONTACT_CONFIG: ContactConfig = {
  addressTitle: 'NGDC BNCC Platoon HQ',
  roomAndBuilding: 'Room 123, Front Building',
  fullAddress: 'New Govt. Degree College, N6 Highway, Rajshahi - 6000, Bangladesh',
  phonePrimary: '+880 1712-345678',
  phoneSecondary: '+880 2588-861234',
  emailPrimary: 'bncc.ngdc@gmail.com',
  emailSecondary: 'puo.matin@ngdc.ac.bd',
  officeHours: 'Sunday to Thursday: 09:00 AM - 04:00 PM | Friday/Saturday: Parade Hours 06:30 AM - 11:00 AM',
  mapEmbedUrl: 'https://maps.google.com/maps?q=New%20Govt.%20Degree%20College%20Rajshahi&t=&z=16&ie=UTF8&iwloc=&output=embed',
};

// Default Contact Messages Inbox
const DEFAULT_CONTACT_MESSAGES: ContactMessage[] = [
  {
    id: 'msg-1',
    name: 'Major K. Hossain (Retd.)',
    email: 'khossain@gmail.com',
    phone: '+880 1711-001122',
    subject: 'Donation of Training Equipment & Library Books',
    message: 'I would like to present 5 sets of prismatic compasses and military tactics manuals to the NGDC Platoon briefing room.',
    timestamp: '2026-08-28 02:30 PM',
    isRead: false,
  },
  {
    id: 'msg-2',
    name: 'Farhana Yeasmin (Guardian)',
    email: 'farhana.y@yahoo.com',
    phone: '+880 1823-445566',
    subject: 'Inquiry regarding Female Cadet Security at Winter Camp',
    message: 'My daughter is selected for Batch 24. Could you kindly clarify the lady officer supervision and camp living arrangements?',
    timestamp: '2026-08-25 10:15 AM',
    isRead: true,
  },
];

// Default Footer Config
const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  hqTitle: 'NGDC BNCC Platoon HQ',
  roomDetails: 'Room 123, Front Building,',
  locationDetails: 'New Govt. Degree College, N6, Rajshahi',
  phone: '+880 1712-345678 / +880 2588-861234',
  email: 'bncc.ngdc@gmail.com',
  facebookUrl: 'https://www.facebook.com/ngdcbncc',
  twitterUrl: 'https://x.com',
  youtubeUrl: 'https://youtube.com',
  instagramUrl: 'https://instagram.com',
  linkedinUrl: 'https://linkedin.com',
  collegeOfficialUrl: 'https://ngdc.ac.bd',
  bnccGovUrl: 'https://bncc.info/',
  copyrightText: 'NGDC-BNCC Platoon, New Govt. Degree College, Rajshahi. All rights reserved.',
  mottoText: 'Knowledge & Discipline • জ্ঞান ও শৃঙ্খলা',
};

// Default Leadership Messages for Home Page (Editable via Admin Home controls)
export const DEFAULT_PRINCIPAL_MESSAGE: ExecutiveMessageConfig = {
  name: 'Professor Dr. Shikha Sarkar',
  designation: 'Principal',
  subDesignation: 'New Govt. Degree College, Rajshahi',
  badge: 'Patron & Leadership',
  quote: '"The Bangladesh National Cadet Corps (BNCC) instills an unshakeable sense of patriotism, moral integrity, and discipline among our students. We take immense pride in our cadets who represent the highest ideals of courage and selflessness."',
  message: 'At New Govt. Degree College, Rajshahi, the BNCC platoon serves as a prestigious crucible of character building and leadership development. Beyond academic excellence, our cadets embody civic responsibility and stand ever-prepared to serve our nation during emergencies, floods, and humanitarian missions. I extend my heartiest congratulations and deepest blessings to all our cadets and officers.',
  photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
  enabled: true,
};

export const DEFAULT_VICE_PRINCIPAL_MESSAGE: ExecutiveMessageConfig = {
  name: 'Professor Md. Motiur Rahman',
  designation: 'Vice-Principal',
  subDesignation: 'New Govt. Degree College, Rajshahi',
  badge: 'Vice-Patron & Leadership',
  quote: '"Cadet training at NGDC tempers youth with fortitude, resilience, and brotherhood. The endurance learned on the parade ground shapes leaders for life."',
  message: 'The BNCC platoon of New Govt. Degree College continues to be an inspiring emblem of dedication within our campus. Through exemplary squad drills, national day parades, voluntary blood donation drives, and disaster relief campaigns, our cadets showcase unwavering civic commitment. May the torch of knowledge, discipline, and unity shine ever brighter in our platoon.',
  photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80',
  enabled: true,
};

// Default About Overview & History Content (Editable via Admin About Us)
export const DEFAULT_ABOUT_OVERVIEW: AboutOverviewConfig = {
  badge: 'About Our Platoon',
  title: 'Bangladesh National Cadet Corps',
  subtitle: 'New Govt. Degree College, Rajshahi BNCC Platoon, 31 BNCC Battalion, Mahasthan Regiment',
  established: 'Established 1979',
  motto: 'Knowledge & Discipline',
  content: `BNCC activities began at this college in 1979, starting from the establishment of the No. 1 Mahasthan Battalion. Rooms 123 and 124, adjacent to the auditorium on the ground floor of the main building's south block, are allocated as the BNCC office and storehouse. BNCC works tirelessly with the noble objectives of developing the moral character of the country's youth, fostering leadership, building a spirit of national service and sympathy, and, above all, preparing second-line soldiers through military training for the defense of the motherland and creating volunteers to tackle internal disasters.

Among Bangladesh National Cadet Corps five regiments, the BNCC unit of New Govt. Degree College falls under the "Mahasthan Regiment." Established since the inception of the college, this organization comprises a 31-member male platoon, a 31-member female platoon, and a 15-member band platoon. A platoon commander is in charge of these platoons. Additionally, BNCC officers working at the college supervise the unit.`,
};

// Default BNCCO 1 Message (Editable via Admin About Us)
export const DEFAULT_BNCCO1_MESSAGE: ExecutiveMessageConfig = {
  name: 'Lieutenant Md. Rafiqul Islam, BNCCO',
  designation: 'BNCC Officer (BNCCO)',
  subDesignation: 'Associate Professor, Department of Physics, New Govt. Degree College',
  badge: 'Mahasthan Regiment • BNCCO',
  quote: '"The discipline and leadership inculcated through BNCC training prepare our cadets to stand as pillars of integrity and fortitude for the nation."',
  message: 'As a BNCC Officer at New Govt. Degree College, I witness firsthand the transformative power of military training combined with academic excellence. Our cadets learn resilience, unyielding loyalty to the nation, and selfless service. Whether executing flawless parade drills or stepping up during national disasters, our cadets demonstrate the true spirit of patriotism. I urge all cadets to hold high the torch of knowledge and discipline.',
  photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  enabled: true,
};

// Default BNCCO 2 Message (Editable via Admin About Us)
export const DEFAULT_BNCCO2_MESSAGE: ExecutiveMessageConfig = {
  name: 'Captain Dr. Naznin Sultana, BNCCO',
  designation: 'BNCC Officer (BNCCO)',
  subDesignation: 'Assistant Professor, Department of Botany, New Govt. Degree College',
  badge: 'Mahasthan Regiment • BNCCO',
  quote: '"Empowering female and male cadets alike with leadership, tactical preparedness, and moral conviction is our highest calling in BNCC."',
  message: 'The BNCC unit at New Govt. Degree College stands out for its inclusive and rigorous grooming. With thriving male, female, and band platoons, our young cadets develop camaraderie, ethical steadfastness, and practical defense capabilities. We take immense pride in supervising these vibrant platoons as they grow into responsible citizens and future guardians of Bangladesh.',
  photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&auto=format&fit=crop&q=80',
  enabled: true,
};

// Default Platoon Commander Message (Editable via Admin About Us)
export const DEFAULT_PLATOON_COMMANDER_MESSAGE: ExecutiveMessageConfig = {
  name: 'Md. Abdul Matin',
  designation: 'Professor Under Officer (PUO) & Platoon Commander',
  subDesignation: 'Assistant Professor, Department of Management, New Govt. Degree College',
  badge: 'Platoon Commander',
  quote: '"The training ground at New Govt. Degree College is not merely a place for marching; it is a foundry where young minds are tempered with selflessness, fortitude, and civic responsibility. Every cadet who puts on this khaki uniform learns to put the platoon before self, and the nation above all."',
  message: 'Over the decades, NGDC BNCC Platoon has produced countless commissioned military officers, BCS cadres, doctors, engineers, and upright leaders. Our cadets actively respond during national emergencies, floods, winter cold waves, and public health crises with exemplary bravery.',
  photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
  enabled: true,
};

interface AdminDataContextType {
  // Admin Authentication & Service PIN
  servicePin: string;
  changeServicePin: (oldPin: string, newPin: string) => { success: boolean; message: string };
  isAdminLoggedIn: boolean;
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;

  // 1. Home - Slider Content & Leadership Messages
  heroSlides: HeroSlide[];
  addHeroSlide: (slide: Omit<HeroSlide, 'id'>) => void;
  updateHeroSlide: (id: string, slide: Partial<HeroSlide>) => void;
  deleteHeroSlide: (id: string) => void;
  principalMessage: ExecutiveMessageConfig;
  updatePrincipalMessage: (config: Partial<ExecutiveMessageConfig>) => Promise<boolean> | void;
  resetPrincipalMessage: () => Promise<boolean> | void;
  vicePrincipalMessage: ExecutiveMessageConfig;
  updateVicePrincipalMessage: (config: Partial<ExecutiveMessageConfig>) => Promise<boolean> | void;
  resetVicePrincipalMessage: () => Promise<boolean> | void;

  // 2. About Us - Overview, Messages & Rank Hierarchy
  aboutOverview: AboutOverviewConfig;
  updateAboutOverview: (config: Partial<AboutOverviewConfig>) => void;
  resetAboutOverview: () => void;
  bncco1Message: ExecutiveMessageConfig;
  updateBncco1Message: (config: Partial<ExecutiveMessageConfig>) => void;
  resetBncco1Message: () => void;
  bncco2Message: ExecutiveMessageConfig;
  updateBncco2Message: (config: Partial<ExecutiveMessageConfig>) => void;
  resetBncco2Message: () => void;
  platoonCommanderMessage: ExecutiveMessageConfig;
  updatePlatoonCommanderMessage: (config: Partial<ExecutiveMessageConfig>) => void;
  resetPlatoonCommanderMessage: () => void;
  aboutSections: CustomAboutSection[];
  addAboutSection: (sec: Omit<CustomAboutSection, 'id'>) => void;
  updateAboutSection: (id: string, sec: Partial<CustomAboutSection>) => void;
  deleteAboutSection: (id: string) => void;
  cadetRanks: CadetRankHierarchyItem[];
  addCadetRank: (rank: Omit<CadetRankHierarchyItem, 'id'>) => void;
  updateCadetRank: (id: string, rank: Partial<CadetRankHierarchyItem>) => void;
  deleteCadetRank: (id: string) => void;

  // 3. Trainings & Events - Announcements & Form Builder
  trainingAnnouncements: TrainingAnnouncement[];
  addTrainingAnnouncement: (ann: Omit<TrainingAnnouncement, 'id'>) => void;
  updateTrainingAnnouncement: (id: string, ann: Partial<TrainingAnnouncement>) => void;
  deleteTrainingAnnouncement: (id: string) => void;
  trainingFormFields: FormFieldConfig[];
  setTrainingFormFields: React.Dispatch<React.SetStateAction<FormFieldConfig[]>>;
  trainingSubmissions: CustomFormSubmission[];
  addTrainingSubmission: (submission: Omit<CustomFormSubmission, 'id' | 'submittedAt'>) => void;

  // 4. Notice & Blogs - PDF Notices & Blogs
  notices: NoticeItem[];
  addNotice: (notice: Omit<NoticeItem, 'id'>) => void;
  updateNotice: (id: string, notice: Partial<NoticeItem>) => void;
  deleteNotice: (id: string) => void;
  blogs: BlogItem[];
  addBlog: (blog: Omit<BlogItem, 'id'>) => void;
  updateBlog: (id: string, blog: Partial<BlogItem>) => void;
  deleteBlog: (id: string) => void;

  // 5. Memories - Pictures & Videos Gallery
  memories: MemoryItem[];
  addMemory: (mem: Omit<MemoryItem, 'id'>) => void;
  updateMemory: (id: string, mem: Partial<MemoryItem>) => void;
  deleteMemory: (id: string) => void;

  // 6. Cadet Corner - Registration Form Builder & Directory
  cadetRegFields: FormFieldConfig[];
  setCadetRegFields: React.Dispatch<React.SetStateAction<FormFieldConfig[]>>;
  cadetUsers: CadetUserAccount[];
  addCadetUser: (user: Omit<CadetUserAccount, 'id'>) => void;
  updateCadetUser: (id: string, user: Partial<CadetUserAccount>) => void;
  deleteCadetUser: (id: string) => void;
  approveCadetApplicant: (
    id: string,
    options: {
      password: string;
      category?: PlatoonCategory;
      section?: string;
      rank?: string;
      cadetNo?: string;
    }
  ) => void;
  clearAllCadetUsers: () => void;
  activeCadetAuth: CadetUserAccount | null;
  cadetLogin: (cadetNo: string, password: string) => { success: boolean; message: string; cadet?: CadetUserAccount };
  cadetRegister: (cadetData: Partial<CadetUserAccount>) => { success: boolean; message: string; cadet?: CadetUserAccount };
  cadetLogout: () => void;

  // 7. Honor Board - 3 Tabbed Categories (Commanders, BNCCOs, Seniors)
  honorEntries: HonorEntryItem[];
  addHonorEntry: (entry: Omit<HonorEntryItem, 'id'>) => void;
  updateHonorEntry: (id: string, entry: Partial<HonorEntryItem>) => void;
  deleteHonorEntry: (id: string) => void;

  // 8. Contact - Config & Inbox
  contactConfig: ContactConfig;
  updateContactConfig: (config: Partial<ContactConfig>) => void;
  contactMessages: ContactMessage[];
  addContactMessage: (msg: Omit<ContactMessage, 'id' | 'timestamp'>) => void;
  markContactMessageRead: (id: string) => void;
  deleteContactMessage: (id: string) => void;

  // 9. Cadet Recruitment - Open/Close toggle, Form Builder, Applicants & Excel Export
  isRecruitmentOpen: boolean;
  setIsRecruitmentOpen: (open: boolean) => void;
  recruitmentNoticeTitle: string;
  setRecruitmentNoticeTitle: (title: string) => void;
  recruitmentAnnouncement: RecruitmentAnnouncementConfig;
  updateRecruitmentAnnouncement: (ann: Partial<RecruitmentAnnouncementConfig>) => void;
  recruitmentConfig: {
    noticeTitle: string;
    batchName: string;
    isOpen: boolean;
  };
  recruitmentFormFields: FormFieldConfig[];
  setRecruitmentFormFields: React.Dispatch<React.SetStateAction<FormFieldConfig[]>>;
  recruitmentFields: FormFieldConfig[];
  setRecruitmentFields: React.Dispatch<React.SetStateAction<FormFieldConfig[]>>;
  recruitmentApplicants: RecruitmentApplicant[];
  applicants: RecruitmentApplicant[];
  addRecruitmentApplicant: (applicant: Omit<RecruitmentApplicant, 'id' | 'token' | 'appliedAt' | 'status'>) => string;
  addApplicant: (applicant: any) => string;
  updateApplicantStatus: (id: string, status: RecruitmentApplicant['status']) => void;
  updateRecruitmentApplicant: (id: string, applicant: Partial<RecruitmentApplicant>) => void;
  deleteRecruitmentApplicant: (id: string) => void;
  deleteApplicant: (id: string) => void;
  exportApplicantsToExcel: () => void;
  recruitmentSignatories: RecruitmentSignatoriesConfig;
  updateRecruitmentSignatories: (config: Partial<RecruitmentSignatoriesConfig>) => void;
  resetRecruitmentSignatories: () => void;

  // Supabase Postgres DB Sync
  syncCadetsWithSupabase: () => Promise<void>;
  isSupabaseActive: boolean;

  // Cadet accounts alias & modules
  cadetAccounts: CadetUserAccount[];
  addCadetAccount: (account: any) => void;
  cadetCornerModules: any[];

  // About rank hierarchy alias
  rankHierarchy: CadetRankHierarchyItem[];

  // Training & Events custom form aliases
  customFormTitle: string;
  customFormDescription: string;
  customFormFields: FormFieldConfig[];
  addCustomSubmission: (submission: any) => void;

  // 10. Footer Config
  footerConfig: FooterConfig;
  updateFooterConfig: (config: Partial<FooterConfig>) => void;

  // Reset to Defaults
  resetAllToDefault: () => void;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export const AdminDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Safe array parser - handles JSON strings, double-stringified JSON, arrays, and null values
  const parseArray = (val: any): any[] => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try {
        let parsed = JSON.parse(val);
        if (typeof parsed === 'string') {
          try { parsed = JSON.parse(parsed); } catch {}
        }
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  // Safe generic object parser - handles objects, strings, and fallback defaults
  const parseObject = <T,>(val: any, defaultVal: T): T => {
    if (!val) return defaultVal;
    let parsed = val;
    if (typeof val === 'string') {
      try {
        parsed = JSON.parse(val);
        if (typeof parsed === 'string') {
          try { parsed = JSON.parse(parsed); } catch {}
        }
      } catch {
        return defaultVal;
      }
    }
    if (!parsed || typeof parsed !== 'object') return defaultVal;
    return { ...defaultVal, ...parsed };
  };

  // Safe AboutOverview parser - guarantees all required fields and string content exist
  const parseAboutOverview = (val: any): AboutOverviewConfig => {
    if (!val) return DEFAULT_ABOUT_OVERVIEW;
    let parsed = val;
    if (typeof val === 'string') {
      try {
        parsed = JSON.parse(val);
        if (typeof parsed === 'string') {
          try { parsed = JSON.parse(parsed); } catch {}
        }
      } catch {
        return DEFAULT_ABOUT_OVERVIEW;
      }
    }
    if (!parsed || typeof parsed !== 'object') return DEFAULT_ABOUT_OVERVIEW;
    return {
      ...DEFAULT_ABOUT_OVERVIEW,
      ...parsed,
      content: typeof parsed.content === 'string' && parsed.content ? parsed.content : DEFAULT_ABOUT_OVERVIEW.content,
    };
  };

  // Safe ExecutiveMessage parser - guarantees all required fields and fallback values exist
  const parseExecutiveMessage = (val: any, defaultVal: ExecutiveMessageConfig): ExecutiveMessageConfig => {
    if (!val) return { ...defaultVal };
    let parsed = val;
    if (typeof val === 'string') {
      try {
        parsed = JSON.parse(val);
        if (typeof parsed === 'string') {
          try { parsed = JSON.parse(parsed); } catch {}
        }
      } catch {
        return { ...defaultVal };
      }
    }
    if (!parsed || typeof parsed !== 'object') return { ...defaultVal };
    return {
      name: typeof parsed.name === 'string' && parsed.name ? parsed.name : defaultVal.name,
      designation: typeof parsed.designation === 'string' && parsed.designation ? parsed.designation : defaultVal.designation,
      subDesignation: typeof parsed.subDesignation === 'string' ? parsed.subDesignation : defaultVal.subDesignation,
      badge: typeof parsed.badge === 'string' ? parsed.badge : (defaultVal.badge || ''),
      quote: typeof parsed.quote === 'string' ? parsed.quote : defaultVal.quote,
      message: typeof parsed.message === 'string' ? parsed.message : defaultVal.message,
      photoUrl: typeof parsed.photoUrl === 'string' && parsed.photoUrl ? parsed.photoUrl : defaultVal.photoUrl,
      enabled: parsed.enabled !== undefined ? Boolean(parsed.enabled) : (defaultVal.enabled !== false),
    };
  };

  // Timestamp tracker for local writes to prevent broadcast echo loops from overwriting active admin edits
  const lastLocalWriteTimestamps = useRef<Record<string, number>>({});

  const mergeCadetLists = (local: CadetUserAccount[], remote: CadetUserAccount[]): CadetUserAccount[] => {
    if (!Array.isArray(remote) || remote.length === 0) return local || [];
    if (!Array.isArray(local) || local.length === 0) return remote || [];
    const map = new Map<string, CadetUserAccount>();
    for (const c of local) {
      if (c && c.id) map.set(c.id, c);
      else if (c && c.cadetNo) map.set(`cadetno-${c.cadetNo.toUpperCase()}`, c);
    }
    for (const r of remote) {
      if (!r) continue;
      const key =
        (r.id && map.has(r.id) && r.id) ||
        (r.cadetNo && map.has(`cadetno-${r.cadetNo.toUpperCase()}`) && `cadetno-${r.cadetNo.toUpperCase()}`);
      if (key) {
        const existing = map.get(key)!;
        const merged: any = { ...existing };
        for (const [k, v] of Object.entries(r)) {
          if (v !== undefined && v !== null && v !== '') {
            merged[k] = v;
          }
        }
        map.set(existing.id || key, merged);
      } else if (r.id) {
        map.set(r.id, r);
      }
    }
    return Array.from(map.values());
  };

  const saveSettingWithTimestamp = (key: string, value: any) => {
    lastLocalWriteTimestamps.current[key] = Date.now();
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      } catch (e) {
        console.warn('localStorage save failed:', e);
      }
    }
    return upsertSiteSetting(key, value);
  };

  // --- Admin PIN (Default: 1721) ---
  
  // --- Supabase Site Settings Initialization ---
  useEffect(() => {
    async function loadSettings() {
      const settings = await fetchSiteSettings();
      if (settings) {
        // Use plain setters here (NOT ...AndSave) so we do NOT write back to Supabase on load
        if (settings['ngdc_admin_service_pin']) setServicePin(settings['ngdc_admin_service_pin']);
        if (settings['ngdc_hero_slides']) setHeroSlides(parseArray(settings['ngdc_hero_slides']));
        if (settings['ngdc_principal_message']) setPrincipalMessage(parseExecutiveMessage(settings['ngdc_principal_message'], DEFAULT_PRINCIPAL_MESSAGE));
        if (settings['ngdc_vice_principal_message']) setVicePrincipalMessage(parseExecutiveMessage(settings['ngdc_vice_principal_message'], DEFAULT_VICE_PRINCIPAL_MESSAGE));
        if (settings['ngdc_about_overview']) setAboutOverview(parseAboutOverview(settings['ngdc_about_overview']));
        if (settings['ngdc_bncco1_message']) setBncco1Message(parseExecutiveMessage(settings['ngdc_bncco1_message'], DEFAULT_BNCCO1_MESSAGE));
        if (settings['ngdc_bncco2_message']) setBncco2Message(parseExecutiveMessage(settings['ngdc_bncco2_message'], DEFAULT_BNCCO2_MESSAGE));
        if (settings['ngdc_platoon_commander_message']) setPlatoonCommanderMessage(parseExecutiveMessage(settings['ngdc_platoon_commander_message'], DEFAULT_PLATOON_COMMANDER_MESSAGE));
        if (settings['ngdc_about_sections']) setAboutSections(parseArray(settings['ngdc_about_sections']));
        if (settings['ngdc_cadet_ranks']) setCadetRanks(parseArray(settings['ngdc_cadet_ranks']));
        if (settings['ngdc_trainings']) setTrainingAnnouncements(parseArray(settings['ngdc_trainings']));
        if (settings['ngdc_training_form_fields']) setTrainingFormFields(parseArray(settings['ngdc_training_form_fields']));
        if (settings['ngdc_training_submissions']) setTrainingSubmissions(parseArray(settings['ngdc_training_submissions']));
        if (settings['ngdc_notices']) setNotices(parseArray(settings['ngdc_notices']));
        if (settings['ngdc_blogs']) setBlogs(parseArray(settings['ngdc_blogs']));
        if (settings['ngdc_memories']) setMemories(parseArray(settings['ngdc_memories']));
        if (settings['ngdc_cadet_reg_fields']) setCadetRegFields(parseArray(settings['ngdc_cadet_reg_fields']));
        if (settings['ngdc_cadet_users_v8']) {
          const remoteCadets = parseArray(settings['ngdc_cadet_users_v8']);
          if (remoteCadets.length > 0) {
            setCadetUsers((prev) => mergeCadetLists(prev, remoteCadets));
          }
        }
        if (settings['ngdc_honor_entries_3cat']) setHonorEntries(parseArray(settings['ngdc_honor_entries_3cat']));
        if (settings['ngdc_contact_config']) setContactConfig(parseObject(settings['ngdc_contact_config'], DEFAULT_CONTACT_CONFIG));
        if (settings['ngdc_contact_messages']) setContactMessages(parseArray(settings['ngdc_contact_messages']));
        if (settings['ngdc_recruitment_open'] !== undefined) setIsRecruitmentOpen(settings['ngdc_recruitment_open'] === 'true' || settings['ngdc_recruitment_open'] === true);
        if (settings['ngdc_recruitment_announcement']) setRecruitmentAnnouncement(parseObject(settings['ngdc_recruitment_announcement'], DEFAULT_RECRUITMENT_ANNOUNCEMENT));
        if (settings['ngdc_recruitment_title']) setRecruitmentNoticeTitle(typeof settings['ngdc_recruitment_title'] === 'string' ? settings['ngdc_recruitment_title'] : String(settings['ngdc_recruitment_title']));
        if (settings['ngdc_recruitment_form_fields']) setRecruitmentFormFields(parseArray(settings['ngdc_recruitment_form_fields']));
        if (settings['ngdc_recruitment_applicants']) setRecruitmentApplicants(parseArray(settings['ngdc_recruitment_applicants']));
        if (settings['ngdc_recruitment_signatories']) setRecruitmentSignatories(parseObject(settings['ngdc_recruitment_signatories'], DEFAULT_RECRUITMENT_SIGNATORIES));
        if (settings['ngdc_footer_config']) setFooterConfig(parseObject(settings['ngdc_footer_config'], DEFAULT_FOOTER_CONFIG));
      }
    }
    loadSettings();

    const unsubscribeSettings = subscribeToSiteSettingsUpdates((payload) => {
      if (payload.new && payload.new.id) {
        const key = payload.new.id;
        const val = payload.new.value;
        
        // Ignore broadcast echoes of changes initiated recently by this client (within 3500ms)
        const lastWrite = lastLocalWriteTimestamps.current[key];
        if (lastWrite && Date.now() - lastWrite < 3500) {
          return;
        }
        
        if (key === 'ngdc_hero_slides') setHeroSlides(parseArray(val));
        else if (key === 'ngdc_principal_message') setPrincipalMessage(parseExecutiveMessage(val, DEFAULT_PRINCIPAL_MESSAGE));
        else if (key === 'ngdc_vice_principal_message') setVicePrincipalMessage(parseExecutiveMessage(val, DEFAULT_VICE_PRINCIPAL_MESSAGE));
        else if (key === 'ngdc_about_overview') setAboutOverview(parseAboutOverview(val));
        else if (key === 'ngdc_bncco1_message') setBncco1Message(parseExecutiveMessage(val, DEFAULT_BNCCO1_MESSAGE));
        else if (key === 'ngdc_bncco2_message') setBncco2Message(parseExecutiveMessage(val, DEFAULT_BNCCO2_MESSAGE));
        else if (key === 'ngdc_platoon_commander_message') setPlatoonCommanderMessage(parseExecutiveMessage(val, DEFAULT_PLATOON_COMMANDER_MESSAGE));
        else if (key === 'ngdc_about_sections') setAboutSections(parseArray(val));
        else if (key === 'ngdc_cadet_ranks') setCadetRanks(parseArray(val));
        else if (key === 'ngdc_trainings') setTrainingAnnouncements(parseArray(val));
        else if (key === 'ngdc_training_form_fields') setTrainingFormFields(parseArray(val));
        else if (key === 'ngdc_training_submissions') setTrainingSubmissions(parseArray(val));
        else if (key === 'ngdc_notices') setNotices(parseArray(val));
        else if (key === 'ngdc_blogs') setBlogs(parseArray(val));
        else if (key === 'ngdc_memories') setMemories(parseArray(val));
        else if (key === 'ngdc_cadet_reg_fields') setCadetRegFields(parseArray(val));
        else if (key === 'ngdc_cadet_users_v8') {
          const remoteCadets = parseArray(val);
          if (remoteCadets.length > 0) {
            setCadetUsers((prev) => mergeCadetLists(prev, remoteCadets));
          }
        }
        else if (key === 'ngdc_honor_entries_3cat') setHonorEntries(parseArray(val));
        else if (key === 'ngdc_contact_config') setContactConfig(parseObject(val, DEFAULT_CONTACT_CONFIG));
        else if (key === 'ngdc_contact_messages') setContactMessages(parseArray(val));
        else if (key === 'ngdc_recruitment_open') setIsRecruitmentOpen(val === 'true' || val === true);
        else if (key === 'ngdc_recruitment_announcement') setRecruitmentAnnouncement(parseObject(val, DEFAULT_RECRUITMENT_ANNOUNCEMENT));
        else if (key === 'ngdc_recruitment_title') setRecruitmentNoticeTitle(typeof val === 'string' ? val : String(val));
        else if (key === 'ngdc_recruitment_form_fields') setRecruitmentFormFields(parseArray(val));
        else if (key === 'ngdc_recruitment_applicants') setRecruitmentApplicants(parseArray(val));
        else if (key === 'ngdc_recruitment_signatories') setRecruitmentSignatories(parseObject(val, DEFAULT_RECRUITMENT_SIGNATORIES));
        else if (key === 'ngdc_footer_config') setFooterConfig(parseObject(val, DEFAULT_FOOTER_CONFIG));
      }
    });

    return () => { unsubscribeSettings(); };
  }, []);

  const [servicePin, setServicePin] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_admin_service_pin');
      if (saved) return saved;
    }
    return '1721';
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('ngdc_admin_session') === 'true';
    }
    return false;
  });

  const loginAdmin = (pin: string): boolean => {
    if (pin === servicePin) {
      setIsAdminLoggedIn(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('ngdc_admin_session', 'true');
      }
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('ngdc_admin_session');
    }
  };

  const changeServicePin = (oldPin: string, newPin: string): { success: boolean; message: string } => {
    if (oldPin !== servicePin) {
      return { success: false, message: 'Current Service PIN is incorrect.' };
    }
    if (!newPin || newPin.length < 4) {
      return { success: false, message: 'New PIN must be at least 4 digits.' };
    }
    setServicePin(newPin);
    if (typeof window !== 'undefined') {
      upsertSiteSetting('ngdc_admin_service_pin', newPin);
    }
    return { success: true, message: 'Service PIN updated successfully!' };
  };

  // --- 1. Home Hero Slides ---
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_hero_slides');
      if (saved) {
        const arr = parseArray(saved);
        if (arr.length > 0) return arr;
      }
    }
    return HERO_SLIDES_DATA.map((s) => ({ ...s, isActive: true }));
  });


  const setHeroSlidesAndSave = (val: any) => {
    setHeroSlides((prev: any) => {
      const next = typeof val === 'function' ? val(prev) : val;
      saveSettingWithTimestamp('ngdc_hero_slides', next);
      return next;
    });
  };

  const setPrincipalMessageAndSave = (val: any) => {
    setPrincipalMessage((prev: any) => {
      const next = typeof val === 'function' ? val(prev) : val;
      const safe = parseExecutiveMessage(next, DEFAULT_PRINCIPAL_MESSAGE);
      saveSettingWithTimestamp('ngdc_principal_message', safe);
      return safe;
    });
  };

  const setVicePrincipalMessageAndSave = (val: any) => {
    setVicePrincipalMessage((prev: any) => {
      const next = typeof val === 'function' ? val(prev) : val;
      const safe = parseExecutiveMessage(next, DEFAULT_VICE_PRINCIPAL_MESSAGE);
      saveSettingWithTimestamp('ngdc_vice_principal_message', safe);
      return safe;
    });
  };

  const setAboutOverviewAndSave = (val: any) => {
    setAboutOverview((prev: any) => {
      const next = typeof val === 'function' ? val(prev) : val;
      const safe = parseAboutOverview(next);
      saveSettingWithTimestamp('ngdc_about_overview', safe);
      return safe;
    });
  };

  const setBncco1MessageAndSave = (val: any) => {
    setBncco1Message((prev: any) => {
      const next = typeof val === 'function' ? val(prev) : val;
      saveSettingWithTimestamp('ngdc_bncco1_message', next);
      return next;
    });
  };

  const setBncco2MessageAndSave = (val: any) => {
    setBncco2Message((prev: any) => {
      const next = typeof val === 'function' ? val(prev) : val;
      saveSettingWithTimestamp('ngdc_bncco2_message', next);
      return next;
    });
  };

  const setPlatoonCommanderMessageAndSave = (val: any) => {
    setPlatoonCommanderMessage((prev: any) => {
      const next = typeof val === 'function' ? val(prev) : val;
      saveSettingWithTimestamp('ngdc_platoon_commander_message', next);
      return next;
    });
  };

  const setAboutSectionsAndSave = (val: any) => {
    setAboutSections((prev: any) => {
      const next = typeof val === 'function' ? val(prev) : val;
      upsertSiteSetting('ngdc_about_sections', next);
      return next;
    });
  };

  const setCadetRanksAndSave = (val: any) => {
    setCadetRanks((prev: any) => {
      const next = typeof val === 'function' ? val(prev) : val;
      upsertSiteSetting('ngdc_cadet_ranks', next);
      return next;
    });
  };

  const setTrainingAnnouncementsAndSave = (val: any) => {
    setTrainingAnnouncements((prev: any) => {
      const next = typeof val === 'function' ? val(prev) : val;
      upsertSiteSetting('ngdc_trainings', next);
      return next;
    });
  };

  const setTrainingFormFieldsAndSave = (val: any) => {
    setTrainingFormFields((prev: any) => {
      const next = typeof val === 'function' ? val(prev) : val;
      upsertSiteSetting('ngdc_training_form_fields', next);
      return next;
    });
  };

  const setTrainingSubmissionsAndSave = (val: any) => {
    setTrainingSubmissions((prev: any) => {
      const next = typeof val === 'function' ? val(prev) : val;
      upsertSiteSetting('ngdc_training_submissions', next);
      return next;
    });
  };

  const setNoticesAndSave = (val: any) => {
    setNotices((prev: any) => {
      const next = typeof val === 'function' ? val(prev) : val;
      upsertSiteSetting('ngdc_notices', next);
      return next;
    });
  };

  const setBlogsAndSave = (val: any) => {
    setBlogs((prev: any) => {
      const next = typeof val === 'function' ? val(prev) : val;
      upsertSiteSetting('ngdc_blogs', next);
      return next;
    });
  };

  const setMemoriesAndSave = (val: any) => {
    setMemories((prev: any) => {
      const next = typeof val === 'function' ? val(prev) : val;
      upsertSiteSetting('ngdc_memories', next);
      return next;
    });
  };

  const setCadetRegFieldsAndSave = (val: any) => {
    setCadetRegFields((prev: any) => {
      const next = typeof val === 'function' ? val(prev) : val;
      upsertSiteSetting('ngdc_cadet_reg_fields', next);
      return next;
    });
  };

  const setCadetUsersAndSave = (val: any) => {
    setCadetUsers((prev: any) => {
      const next = typeof val === 'function' ? val(prev) : val;
      saveSettingWithTimestamp('ngdc_cadet_users_v8', next);
      return next;
    });
  };

  const setHonorEntriesAndSave = (val: any) => {
    setHonorEntries((prev: any) => {
      const next = typeof val === 'function' ? val(prev) : val;
      upsertSiteSetting('ngdc_honor_entries_3cat', next);
      return next;
    });
  };

  const setContactConfigAndSave = (val: any) => {
    setContactConfig((prev: any) => {
      const next = typeof val === 'function' ? val(prev) : val;
      upsertSiteSetting('ngdc_contact_config', next);
      return next;
    });
  };

  const setContactMessagesAndSave = (val: any) => {
    setContactMessages((prev: any) => {
      const next = typeof val === 'function' ? val(prev) : val;
      upsertSiteSetting('ngdc_contact_messages', next);
      return next;
    });
  };

  const setIsRecruitmentOpenAndSave = (val: any) => {
    setIsRecruitmentOpenState((prev: boolean) => {
      const next = typeof val === 'function' ? val(prev) : Boolean(val);
      upsertSiteSetting('ngdc_recruitment_open', next);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ngdc_recruitment_open', String(next));
      }
      return next;
    });
  };

  const setRecruitmentAnnouncementAndSave = (val: any) => {
    setRecruitmentAnnouncement((prev: any) => {
      const next = typeof val === 'function' ? val(prev) : val;
      upsertSiteSetting('ngdc_recruitment_announcement', next);
      return next;
    });
  };

  const setRecruitmentNoticeTitleAndSave = (val: any) => {
    setRecruitmentNoticeTitle((prev: any) => {
      const next = typeof val === 'function' ? val(prev) : val;
      upsertSiteSetting('ngdc_recruitment_title', next);
      return next;
    });
  };

  const setRecruitmentFormFieldsAndSave = (val: any) => {
    setRecruitmentFormFields((prev: any) => {
      const next = typeof val === 'function' ? val(prev) : val;
      upsertSiteSetting('ngdc_recruitment_form_fields', next);
      return next;
    });
  };

  const setRecruitmentApplicantsAndSave = (val: any) => {
    setRecruitmentApplicants((prev: any) => {
      const next = typeof val === 'function' ? val(prev) : val;
      upsertSiteSetting('ngdc_recruitment_applicants', next);
      return next;
    });
  };

  const setRecruitmentSignatoriesAndSave = (val: any) => {
    setRecruitmentSignatories((prev: any) => {
      const next = typeof val === 'function' ? val(prev) : val;
      upsertSiteSetting('ngdc_recruitment_signatories', next);
      return next;
    });
  };

  const setFooterConfigAndSave = (val: any) => {
    setFooterConfig((prev: any) => {
      const next = typeof val === 'function' ? val(prev) : val;
      upsertSiteSetting('ngdc_footer_config', next);
      return next;
    });
  };

  const addHeroSlide = (slide: Omit<HeroSlide, 'id'>) => {
    const newSlide: HeroSlide = {
      ...slide,
      id: `hero-slide-${Date.now()}`,
      isActive: slide.isActive !== false,
    };
    setHeroSlidesAndSave((prev) => [...prev, newSlide]);
  };

  const updateHeroSlide = (id: string, slide: Partial<HeroSlide>) => {
    setHeroSlidesAndSave((prev) => prev.map((s) => (s.id === id ? { ...s, ...slide } : s)));
  };

  const deleteHeroSlide = (id: string) => {
    setHeroSlidesAndSave((prev) => prev.filter((s) => s.id !== id));
  };

  // --- 1.1 Executive Messages (Principal & Vice-Principal) ---
  const [principalMessage, setPrincipalMessage] = useState<ExecutiveMessageConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ngdc_principal_message');
        if (saved) {
          return parseExecutiveMessage(saved, DEFAULT_PRINCIPAL_MESSAGE);
        }
      } catch {}
    }
    return DEFAULT_PRINCIPAL_MESSAGE;
  });

  const updatePrincipalMessage = async (config: Partial<ExecutiveMessageConfig>): Promise<boolean> => {
    let nextValue: ExecutiveMessageConfig = DEFAULT_PRINCIPAL_MESSAGE;
    setPrincipalMessage((prev) => {
      const merged = { ...prev, ...config };
      nextValue = parseExecutiveMessage(merged, DEFAULT_PRINCIPAL_MESSAGE);
      saveSettingWithTimestamp('ngdc_principal_message', nextValue);
      return nextValue;
    });
    return await upsertSiteSetting('ngdc_principal_message', nextValue);
  };

  const resetPrincipalMessage = async (): Promise<boolean> => {
    setPrincipalMessage(DEFAULT_PRINCIPAL_MESSAGE);
    saveSettingWithTimestamp('ngdc_principal_message', DEFAULT_PRINCIPAL_MESSAGE);
    return await upsertSiteSetting('ngdc_principal_message', DEFAULT_PRINCIPAL_MESSAGE);
  };

  const [vicePrincipalMessage, setVicePrincipalMessage] = useState<ExecutiveMessageConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ngdc_vice_principal_message');
        if (saved) {
          return parseExecutiveMessage(saved, DEFAULT_VICE_PRINCIPAL_MESSAGE);
        }
      } catch {}
    }
    return DEFAULT_VICE_PRINCIPAL_MESSAGE;
  });

  const updateVicePrincipalMessage = async (config: Partial<ExecutiveMessageConfig>): Promise<boolean> => {
    let nextValue: ExecutiveMessageConfig = DEFAULT_VICE_PRINCIPAL_MESSAGE;
    setVicePrincipalMessage((prev) => {
      const merged = { ...prev, ...config };
      nextValue = parseExecutiveMessage(merged, DEFAULT_VICE_PRINCIPAL_MESSAGE);
      saveSettingWithTimestamp('ngdc_vice_principal_message', nextValue);
      return nextValue;
    });
    return await upsertSiteSetting('ngdc_vice_principal_message', nextValue);
  };

  const resetVicePrincipalMessage = async (): Promise<boolean> => {
    setVicePrincipalMessage(DEFAULT_VICE_PRINCIPAL_MESSAGE);
    saveSettingWithTimestamp('ngdc_vice_principal_message', DEFAULT_VICE_PRINCIPAL_MESSAGE);
    return await upsertSiteSetting('ngdc_vice_principal_message', DEFAULT_VICE_PRINCIPAL_MESSAGE);
  };

  // --- 2. About Us - Overview, Messages & Rank Hierarchy ---
  const [aboutOverview, setAboutOverview] = useState<AboutOverviewConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_about_overview');
      if (saved) {
        return parseAboutOverview(saved);
      }
    }
    return DEFAULT_ABOUT_OVERVIEW;
  });

  const updateAboutOverview = (config: Partial<AboutOverviewConfig>) => {
    setAboutOverviewAndSave((prev) => ({ ...prev, ...config }));
  };

  const resetAboutOverview = () => {
    setAboutOverviewAndSave(DEFAULT_ABOUT_OVERVIEW);
  };

  const [bncco1Message, setBncco1Message] = useState<ExecutiveMessageConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_bncco1_message');
      if (saved) {
        return parseExecutiveMessage(saved, DEFAULT_BNCCO1_MESSAGE);
      }
    }
    return DEFAULT_BNCCO1_MESSAGE;
  });

  const updateBncco1Message = (config: Partial<ExecutiveMessageConfig>) => {
    setBncco1MessageAndSave((prev) => ({ ...prev, ...config }));
  };

  const resetBncco1Message = () => {
    setBncco1MessageAndSave(DEFAULT_BNCCO1_MESSAGE);
  };

  const [bncco2Message, setBncco2Message] = useState<ExecutiveMessageConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_bncco2_message');
      if (saved) {
        return parseExecutiveMessage(saved, DEFAULT_BNCCO2_MESSAGE);
      }
    }
    return DEFAULT_BNCCO2_MESSAGE;
  });

  const updateBncco2Message = (config: Partial<ExecutiveMessageConfig>) => {
    setBncco2MessageAndSave((prev) => ({ ...prev, ...config }));
  };

  const resetBncco2Message = () => {
    setBncco2MessageAndSave(DEFAULT_BNCCO2_MESSAGE);
  };

  const [platoonCommanderMessage, setPlatoonCommanderMessage] = useState<ExecutiveMessageConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_platoon_commander_message');
      if (saved) {
        return parseExecutiveMessage(saved, DEFAULT_PLATOON_COMMANDER_MESSAGE);
      }
    }
    return DEFAULT_PLATOON_COMMANDER_MESSAGE;
  });

  const updatePlatoonCommanderMessage = (config: Partial<ExecutiveMessageConfig>) => {
    setPlatoonCommanderMessageAndSave((prev) => ({ ...prev, ...config }));
  };

  const resetPlatoonCommanderMessage = () => {
    setPlatoonCommanderMessageAndSave(DEFAULT_PLATOON_COMMANDER_MESSAGE);
  };

  const [aboutSections, setAboutSections] = useState<CustomAboutSection[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_about_sections');
      if (saved) {
        const parsed = parseArray(saved);
        if (parsed.length > 0) {
          // Filter out legacy "Historical Legacy" and "Code of Honor" sections
          return parsed.filter(
            (s: any) =>
              s.id !== 'abt-sec-1' &&
              s.id !== 'abt-sec-2' &&
              s.badge !== 'Historical Legacy' &&
              s.badge !== 'Code of Honor'
          );
        }
      }
    }
    return DEFAULT_ABOUT_SECTIONS;
  });

  const addAboutSection = (sec: Omit<CustomAboutSection, 'id'>) => {
    const newSec: CustomAboutSection = { ...sec, id: `abt-sec-${Date.now()}` };
    setAboutSectionsAndSave((prev) => [...prev, newSec]);
  };

  const updateAboutSection = (id: string, sec: Partial<CustomAboutSection>) => {
    setAboutSectionsAndSave((prev) => prev.map((s) => (s.id === id ? { ...s, ...sec } : s)));
  };

  const deleteAboutSection = (id: string) => {
    setAboutSectionsAndSave((prev) => prev.filter((s) => s.id !== id));
  };

  const [cadetRanks, setCadetRanks] = useState<CadetRankHierarchyItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_cadet_ranks');
      if (saved) {
        const parsed = parseArray(saved);
        if (parsed.length > 0) return parsed;
      }
    }
    return DEFAULT_CADET_RANKS;
  });

  const addCadetRank = (rank: Omit<CadetRankHierarchyItem, 'id'>) => {
    const newRank: CadetRankHierarchyItem = { ...rank, id: `rank-${Date.now()}` };
    setCadetRanksAndSave((prev) => [...prev, newRank]);
  };

  const updateCadetRank = (id: string, rank: Partial<CadetRankHierarchyItem>) => {
    setCadetRanksAndSave((prev) => prev.map((r) => (r.id === id ? { ...r, ...rank } : r)));
  };

  const deleteCadetRank = (id: string) => {
    setCadetRanksAndSave((prev) => prev.filter((r) => r.id !== id));
  };

  // --- 3. Trainings & Events ---
  const [trainingAnnouncements, setTrainingAnnouncements] = useState<TrainingAnnouncement[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_trainings');
      if (saved) {
        const parsed = parseArray(saved);
        if (parsed.length > 0) return parsed;
      }
    }
    return DEFAULT_TRAINING_ANNOUNCEMENTS;
  });

  const addTrainingAnnouncement = (ann: Omit<TrainingAnnouncement, 'id'>) => {
    const newAnn: TrainingAnnouncement = { ...ann, id: `tr-${Date.now()}` };
    setTrainingAnnouncementsAndSave((prev) => [newAnn, ...prev]);
  };

  const updateTrainingAnnouncement = (id: string, ann: Partial<TrainingAnnouncement>) => {
    setTrainingAnnouncementsAndSave((prev) => prev.map((a) => (a.id === id ? { ...a, ...ann } : a)));
  };

  const deleteTrainingAnnouncement = (id: string) => {
    setTrainingAnnouncementsAndSave((prev) => prev.filter((a) => a.id !== id));
  };

  const [trainingFormFields, setTrainingFormFields] = useState<FormFieldConfig[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_training_form_fields');
      if (saved) {
        const parsed = parseArray(saved);
        if (parsed.length > 0) return parsed;
      }
    }
    return DEFAULT_TRAINING_FORM_FIELDS;
  });

  const [trainingSubmissions, setTrainingSubmissions] = useState<CustomFormSubmission[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_training_submissions');
      if (saved) {
        return parseArray(saved);
      }
    }
    return [];
  });

  const addTrainingSubmission = (submission: Omit<CustomFormSubmission, 'id' | 'submittedAt'>) => {
    const newSub: CustomFormSubmission = {
      ...submission,
      id: `sub-${Date.now()}`,
      submittedAt: new Date().toLocaleString(),
    };
    setTrainingSubmissionsAndSave((prev) => [newSub, ...prev]);
    upsertSiteSetting('ngdc_training_submissions', [newSub, ...trainingSubmissions]);
  };

  // --- 4. Notice & Blogs ---
  const [notices, setNotices] = useState<NoticeItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_notices');
      if (saved) {
        const parsed = parseArray(saved);
        if (parsed.length > 0) return parsed;
      }
    }
    return NOTICES_DATA;
  });

  const addNotice = (notice: Omit<NoticeItem, 'id'>) => {
    const newNotice: NoticeItem = { ...notice, id: `not-${Date.now()}` };
    setNoticesAndSave((prev) => [newNotice, ...prev]);
  };

  const updateNotice = (id: string, notice: Partial<NoticeItem>) => {
    setNoticesAndSave((prev) => prev.map((n) => (n.id === id ? { ...n, ...notice } : n)));
  };

  const deleteNotice = (id: string) => {
    setNoticesAndSave((prev) => prev.filter((n) => n.id !== id));
  };

  const [blogs, setBlogs] = useState<BlogItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_blogs');
      if (saved) {
        const parsed = parseArray(saved);
        if (parsed.length > 0) return parsed;
      }
    }
    return BLOGS_DATA;
  });

  const addBlog = (blog: Omit<BlogItem, 'id'>) => {
    const newBlog: BlogItem = { ...blog, id: `blog-${Date.now()}` };
    setBlogsAndSave((prev) => [newBlog, ...prev]);
  };

  const updateBlog = (id: string, blog: Partial<BlogItem>) => {
    setBlogsAndSave((prev) => prev.map((b) => (b.id === id ? { ...b, ...blog } : b)));
  };

  const deleteBlog = (id: string) => {
    setBlogsAndSave((prev) => prev.filter((b) => b.id !== id));
  };

  // --- 5. Memories ---
  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_memories');
      if (saved) {
        const parsed = parseArray(saved);
        if (parsed.length > 0) return parsed;
      }
    }
    return MEMORIES_DATA;
  });

  const addMemory = (mem: Omit<MemoryItem, 'id'>) => {
    const newMem: MemoryItem = { ...mem, id: `mem-${Date.now()}` };
    setMemoriesAndSave((prev) => [newMem, ...prev]);
  };

  const updateMemory = (id: string, mem: Partial<MemoryItem>) => {
    setMemoriesAndSave((prev) => prev.map((m) => (m.id === id ? { ...m, ...mem } : m)));
  };

  const deleteMemory = (id: string) => {
    setMemoriesAndSave((prev) => prev.filter((m) => m.id !== id));
  };

  // --- 6. Cadet Corner - Database & Directory & Form Builder ---
  const [cadetRegFields, setCadetRegFields] = useState<FormFieldConfig[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_cadet_reg_fields');
      if (saved) {
        const parsed = parseArray(saved);
        if (parsed.length > 0) return parsed;
      }
    }
    return DEFAULT_CADET_REG_FIELDS;
  });

  const [cadetUsers, setCadetUsers] = useState<CadetUserAccount[]>(() => {
    if (typeof window !== 'undefined') {
      const keys = ['ngdc_cadet_users_v8', 'ngdc_cadet_users_v7', 'ngdc_cadet_users'];
      for (const k of keys) {
        const saved = localStorage.getItem(k);
        if (saved) {
          const parsed = parseArray(saved);
          if (parsed.length > 0) return parsed;
        }
      }
    }
    return DEFAULT_CADET_USERS; // Empty array [] by default - Admin inputs cadets
  });

  // Supabase Postgres DB Live Sync for Cadets
  const syncCadetsWithSupabase = async () => {
    if (isSupabaseConfigured()) {
      try {
        const remote = await fetchCadetsFromSupabase();
        if (remote && Array.isArray(remote) && remote.length > 0) {
          setCadetUsersAndSave((prev: CadetUserAccount[]) => mergeCadetLists(prev, remote));
        }
      } catch (err) {
        console.warn('Error fetching cadets from Supabase:', err);
      }
    }
  };

  useEffect(() => {
    syncCadetsWithSupabase();
  }, []);

  const addCadetUser = (user: Omit<CadetUserAccount, 'id'>) => {
    const category: PlatoonCategory = user.category || 'Male Platoon';
    const newUser: CadetUserAccount = {
      ...user,
      id: `usr-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      category,
      section: user.section || (category === 'Band Platoon' ? 'Band Section 01' : 'Section 01'),
      status: user.status || (category === 'Ex-cadets' ? 'Alumni' : 'Active'),
      cadetType: user.cadetType || (category === 'Ex-cadets' ? 'Ex-cadet' : 'Current'),
      isApproved: user.isApproved !== undefined ? user.isApproved : true,
    };
    setCadetUsersAndSave((prev) => [newUser, ...prev]);

    // Asynchronously push to Supabase Postgres database if configured
    upsertCadetToSupabase(newUser).catch((err) => {
      console.warn('Failed to upsert cadet to Supabase:', err);
    });
  };

  const updateCadetUser = (id: string, user: Partial<CadetUserAccount>) => {
    setCadetUsersAndSave((prev) => {
      const updated = prev.map((u) => {
        if (u.id === id) {
          const merged = { ...u, ...user };
          // Asynchronously update in Supabase Postgres database
          upsertCadetToSupabase(merged).catch((err) => {
            console.warn('Failed to update cadet in Supabase:', err);
          });
          return merged;
        }
        return u;
      });
      return updated;
    });
  };

  const deleteCadetUser = (id: string) => {
    setCadetUsersAndSave((prev) => prev.filter((u) => u.id !== id));
    // Asynchronously delete from Supabase Postgres database
    deleteCadetFromSupabase(id).catch((err) => {
      console.warn('Failed to delete cadet from Supabase:', err);
    });
  };

  const approveCadetApplicant = (
    id: string,
    options: {
      password: string;
      category?: PlatoonCategory;
      section?: string;
      rank?: string;
      cadetNo?: string;
    }
  ) => {
    let approvedCadet: CadetUserAccount | null = null;
    setCadetUsersAndSave((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const targetCategory: PlatoonCategory = options.category || c.category || 'Male Platoon';
        const isExCadet = c.cadetType === 'Ex-cadet' || targetCategory === 'Ex-cadets';
        const updated: CadetUserAccount = {
          ...c,
          cadetNo: options.cadetNo?.trim() || c.cadetNo,
          password: options.password?.trim() || c.password,
          category: targetCategory,
          section: options.section || c.section || (isExCadet ? 'Ex-cadet Platoon' : 'Section 01'),
          rank: options.rank || c.rank || (isExCadet ? 'Ex-Cadet' : 'Cadet (CDT)'),
          status: isExCadet ? 'Alumni' : 'Active',
          cadetType: isExCadet ? 'Ex-cadet' : 'Current',
          isApproved: true,
        };
        approvedCadet = updated;
        return updated;
      })
    );

    if (approvedCadet) {
      upsertCadetToSupabase(approvedCadet).catch((err) => {
        console.warn('Failed to upsert approved cadet to Supabase:', err);
      });
    }
  };

  const clearAllCadetUsers = () => {
    setCadetUsersAndSave([]);
  };

  // Public Cadet Auth Session
  const [activeCadetAuth, setActiveCadetAuth] = useState<CadetUserAccount | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('ngdc_active_cadet_auth');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return null;
  });

  const cadetLogin = (cadetNo: string, pass: string): { success: boolean; message: string; cadet?: CadetUserAccount } => {
    const normalizedNo = cadetNo.trim().toUpperCase();
    const found = cadetUsers.find(
      (u) =>
        u.cadetNo.trim().toUpperCase() === normalizedNo ||
        u.collegeId.trim().toUpperCase() === normalizedNo
    );

    if (!found) {
      return { success: false, message: 'Cadet ID or College Roll not found in platoon directory.' };
    }

    if (!found.isApproved || found.status === 'Pending Approval') {
      return {
        success: false,
        message: 'Your registration is currently pending review by Platoon Administration. Once approved by the Admin, you will be added to the directory and can log in.',
        cadet: found,
      };
    }

    if (!found.password || found.password !== pass) {
      return { success: false, message: 'Incorrect Password. Please check with Platoon Admin for your assigned password.' };
    }

    setActiveCadetAuth(found);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ngdc_active_cadet_auth', JSON.stringify(found));
      sessionStorage.setItem('ngdc_bncc_cadet_auth', 'true');
    }
    return { success: true, message: `Welcome back, ${found.rank} ${found.name}!`, cadet: found };
  };

  const cadetRegister = (cadetData: Partial<CadetUserAccount>): { success: boolean; message: string; cadet?: CadetUserAccount } => {
    const cadetName = cadetData.name?.trim() || '';
    if (!cadetName) {
      return { success: false, message: 'Cadet Name is required.' };
    }

    const proposedId = cadetData.cadetNo?.trim().toUpperCase() || cadetData.collegeId?.trim().toUpperCase() || `NGDC-${Math.floor(1000 + Math.random() * 9000)}`;
    const isEx = cadetData.cadetType === 'Ex-cadet' || cadetData.category === 'Ex-cadets';
    const category: PlatoonCategory = isEx ? 'Ex-cadets' : (cadetData.category || (cadetData.gender === 'Female' ? 'Female Platoon' : 'Male Platoon'));
    const isApproved = cadetData.isApproved !== undefined ? cadetData.isApproved : (cadetData.status === 'Pending Approval' ? false : true);
    const initialStatus = cadetData.status || (isApproved ? (isEx ? 'Alumni' : 'Active') : 'Pending Approval');

    const newCadet: CadetUserAccount = {
      id: `usr-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      cadetNo: proposedId,
      password: cadetData.password?.trim() || 'cadet123',
      name: cadetName,
      nameBangla: cadetData.nameBangla?.trim() || '',
      fatherName: cadetData.fatherName?.trim() || '',
      fatherNameBangla: cadetData.fatherNameBangla?.trim() || '',
      motherName: cadetData.motherName?.trim() || '',
      motherNameBangla: cadetData.motherNameBangla?.trim() || '',
      dob: cadetData.dob?.trim() || '',
      gender: cadetData.gender || (category === 'Female Platoon' ? 'Female' : 'Male'),
      religion: cadetData.religion || 'Islam',
      className: cadetData.className || '',
      category,
      section: cadetData.section || (category === 'Band Platoon' ? 'Band Section 01' : isEx ? 'Ex-cadet Platoon' : 'Section 01'),
      rank: cadetData.rank || (isEx ? 'Ex-Cadet' : 'Cadet (CDT)'),
      appointment: cadetData.appointment || (isEx ? 'Alumni' : 'Cadet Trainee'),
      platoon: isEx ? 'Ex-cadets Alumni' : category,
      batch: cadetData.batch || 'Batch 24',
      collegeId: cadetData.collegeId || proposedId,
      department: cadetData.department || 'General',
      bloodGroup: cadetData.bloodGroup || 'B+',
      presentAddress: cadetData.presentAddress || '',
      permanentAddress: cadetData.permanentAddress || '',
      phone: cadetData.phone || '',
      guardianPhone: cadetData.guardianPhone || '',
      email: cadetData.email || '',
      currentJob: cadetData.currentJob || '',
      socialMedia: cadetData.socialMedia || '',
      additionalSkills: cadetData.additionalSkills || '',
      achievements: cadetData.achievements || '',
      joiningDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      attendancePercentage: 100,
      paradesAttended: 24,
      totalParades: 24,
      campsAttended: [],
      certificates: [],
      status: initialStatus,
      cadetType: isEx ? 'Ex-cadet' : 'Current',
      isApproved,
      avatarUrl: cadetData.avatarUrl || '',
    };

    setCadetUsersAndSave((prev) => [newCadet, ...prev]);

    // Upsert to Supabase if configured
    upsertCadetToSupabase(newCadet).catch((err) => {
      console.warn('Failed to upsert cadet to Supabase:', err);
    });

    const isPending = !isApproved || initialStatus === 'Pending Approval';
    return {
      success: true,
      message: isPending
        ? 'Your registration has been submitted and is pending Admin Approval. Once approved by the Platoon Administration, your profile will be added to the directory and you can log in.'
        : 'Cadet registered successfully and added directly to the platoon directory! You can now log in.',
      cadet: newCadet,
    };
  };

  const cadetLogout = () => {
    setActiveCadetAuth(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('ngdc_active_cadet_auth');
      sessionStorage.removeItem('ngdc_bncc_cadet_auth');
    }
  };

  // --- 7. Honor Board - 3 Tabbed Categories ---
  const [honorEntries, setHonorEntries] = useState<HonorEntryItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_honor_entries_3cat');
      if (saved) {
        const parsed = parseArray(saved);
        if (parsed.length > 0) return parsed;
      }
    }
    return DEFAULT_HONOR_ENTRIES;
  });

  const addHonorEntry = (entry: Omit<HonorEntryItem, 'id'>) => {
    const newEntry: HonorEntryItem = {
      ...entry,
      id: `honor-${Date.now()}`,
    };
    setHonorEntriesAndSave((prev) => [...prev, newEntry]);
  };

  const updateHonorEntry = (id: string, entry: Partial<HonorEntryItem>) => {
    setHonorEntriesAndSave((prev) => prev.map((e) => (e.id === id ? { ...e, ...entry } : e)));
  };

  const deleteHonorEntry = (id: string) => {
    setHonorEntriesAndSave((prev) => prev.filter((e) => e.id !== id));
  };

  // --- 8. Contact ---
  const [contactConfig, setContactConfig] = useState<ContactConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_contact_config');
      if (saved) {
        return parseObject(saved, DEFAULT_CONTACT_CONFIG);
      }
    }
    return DEFAULT_CONTACT_CONFIG;
  });

  const updateContactConfig = (config: Partial<ContactConfig>) => {
    setContactConfigAndSave((prev) => ({ ...prev, ...config }));
  };

  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_contact_messages');
      if (saved) {
        return parseArray(saved);
      }
    }
    return DEFAULT_CONTACT_MESSAGES;
  });

  const addContactMessage = (msg: Omit<ContactMessage, 'id' | 'timestamp'>) => {
    const newMsg: ContactMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      isRead: false,
    };
    setContactMessagesAndSave((prev) => [newMsg, ...prev]);
  };

  const markContactMessageRead = (id: string) => {
    setContactMessagesAndSave((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)));
  };

  const deleteContactMessage = (id: string) => {
    setContactMessagesAndSave((prev) => prev.filter((m) => m.id !== id));
  };

  // --- 9. Cadet Recruitment ---
  const [isRecruitmentOpen, setIsRecruitmentOpenState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_recruitment_open');
      if (saved !== null) return saved === 'true';
    }
    return true; // Default Open
  });

  const [recruitmentAnnouncement, setRecruitmentAnnouncement] = useState<RecruitmentAnnouncementConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_recruitment_announcement');
      if (saved) {
        return parseObject(saved, DEFAULT_RECRUITMENT_ANNOUNCEMENT);
      }
    }
    return DEFAULT_RECRUITMENT_ANNOUNCEMENT;
  });

  const setIsRecruitmentOpen = (open: boolean) => {
    setIsRecruitmentOpenState(open);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ngdc_recruitment_open', String(open));
    }
    setRecruitmentAnnouncementAndSave((prev) => ({ ...prev, isActive: open }));
  };

  const updateRecruitmentAnnouncement = (ann: Partial<RecruitmentAnnouncementConfig>) => {
    if (ann.isActive !== undefined) {
      setIsRecruitmentOpenState(ann.isActive);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ngdc_recruitment_open', String(ann.isActive));
      }
    }
    setRecruitmentAnnouncementAndSave((prev) => ({ ...prev, ...ann }));
  };

  const [recruitmentNoticeTitle, setRecruitmentNoticeTitle] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_recruitment_title');
      if (saved) return saved;
    }
    return 'Cadet Recruitment Batch 2024-2025 Enrolment Circular';
  });

  const [recruitmentFormFields, setRecruitmentFormFields] = useState<FormFieldConfig[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_recruitment_form_fields');
      if (saved) {
        const parsed = parseArray(saved);
        if (parsed.length > 0) return parsed;
      }
    }
    return DEFAULT_RECRUITMENT_FORM_FIELDS;
  });

  const [recruitmentApplicants, setRecruitmentApplicants] = useState<RecruitmentApplicant[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_recruitment_applicants');
      if (saved) {
        const parsed = parseArray(saved);
        if (parsed.length > 0) return parsed;
      }
    }
    return DEFAULT_RECRUITMENT_APPLICANTS;
  });

  // --- Official Recruitment Printable Signatories Configuration (Editable yearly) ---
  const [recruitmentSignatories, setRecruitmentSignatories] = useState<RecruitmentSignatoriesConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_recruitment_signatories');
      if (saved) {
        return parseObject(saved, DEFAULT_RECRUITMENT_SIGNATORIES);
      }
    }
    return DEFAULT_RECRUITMENT_SIGNATORIES;
  });

  const updateRecruitmentSignatories = (config: Partial<RecruitmentSignatoriesConfig>) => {
    setRecruitmentSignatoriesAndSave((prev) => ({ ...prev, ...config }));
  };

  const resetRecruitmentSignatories = () => {
    setRecruitmentSignatoriesAndSave(DEFAULT_RECRUITMENT_SIGNATORIES);
  };

  const addRecruitmentApplicant = (applicant: Omit<RecruitmentApplicant, 'id' | 'token' | 'appliedAt' | 'status'> & { token?: string }): string => {
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const token = applicant.token || `NGDC-REC-${year}-${randomSuffix}`;
    const newApplicant: RecruitmentApplicant = {
      ...applicant,
      id: `app-${Date.now()}`,
      token,
      serialNo: applicant.serialNo || token,
      status: 'Pending',
      appliedAt: new Date().toLocaleString(),
    };
    setRecruitmentApplicantsAndSave((prev) => [newApplicant, ...prev]);
    return token;
  };

  const updateApplicantStatus = (id: string, status: RecruitmentApplicant['status']) => {
    setRecruitmentApplicantsAndSave((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const updateRecruitmentApplicant = (id: string, applicant: Partial<RecruitmentApplicant>) => {
    setRecruitmentApplicantsAndSave((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...applicant } : a))
    );
  };

  const deleteRecruitmentApplicant = (id: string) => {
    setRecruitmentApplicantsAndSave((prev) => prev.filter((a) => a.id !== id));
  };

  // Export Applicants to Excel (.xlsx format)
  const exportApplicantsToExcel = () => {
    try {
      const excelRows = recruitmentApplicants.map((app, index) => {
        const row: Record<string, any> = {
          'SL No': index + 1,
          'Serial / Token No.': app.serialNo || app.token || app.id,
          'Enrolment Status': app.status || 'Pending',
          'Application Date': app.appliedAt || '',
          'Full Name (English)': app.nameEnglish || app.fullName || '',
          'Full Name (Bangla)': app.nameBangla || '',
          'Father Name (English)': app.fatherNameEnglish || '',
          'Father Name (Bangla)': app.fatherNameBangla || '',
          'Mother Name (English)': app.motherNameEnglish || '',
          'Mother Name (Bangla)': app.motherNameBangla || '',
          'Gender': app.gender || '',
          'Class / Year': app.studentClass || '',
          'Department': app.department || '',
          'College Roll': app.collegeRoll || '',
          'Session': app.session || '',
          'Date of Birth': app.dateOfBirth || '',
          'Religion': app.religion || '',
          'Blood Group': app.bloodGroup || '',
          'Height (Feet)': app.heightFeet || '',
          'Height (Inches)': app.heightInches || '',
          'Height (Combined)': app.heightFeet ? `${app.heightFeet}' ${app.heightInches || 0}"` : (app.height || ''),
          'Weight (kg)': app.weightKg || app.weight || '',
          'Chest (Normal)': app.chestNormal || '',
          'Chest (Expanded)': app.chestExpanded || '',
          'Applicant Mobile (Self)': app.phoneSelf || app.phone || '',
          'Guardian Mobile': app.phoneGuardian || '',
          'Email Address': app.email || '',
          'Present Address - Division': app.presentAddress?.division || '',
          'Present Address - District': app.presentAddress?.district || '',
          'Present Address - Upazila/Thana': app.presentAddress?.upazila || '',
          'Present Address - Post Office': app.presentAddress?.post || '',
          'Present Address - Village/Road': app.presentAddress?.village || '',
          'Permanent Address - Division': app.permanentAddress?.division || '',
          'Permanent Address - District': app.permanentAddress?.district || '',
          'Permanent Address - Upazila/Thana': app.permanentAddress?.upazila || '',
          'Permanent Address - Post Office': app.permanentAddress?.post || '',
          'Permanent Address - Village/Road': app.permanentAddress?.village || '',
          'Qualification 1 Exam': app.qualifications?.[0]?.examName || 'SSC',
          'Qualification 1 Group': app.qualifications?.[0]?.divisionOrGroup || '',
          'Qualification 1 Board': app.qualifications?.[0]?.board || '',
          'Qualification 1 Passing Year': app.qualifications?.[0]?.passingYear || '',
          'Qualification 1 GPA': app.qualifications?.[0]?.gpa || '',
          'Qualification 2 Exam': app.qualifications?.[1]?.examName || '',
          'Qualification 2 Group': app.qualifications?.[1]?.divisionOrGroup || '',
          'Qualification 2 Board': app.qualifications?.[1]?.board || '',
          'Qualification 2 Passing Year': app.qualifications?.[1]?.passingYear || '',
          'Qualification 2 GPA': app.qualifications?.[1]?.gpa || '',
          'Additional Skills': app.additionalSkills || '',
          'Reason / Motivation': app.reason || '',
          'Pledge Accepted': app.pledgeAccepted ? 'Yes' : 'No',
          'Guardian Consent Accepted': app.guardianConsentAccepted ? 'Yes' : 'No',
          'Photo Attached': app.avatarUrl ? 'Yes' : 'No',
        };

        // Also append any custom fields
        if (app.customData && typeof app.customData === 'object') {
          Object.entries(app.customData).forEach(([k, v]) => {
            row[`Custom: ${k}`] = v;
          });
        }

        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(excelRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Recruitment_Applicants');
      
      const fileName = `NGDC_BNCC_Recruitment_Applicants_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      alert('Could not export to Excel. Please check console.');
    }
  };

  // --- 10. Footer Config ---
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ngdc_footer_config');
      if (saved) {
        return parseObject(saved, DEFAULT_FOOTER_CONFIG);
      }
    }
    return DEFAULT_FOOTER_CONFIG;
  });

  const updateFooterConfig = (config: Partial<FooterConfig>) => {
    setFooterConfigAndSave((prev) => ({ ...prev, ...config }));
  };

  const resetAllToDefault = () => {
    if (confirm('Are you sure you want to reset all portal content to factory defaults?')) {
      // localStorage.clear() removed
      window.location.reload();
    }
  };

  const memoizedRecruitmentConfig = useMemo(() => ({
    noticeTitle: recruitmentNoticeTitle,
    batchName: recruitmentAnnouncement?.batch || '',
    isOpen: isRecruitmentOpen,
  }), [recruitmentNoticeTitle, recruitmentAnnouncement?.batch, isRecruitmentOpen]);

  return (
    <AdminDataContext.Provider
      value={{
        servicePin,
        changeServicePin,
        isAdminLoggedIn,
        loginAdmin,
        logoutAdmin,

        heroSlides,
        addHeroSlide,
        updateHeroSlide,
        deleteHeroSlide,
        principalMessage,
        updatePrincipalMessage,
        resetPrincipalMessage,
        vicePrincipalMessage,
        updateVicePrincipalMessage,
        resetVicePrincipalMessage,

        aboutOverview,
        updateAboutOverview,
        resetAboutOverview,
        bncco1Message,
        updateBncco1Message,
        resetBncco1Message,
        bncco2Message,
        updateBncco2Message,
        resetBncco2Message,
        platoonCommanderMessage,
        updatePlatoonCommanderMessage,
        resetPlatoonCommanderMessage,
        aboutSections,
        addAboutSection,
        updateAboutSection,
        deleteAboutSection,
        cadetRanks,
        addCadetRank,
        updateCadetRank,
        deleteCadetRank,

        trainingAnnouncements,
        addTrainingAnnouncement,
        updateTrainingAnnouncement,
        deleteTrainingAnnouncement,
        trainingFormFields,
        setTrainingFormFields,
        trainingSubmissions,
        addTrainingSubmission,

        notices,
        addNotice,
        updateNotice,
        deleteNotice,
        blogs,
        addBlog,
        updateBlog,
        deleteBlog,

        memories,
        addMemory,
        updateMemory,
        deleteMemory,

        cadetRegFields,
        setCadetRegFields,
        cadetUsers,
        addCadetUser,
        updateCadetUser,
        deleteCadetUser,
        approveCadetApplicant,
        clearAllCadetUsers,
        activeCadetAuth,
        cadetLogin,
        cadetRegister,
        cadetLogout,

        honorEntries,
        addHonorEntry,
        updateHonorEntry,
        deleteHonorEntry,

        contactConfig,
        updateContactConfig,
        contactMessages,
        addContactMessage,
        markContactMessageRead,
        deleteContactMessage,

        isRecruitmentOpen,
        setIsRecruitmentOpen,
        recruitmentNoticeTitle,
        setRecruitmentNoticeTitle,
        recruitmentAnnouncement,
        updateRecruitmentAnnouncement,
        recruitmentConfig: memoizedRecruitmentConfig,
        recruitmentFormFields,
        setRecruitmentFormFields,
        recruitmentFields: recruitmentFormFields,
        setRecruitmentFields: setRecruitmentFormFields,
        recruitmentApplicants,
        applicants: recruitmentApplicants,
        addRecruitmentApplicant,
        addApplicant: (applicant: any) => addRecruitmentApplicant(applicant),
        updateApplicantStatus,
        updateRecruitmentApplicant,
        deleteRecruitmentApplicant,
        deleteApplicant: (id: string) => deleteRecruitmentApplicant(id),
        exportApplicantsToExcel,
        recruitmentSignatories,
        updateRecruitmentSignatories,
        resetRecruitmentSignatories,

        syncCadetsWithSupabase,
        isSupabaseActive: isSupabaseConfigured(),

        cadetAccounts: cadetUsers,
        addCadetAccount: (account: any) => addCadetUser(account),
        cadetCornerModules: DEFAULT_CADET_CORNER_MODULES,

        rankHierarchy: cadetRanks,

        customFormTitle: "Platoon Training & Event Enrollment",
        customFormDescription: "Please provide your cadet details to register for the designated event or parade session.",
        customFormFields: trainingFormFields,
        addCustomSubmission: (sub: any) => addTrainingSubmission(sub),

        footerConfig,
        updateFooterConfig,

        resetAllToDefault,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
};

