const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'context', 'AdminDataContext.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Replace localStorage.getItem
content = content.replace(/localStorage\.getItem\((['"])(.*?)\1\)/g, 'null /* localStorage removed */');

// 2. Replace localStorage.setItem(key, JSON.stringify(val))
content = content.replace(/localStorage\.setItem\((['"])(.*?)\1,\s*JSON\.stringify\((.*?)\)\);/g, 'upsertSiteSetting($1$2$1, $3);');

// 3. Replace localStorage.setItem(key, val) without JSON.stringify
content = content.replace(/localStorage\.setItem\((['"])(.*?)\1,\s*(.*?)\);/g, 'upsertSiteSetting($1$2$1, $3);');

// 4. Replace localStorage.clear()
content = content.replace(/localStorage\.clear\(\);/g, '// localStorage.clear() removed');

// 5. Add imports for upsertSiteSetting and fetchSiteSettings
if (!content.includes('fetchSiteSettings')) {
    content = content.replace(
        "import {",
        "import {\n  fetchSiteSettings,\n  upsertSiteSetting,"
    );
}

// 6. Add the initialization effect inside the AdminDataProvider component
// We need to find the start of the component.
// "export const AdminDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {"
const initEffect = `
  // --- Supabase Site Settings Initialization ---
  useEffect(() => {
    async function loadSettings() {
      const settings = await fetchSiteSettings();
      if (settings) {
        if (settings['ngdc_admin_service_pin']) setServicePin(settings['ngdc_admin_service_pin']);
        if (settings['ngdc_hero_slides']) setHeroSlides(settings['ngdc_hero_slides']);
        if (settings['ngdc_principal_message']) setPrincipalMessage(settings['ngdc_principal_message']);
        if (settings['ngdc_vice_principal_message']) setVicePrincipalMessage(settings['ngdc_vice_principal_message']);
        if (settings['ngdc_about_overview']) setAboutOverview(settings['ngdc_about_overview']);
        if (settings['ngdc_bncco1_message']) setBncco1Message(settings['ngdc_bncco1_message']);
        if (settings['ngdc_bncco2_message']) setBncco2Message(settings['ngdc_bncco2_message']);
        if (settings['ngdc_platoon_commander_message']) setPlatoonCommanderMessage(settings['ngdc_platoon_commander_message']);
        if (settings['ngdc_about_sections']) setAboutSections(settings['ngdc_about_sections']);
        if (settings['ngdc_cadet_ranks']) setCadetRanks(settings['ngdc_cadet_ranks']);
        if (settings['ngdc_trainings']) setTrainingAnnouncements(settings['ngdc_trainings']);
        if (settings['ngdc_training_form_fields']) setTrainingFormFields(settings['ngdc_training_form_fields']);
        if (settings['ngdc_training_submissions']) setTrainingSubmissions(settings['ngdc_training_submissions']);
        if (settings['ngdc_notices']) setNotices(settings['ngdc_notices']);
        if (settings['ngdc_blogs']) setBlogs(settings['ngdc_blogs']);
        if (settings['ngdc_memories']) setMemories(settings['ngdc_memories']);
        if (settings['ngdc_cadet_reg_fields']) setCadetRegFields(settings['ngdc_cadet_reg_fields']);
        // Ignore cadet_users_v8 as they are handled by Supabase direct table
        if (settings['ngdc_honor_entries_3cat']) setHonorEntries(settings['ngdc_honor_entries_3cat']);
        if (settings['ngdc_contact_config']) setContactConfig(settings['ngdc_contact_config']);
        if (settings['ngdc_contact_messages']) setContactMessages(settings['ngdc_contact_messages']);
        if (settings['ngdc_recruitment_open']) setIsRecruitmentOpen(settings['ngdc_recruitment_open'] === 'true');
        if (settings['ngdc_recruitment_announcement']) setRecruitmentAnnouncement(settings['ngdc_recruitment_announcement']);
        if (settings['ngdc_recruitment_title']) setRecruitmentNoticeTitle(settings['ngdc_recruitment_title']);
        if (settings['ngdc_recruitment_form_fields']) setRecruitmentFormFields(settings['ngdc_recruitment_form_fields']);
        if (settings['ngdc_recruitment_applicants']) setRecruitmentApplicants(settings['ngdc_recruitment_applicants']);
        if (settings['ngdc_recruitment_signatories']) setRecruitmentSignatories(settings['ngdc_recruitment_signatories']);
        if (settings['ngdc_footer_config']) setFooterConfig(settings['ngdc_footer_config']);
      }
    }
    loadSettings();
  }, []);
`;

const insertIndex = content.indexOf('const [servicePin, setServicePin]');
if (insertIndex !== -1 && !content.includes('loadSettings()')) {
    content = content.slice(0, insertIndex) + initEffect + '\n  ' + content.slice(insertIndex);
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully refactored AdminDataContext.tsx');
