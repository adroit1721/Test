export type TabType = 
  | 'home'
  | 'about'
  | 'training'
  | 'notices'
  | 'memories'
  | 'cadets'
  | 'honor'
  | 'contact'
  | 'recruitment';

export type AdminMenuKey =
  | 'home'
  | 'about'
  | 'training'
  | 'notices'
  | 'memories'
  | 'cadets'
  | 'honor'
  | 'contact'
  | 'recruitment'
  | 'footer';

export interface HeroSlide {
  id: string;
  imageUrl: string;
  badge: string;
  title: string;
  subtitle: string;
  altText: string;
  isActive?: boolean;
}

export interface ExecutiveMessageConfig {
  name: string;
  designation: string;
  subDesignation: string;
  quote: string;
  message: string;
  photoUrl: string;
  badge?: string;
  enabled?: boolean;
}

export interface AboutOverviewConfig {
  badge: string;
  title: string;
  subtitle: string;
  established: string;
  motto: string;
  content: string;
}

export interface NoticeItem {
  id: string;
  date: string;
  title: string;
  category: 'Camp' | 'Recruitment' | 'Uniform' | 'Competition' | 'Social' | 'Exam';
  priority?: 'high' | 'normal';
  author: string;
  summary: string;
  details: string;
  circularNo: string;
  pdfUrl?: string;
  isPinned?: boolean;
}

export interface BlogItem {
  id: string;
  title: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  category: 'Camp Experience' | 'Discipline' | 'Cadet Life' | 'Leadership' | 'Exam Preparation';
  summary: string;
  content: string[];
  imageUrl?: string;
  likes: number;
}

export interface MemoryItem {
  id: string;
  title: string;
  description: string;
  category: 'training' | 'parade' | 'relief' | 'awards';
  type?: 'image' | 'video' | string;
  imageUrl: string;
  altText: string;
  date: string;
  location: string;
  mediaType?: 'photo' | 'video';
  videoUrl?: string;
}

// 3 Categories for Honor Board:
// a. List Of Platoon Commanders
// b. List of BNCCO's
// c. List of Platoon Senior Cadets
// Fields: SL, Name, Designation, Tenure (dd/mm/yyyy to dd/mm/yyyy)
export type HonorCategoryKey = 'commanders' | 'bnccos' | 'seniors';

export interface HonorEntryItem {
  id: string;
  category: HonorCategoryKey;
  sl: number;
  name: string;
  designation: string;
  tenure: string; // e.g. "01/01/2018 to 31/12/2024"
  remarks?: string;
  badge?: string;
}

export interface HonorItem {
  id: string;
  name: string;
  designation: string;
  year: string;
  rank: string;
  achievement: string;
  award: string;
  imageUrl?: string;
  batch: string;
}

export interface TrainingRoutine {
  id: string;
  day: string;
  time: string;
  activity: string;
  instructor: string;
  venue: string;
  uniform: string;
}

export interface TrainingAnnouncement {
  id: string;
  title: string;
  category: 'Camp' | 'Parade' | 'Workshop' | 'Competition' | 'Special Drill';
  type?: 'training' | 'event' | string;
  day?: string;
  activity?: string;
  date: string;
  time: string;
  venue: string;
  instructor: string;
  uniform: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  description: string;
  hasRegistrationForm: boolean;
}

export interface PlatoonRoutineConfig {
  isPublished: boolean;
  title: string;
  effectiveDate: string;
  pdfUrl?: string;
  fileName?: string;
  instructions?: string;
  updatedAt?: string;
}

// Dynamic Custom Form Builder
export interface FormFieldConfig {
  id: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'tel' | 'select' | 'textarea' | 'date' | 'file';
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select dropdowns
  helpText?: string;
}

export interface CustomFormSubmission {
  id: string;
  formId?: string;
  formTitle?: string;
  submittedAt: string;
  data: Record<string, string>;
  submittedData?: Record<string, string>;
}

// Cadet Rank Hierarchy in About Us
export interface CadetRankHierarchyItem {
  id: string;
  rank: string;
  holderName: string;
  cadetNo?: string;
  image?: string;
  description: string;
  order: number;
}

// Custom About Section
export interface CustomAboutSection {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  badge?: string;
  iconName?: string;
}

// Cadet Account & Database
export type PlatoonCategory = 'Male Platoon' | 'Female Platoon' | 'Band Platoon' | 'Ex-cadets';
export type PlatoonSection = 'Platoon HQ' | 'Section 01' | 'Section 02' | 'Section 03' | 'Band HQ' | 'Band Section 01' | 'Band Section 02' | 'Ex-cadet Platoon' | 'General Roster';

export interface CadetUserAccount {
  id: string;
  cadetNo: string; // Login ID
  password: string; // Set by user during registration or admin
  name: string; // Full Name English
  nameBangla?: string; // Full Name Bangla
  fatherName?: string; // Father's Name English
  fatherNameBangla?: string; // Father's Name Bangla
  motherName?: string; // Mother's Name English
  motherNameBangla?: string; // Mother's Name Bangla
  dob?: string; // Date of Birth (ex. 10 Feb 2005)
  gender?: 'Male' | 'Female' | 'Others';
  religion?: 'Islam' | 'Hindu' | 'Christianity' | 'Buddhism' | string;
  className?: string; // 11th / 12th / Honours 1st year / Honours 2nd year
  category: PlatoonCategory; // 'Male Platoon' | 'Female Platoon' | 'Band Platoon' | 'Ex-cadets'
  section?: PlatoonSection | string;
  rank: string; // 'Cadet Under Officer (CUO)' | 'Cadet Sergeant (CDT SGT)' | 'Cadet Corporal (CPL)' | 'Lance Corporal (LCPL)' | 'Cadet (CDT)'
  appointment?: string;
  platoon: string;
  batch: string;
  collegeId: string;
  department: string;
  bloodGroup?: string;
  presentAddress?: string;
  permanentAddress?: string;
  phone: string; // Contact Number: Self
  guardianPhone?: string; // Contact Number: Guardian
  email?: string;
  currentJob?: string; // Current status/Job (for Ex-cadets Alumni)
  socialMedia?: string; // Social Media link/handle
  additionalSkills?: string;
  achievements?: string; // Achievements in BNCC
  joiningDate: string;
  attendancePercentage: number;
  paradesAttended: number;
  totalParades: number;
  campsAttended: string[];
  certificates: string[];
  status: 'Active' | 'Under Training' | 'Alumni' | 'Pending Approval';
  cadetType: 'Current' | 'Ex-cadet';
  isApproved: boolean;
  avatarUrl?: string;
  customFields?: Record<string, string>;
}

export interface CadetProfile {
  id: string;
  cadetNo: string;
  name: string;
  rank: string;
  platoon: string;
  batch: string;
  collegeId: string;
  department: string;
  bloodGroup: string;
  joiningDate: string;
  attendancePercentage: number;
  paradesAttended: number;
  totalParades: number;
  campsAttended: string[];
  certificates: string[];
  status: 'Active' | 'Under Training' | 'Alumni' | 'Pending Approval';
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  timestamp: string;
  isRead?: boolean;
}

export interface RecruitmentAnnouncementConfig {
  isActive: boolean;
  title: string;
  batch: string;
  academicSession?: string;
  deadline: string;
  startDate?: string;
  endDate?: string;
  venue: string;
  description: string;
  eligibilityCriteria: string[];
  headerImageUrl?: string;
  footerImageUrl?: string;
  footerText?: string;
}

export interface RecruitmentSignatoriesConfig {
  // Countersigned (PUO / Commander)
  countersignedName: string;
  countersignedPNo: string;
  countersignedBattalion: string;
  countersignedRegiment: string;
  countersignedTitle: string;
  countersignedInstitution: string;
  countersignedSignatureUrl?: string;

  // Signature of Platoon Senior Cadet
  seniorCadetRankAndName: string;
  seniorCadetNo: string;
  seniorCadetBattalion: string;
  seniorCadetRegiment: string;
  seniorCadetInstitution: string;
  seniorCadetSignatureUrl?: string;

  // Form Provider Title & Attachments
  formProviderTitle: string;
  attachments: string[];
}

export interface ApplicantQualification {
  examName: 'SSC' | 'HSC' | string;
  divisionOrGroup: string;
  passingYear: string;
  gpa: string;
  board: string;
}

export interface ApplicantAddress {
  division?: string;
  district: string;
  upazila: string;
  village: string;
  post: string;
}

export interface RecruitmentFormState {
  fullName: string;
  email: string;
  phone: string;
  collegeRoll: string;
  department: string;
  session: string;
  heightFeet: string;
  heightInches: string;
  weightKg: string;
  bloodGroup: string;
  reason: string;
  avatarUrl?: string;
  customData?: Record<string, any>;
  customAnswers?: Record<string, any>;

  // Official Admission Form Fields (Page 1 & 2)
  serialNo?: string;
  nameBangla?: string;
  nameEnglish?: string;
  fatherNameBangla?: string;
  fatherNameEnglish?: string;
  motherNameBangla?: string;
  motherNameEnglish?: string;
  gender?: 'Male' | 'Female' | 'Others' | string;
  studentClass?: '11th' | '12th' | 'Honours 1st year' | 'Honours 2nd year' | string;
  dateOfBirth?: string;
  religion?: string;
  presentAddress?: ApplicantAddress;
  permanentAddress?: ApplicantAddress;
  phoneSelf?: string;
  phoneGuardian?: string;
  qualifications?: ApplicantQualification[];
  chestNormal?: string;
  chestExpanded?: string;
  additionalSkills?: string;
  pledgeAccepted?: boolean;
  guardianConsentAccepted?: boolean;
}

export interface RecruitmentApplicant {
  id: string;
  token: string;
  fullName: string;
  email: string;
  phone: string;
  collegeRoll: string;
  department: string;
  session: string;
  heightFeet: string;
  heightInches: string;
  weightKg: string;
  bloodGroup: string;
  reason: string;
  status: 'Pending' | 'Shortlisted' | 'Selected' | 'Rejected';
  appliedAt: string;
  avatarUrl?: string;
  height?: string;
  weight?: string;
  customData?: Record<string, any>;
  customAnswers?: Record<string, any>;

  // Official Admission Form Fields (Page 1 & 2)
  serialNo?: string;
  nameBangla?: string;
  nameEnglish?: string;
  fatherNameBangla?: string;
  fatherNameEnglish?: string;
  motherNameBangla?: string;
  motherNameEnglish?: string;
  gender?: 'Male' | 'Female' | 'Others' | string;
  studentClass?: '11th' | '12th' | 'Honours 1st year' | 'Honours 2nd year' | string;
  dateOfBirth?: string;
  religion?: string;
  presentAddress?: ApplicantAddress;
  permanentAddress?: ApplicantAddress;
  phoneSelf?: string;
  phoneGuardian?: string;
  qualifications?: ApplicantQualification[];
  chestNormal?: string;
  chestExpanded?: string;
  additionalSkills?: string;
  pledgeAccepted?: boolean;
  guardianConsentAccepted?: boolean;
}

export interface ContactConfig {
  addressTitle: string;
  roomAndBuilding: string;
  fullAddress: string;
  phonePrimary: string;
  phoneSecondary: string;
  emailPrimary: string;
  emailSecondary?: string;
  officeHours: string;
  mapEmbedUrl?: string;
  address?: string;
  paradeHours?: string;
  email?: string;
  phone?: string;
}

export interface FooterConfig {
  hqTitle: string;
  roomDetails: string;
  locationDetails: string;
  phone: string;
  email: string;
  facebookUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
  linkedinUrl?: string;
  collegeOfficialUrl: string;
  bnccGovUrl: string;
  copyrightText: string;
  mottoText: string;
  aboutText?: string;
  emergencyPhone?: string;
}


