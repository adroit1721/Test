import React, { useState } from 'react';
import { useAdminData } from '../../../context/AdminDataContext';
import { TrainingAnnouncement, FormFieldConfig, PlatoonRoutineConfig } from '../../../types';
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Shield,
  FileCheck,
  ListPlus,
  FileText,
  Upload,
  Download,
  Eye,
  RefreshCw,
  Sparkles,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

const DEFAULT_TRAINING_FORM_FIELDS: FormFieldConfig[] = [
  { id: 'f-1', label: 'Cadet Number', type: 'text', placeholder: 'e.g. NGDC-2024-042', required: true },
  { id: 'f-2', label: 'Cadet Full Name', type: 'text', placeholder: 'Full Name as per College ID', required: true },
  { id: 'f-3', label: 'Cadet Rank', type: 'select', required: true, options: ['Cadet', 'Lance Corporal', 'Corporal', 'Sergeant', 'CSM', 'CUO'] },
  { id: 'f-4', label: 'Emergency Contact Mobile', type: 'tel', placeholder: '017XXXXXXXX', required: true },
  { id: 'f-5', label: 'Previous Camp Attended', type: 'text', placeholder: 'e.g. Winter Camp 2023', required: false },
  { id: 'f-6', label: 'Medical Fitness Confirmation', type: 'select', required: true, options: ['Fully Fit & Ready for Field Obstacles', 'Conditional / Minor Allergies'] },
];

export const TrainingTab: React.FC = () => {
  const {
    trainingAnnouncements,
    addTrainingAnnouncement,
    updateTrainingAnnouncement,
    deleteTrainingAnnouncement,
    trainingFormFields,
    setTrainingFormFields,
    trainingSubmissions,
    platoonRoutineConfig,
    updatePlatoonRoutineConfig,
  } = useAdminData();

  // Active subtab: 'announcements' | 'formBuilder' | 'submissions' | 'routine'
  const [activeSubtab, setActiveSubtab] = useState<'announcements' | 'formBuilder' | 'submissions' | 'routine'>('announcements');

  // Announcement Form Modal State
  const [isAddingAnn, setIsAddingAnn] = useState(false);
  const [editingAnn, setEditingAnn] = useState<TrainingAnnouncement | null>(null);
  const [annForm, setAnnForm] = useState<Omit<TrainingAnnouncement, 'id'>>({
    title: '',
    type: 'training',
    category: 'Camp',
    date: '',
    time: '',
    venue: '',
    instructor: '',
    uniform: '',
    status: 'Upcoming',
    description: '',
    hasRegistrationForm: true,
  });

  // Form Builder Field State
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<FormFieldConfig['type']>('text');
  const [newFieldRequired, setNewFieldRequired] = useState(true);
  const [newFieldOptions, setNewFieldOptions] = useState('');

  // Routine Subtab State
  const [routineForm, setRoutineForm] = useState<PlatoonRoutineConfig>({
    isPublished: platoonRoutineConfig?.isPublished ?? false,
    title: platoonRoutineConfig?.title || 'Official Annual Drill Routine & Operations Matrix',
    effectiveDate: platoonRoutineConfig?.effectiveDate || 'Autumn / Winter Cycle 2026',
    pdfUrl: platoonRoutineConfig?.pdfUrl || '',
    fileName: platoonRoutineConfig?.fileName || '',
    instructions: platoonRoutineConfig?.instructions || 'All cadets must report in authorized PT kit / Field Camouflage 15 minutes before parade assembly.',
    updatedAt: platoonRoutineConfig?.updatedAt || '',
  });
  const [routineSavedSuccess, setRoutineSavedSuccess] = useState(false);

  const handleStartAddAnn = () => {
    setAnnForm({
      title: 'Combined Annual Firing Practice 2026',
      type: 'event',
      category: 'Special Drill',
      date: '18 October 2026',
      time: '07:00 AM - 01:00 PM',
      venue: 'Rajshahi Cantonment Firing Range',
      instructor: 'Army Detachment BNCCO Team & PUO',
      uniform: 'Working Camouflage Dress with Cap',
      status: 'Upcoming',
      description: '.22 Bore standard zeroing and group classification shooting competition for select squad cadets.',
      hasRegistrationForm: true,
    });
    setEditingAnn(null);
    setIsAddingAnn(true);
  };

  const handleStartEditAnn = (ann: TrainingAnnouncement) => {
    setEditingAnn(ann);
    setAnnForm({
      title: ann.title || ann.activity || '',
      type: (ann.type as any) || (ann.category === 'Workshop' || ann.category === 'Competition' ? 'event' : 'training'),
      category: ann.category,
      date: ann.date || ann.day || '',
      time: ann.time,
      venue: ann.venue,
      instructor: ann.instructor,
      uniform: ann.uniform,
      status: ann.status,
      description: ann.description,
      hasRegistrationForm: ann.hasRegistrationForm ?? false,
    });
    setIsAddingAnn(false);
  };

  const handleSaveAnn = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...annForm,
      day: annForm.date,
      activity: annForm.title,
    };
    if (editingAnn) {
      updateTrainingAnnouncement(editingAnn.id, payload);
      setEditingAnn(null);
    } else {
      addTrainingAnnouncement(payload);
      setIsAddingAnn(false);
    }
  };

  // Field Add
  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldLabel.trim()) return;

    const newField: FormFieldConfig = {
      id: `fld-${Date.now()}`,
      label: newFieldLabel.trim(),
      type: newFieldType,
      required: newFieldRequired,
      placeholder: `Enter ${newFieldLabel.trim()}...`,
      options:
        newFieldType === 'select'
          ? (newFieldOptions || '')
              .split(',')
              .map((o) => o.trim())
              .filter(Boolean)
          : undefined,
    };

    setTrainingFormFields((prev) => [...prev, newField]);
    setNewFieldLabel('');
    setNewFieldOptions('');
  };

  const handleDeleteField = (id: string) => {
    setTrainingFormFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleResetFieldsToDefault = () => {
    if (confirm('Reset custom fields to default registration fields? Any existing custom fields will be replaced.')) {
      setTrainingFormFields(DEFAULT_TRAINING_FORM_FIELDS);
    }
  };

  // Routine File Upload
  const handleRoutinePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setRoutineForm((prev) => ({
          ...prev,
          pdfUrl: event.target!.result as string,
          fileName: file.name,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveRoutineConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlatoonRoutineConfig(routineForm);
    setRoutineSavedSuccess(true);
    setTimeout(() => setRoutineSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fcf9f3] dark:bg-[#1e1d19] p-6 rounded-3xl border border-[#cdc6b3]/50 dark:border-[#423e35] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#eedc82]/50 text-[#6b5e10] dark:text-[#eedc82]">
              <Calendar className="w-5 h-5" />
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
              Trainings & Events Control
            </h2>
          </div>
          <p className="text-xs md:text-sm text-[#695c4e] dark:text-[#aca596] mt-1">
            Publish drill announcements, manage custom form fields, and control the official Platoon Routine PDF.
          </p>
        </div>

        {/* 4 Subtabs */}
        <div className="flex flex-wrap items-center bg-[#f0eee8] dark:bg-[#141311] p-1 rounded-2xl border border-[#cdc6b3]/50 dark:border-[#423e35] gap-1">
          <button
            onClick={() => setActiveSubtab('announcements')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubtab === 'announcements'
                ? 'bg-[#eedc82] text-[#1c1c18] shadow-2xs'
                : 'text-[#695c4e] dark:text-[#aca596]'
            }`}
          >
            Announcements ({trainingAnnouncements.length})
          </button>
          <button
            onClick={() => setActiveSubtab('formBuilder')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubtab === 'formBuilder'
                ? 'bg-[#eedc82] text-[#1c1c18] shadow-2xs'
                : 'text-[#695c4e] dark:text-[#aca596]'
            }`}
          >
            Form Builder ({trainingFormFields.length} Fields)
          </button>
          <button
            onClick={() => setActiveSubtab('submissions')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubtab === 'submissions'
                ? 'bg-[#eedc82] text-[#1c1c18] shadow-2xs'
                : 'text-[#695c4e] dark:text-[#aca596]'
            }`}
          >
            Submissions ({trainingSubmissions.length})
          </button>
          <button
            onClick={() => setActiveSubtab('routine')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubtab === 'routine'
                ? 'bg-[#1c1c18] text-white shadow-2xs'
                : 'text-[#695c4e] dark:text-[#aca596]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#eedc82]" />
            <span>Routine PDF & Operations</span>
            {platoonRoutineConfig?.isPublished && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* SUBTAB 1: ANNOUNCEMENTS */}
      {activeSubtab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
                <span>Training & Event Schedules</span>
              </h3>
              <p className="text-xs text-[#7c7767] dark:text-[#aca596]">
                Announcements published here appear immediately in the public view.
              </p>
            </div>
            <button
              onClick={handleStartAddAnn}
              className="japandi-btn-primary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Announce Event / Training</span>
            </button>
          </div>

          {trainingAnnouncements.length === 0 ? (
            <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] rounded-3xl p-10 text-center space-y-3">
              <p className="text-xs text-[#7c7767]">No announcements published yet.</p>
              <button
                onClick={handleStartAddAnn}
                className="japandi-btn-primary text-xs py-2 px-4"
              >
                + Create First Announcement
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trainingAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          ann.type === 'event'
                            ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300'
                            : 'bg-[#eedc82]/40 text-[#6b5e10] dark:text-[#eedc82]'
                        }`}>
                          {ann.type === 'event' ? 'Platoon Event' : 'Training Session'}
                        </span>
                        <span className="text-[10px] font-bold text-[#7c7767] dark:text-[#aca596]">
                          • {ann.category}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ann.status === 'Upcoming'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                            : ann.status === 'Ongoing'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : 'bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                        }`}
                      >
                        {ann.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm md:text-base text-[#1c1c18] dark:text-[#fcfbf7] mt-2">
                      {ann.title || ann.activity}
                    </h4>
                    <p className="text-xs text-[#695c4e] dark:text-[#aca596] mt-1 line-clamp-2">
                      {ann.description}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#555042] dark:text-[#cdc6b3] bg-[#f6f3ed] dark:bg-[#141311] p-3 rounded-xl border border-[#cdc6b3]/30 dark:border-[#333]">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82] shrink-0" />
                      <span>{ann.date || ann.day} • {ann.time}</span>
                    </div>
                    {ann.venue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82] shrink-0" />
                        <span className="truncate">{ann.venue}</span>
                      </div>
                    )}
                    {ann.instructor && (
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82] shrink-0" />
                        <span className="truncate">Inst: {ann.instructor}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-[#cdc6b3]/30 dark:border-[#333] text-[11px]">
                      <span>Uniform: <strong>{ann.uniform || 'Authorized Dress'}</strong></span>
                      <span className="font-semibold text-[#6b5e10] dark:text-[#eedc82]">
                        {ann.hasRegistrationForm ? '✓ Registration Form Linked' : 'No Form'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#cdc6b3]/40 dark:border-[#423e35]">
                    <button
                      onClick={() => handleStartEditAnn(ann)}
                      className="japandi-btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3 text-[#6b5e10] dark:text-[#eedc82]" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete announcement "${ann.title || ann.activity}"?`)) {
                          deleteTrainingAnnouncement(ann.id);
                        }
                      }}
                      className="p-1 rounded-lg text-red-600 hover:bg-red-500/10 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: CUSTOM FORM BUILDER */}
      {activeSubtab === 'formBuilder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Fields List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
                  <ListPlus className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
                  <span>Configured Form Fields</span>
                </h3>
                <p className="text-xs text-[#7c7767] dark:text-[#aca596]">
                  Deletions and modifications persist permanently across page refreshes.
                </p>
              </div>

              <button
                onClick={handleResetFieldsToDefault}
                className="text-[11px] font-semibold text-[#695c4e] dark:text-[#aca596] hover:text-[#1c1c18] dark:hover:text-[#fcfbf7] flex items-center gap-1 bg-[#f0eee8] dark:bg-[#141311] px-2.5 py-1.5 rounded-xl border border-[#cdc6b3]/40 cursor-pointer"
                title="Restore default fields"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Restore Defaults</span>
              </button>
            </div>

            {trainingFormFields.length === 0 ? (
              <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-dashed border-[#cdc6b3] dark:border-[#423e35] p-8 rounded-3xl text-center space-y-2">
                <p className="text-xs text-[#7c7767] dark:text-[#aca596]">
                  No fields configured currently. Cadets will not see a registration form until you add at least one field.
                </p>
                <button
                  onClick={handleResetFieldsToDefault}
                  className="japandi-btn-secondary text-xs"
                >
                  Load 6 Standard Fields
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {trainingFormFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#eedc82]/40 text-[#6b5e10] font-mono font-bold text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs md:text-sm text-[#1c1c18] dark:text-[#fcfbf7]">
                            {field.label}
                          </h4>
                          {field.required && (
                            <span className="text-[10px] text-red-600 font-bold">*Required</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-[#7c7767] dark:text-[#aca596] font-mono mt-0.5">
                          <span className="uppercase bg-[#f0eee8] dark:bg-[#141311] px-1.5 py-0.5 rounded border border-[#cdc6b3]/40 dark:border-[#333]">
                            {field.type}
                          </span>
                          {field.options && (
                            <span>Options: {field.options.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteField(field.id)}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-500/10 cursor-pointer"
                      title="Permanently remove field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Add Field Control */}
          <div className="lg:col-span-5 bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] p-5 rounded-3xl space-y-4 shadow-2xs h-fit">
            <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] border-b border-[#cdc6b3]/50 dark:border-[#423e35] pb-2">
              Add Field to Custom Form
            </h4>

            <form onSubmit={handleAddField} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Field Label
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Blood Group or Firing Score"
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Field Input Type
                </label>
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as any)}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                >
                  <option value="text">Text (Single Line)</option>
                  <option value="number">Number</option>
                  <option value="tel">Phone / Mobile</option>
                  <option value="email">Email</option>
                  <option value="select">Dropdown Selection</option>
                  <option value="textarea">Textarea (Multi-line)</option>
                  <option value="date">Date</option>
                  <option value="file">File Attachment</option>
                </select>
              </div>

              {newFieldType === 'select' && (
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Dropdown Options (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Option 1, Option 2, Option 3"
                    value={newFieldOptions}
                    onChange={(e) => setNewFieldOptions(e.target.value)}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="fldReq"
                  checked={newFieldRequired}
                  onChange={(e) => setNewFieldRequired(e.target.checked)}
                  className="rounded text-[#6b5e10]"
                />
                <label htmlFor="fldReq" className="font-semibold text-[#1c1c18] dark:text-[#fcfbf7]">
                  Is this field required?
                </label>
              </div>

              <button
                type="submit"
                className="w-full japandi-btn-primary text-xs py-2.5 font-bold cursor-pointer mt-2"
              >
                + Append Field to Form
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUBTAB 3: FORM SUBMISSIONS */}
      {activeSubtab === 'submissions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#6b5e10] dark:text-[#eedc82]" />
              <span>Collected Cadet Form Submissions</span>
            </h3>
            <span className="text-xs font-mono text-[#7c7767]">
              Total Records: {trainingSubmissions.length}
            </span>
          </div>

          {trainingSubmissions.length === 0 ? (
            <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] rounded-3xl p-8 text-center text-xs text-[#7c7767]">
              No cadet submissions received yet. When cadets register through event forms, their records will display here.
            </div>
          ) : (
            <div className="space-y-3">
              {trainingSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/50 dark:border-[#423e35] p-4 rounded-2xl shadow-2xs space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-[#cdc6b3]/40 dark:border-[#333] pb-2">
                    <span className="font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                      {sub.formTitle || `Submission #${sub.id}`}
                    </span>
                    <span className="text-[#7c7767] font-mono">{sub.submittedAt}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(sub.data || (sub as any).submittedData || {}).map(([key, val]) => (
                      <div key={key} className="bg-[#f6f3ed] dark:bg-[#141311] p-2 rounded-xl">
                        <span className="text-[10px] text-[#7c7767] block">{key}</span>
                        <span className="font-semibold text-[#1c1c18] dark:text-[#fcfbf7] truncate block">
                          {String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 4: ROUTINE PDF & OPERATIONS */}
      {activeSubtab === 'routine' && (
        <div className="space-y-6">
          <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3]/60 dark:border-[#423e35] rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#cdc6b3]/50 dark:border-[#423e35] pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#1c1c18] dark:text-[#fcfbf7] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#6b5e10] dark:text-[#eedc82]" />
                  <span>Platoon Operations Routine & PDF Controller</span>
                </h3>
                <p className="text-xs text-[#695c4e] dark:text-[#aca596] mt-1">
                  Control the official Platoon Routine. When Published, the "Download PDF Routine" button and details will show in the public view. When unpublished or empty, nothing will show.
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  routineForm.isPublished
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${routineForm.isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span>{routineForm.isPublished ? 'Publicly Visible' : 'Hidden from Public'}</span>
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveRoutineConfig} className="space-y-5 text-xs">
              {/* Publication Switch */}
              <div className="p-4 bg-[#f6f3ed] dark:bg-[#141311] rounded-2xl border border-[#cdc6b3]/50 dark:border-[#333] flex items-center justify-between">
                <div className="space-y-0.5">
                  <label htmlFor="publishSwitch" className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7] cursor-pointer">
                    Publish Routine to Public View
                  </label>
                  <p className="text-[11px] text-[#695c4e] dark:text-[#aca596]">
                    If enabled, the Routine banner and "Download PDF Routine" button will be active in the public portal.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="publishSwitch"
                  checked={routineForm.isPublished}
                  onChange={(e) => setRoutineForm({ ...routineForm, isPublished: e.target.checked })}
                  className="w-5 h-5 rounded accent-[#6b5e10] cursor-pointer"
                />
              </div>

              {/* Title & Effective Period */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Routine Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Official Annual Drill Routine & Operations Matrix"
                    value={routineForm.title}
                    onChange={(e) => setRoutineForm({ ...routineForm, title: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Effective Session / Academic Period
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Autumn / Winter Session 2026-2027"
                    value={routineForm.effectiveDate}
                    onChange={(e) => setRoutineForm({ ...routineForm, effectiveDate: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
              </div>

              {/* Instructions / Notice */}
              <div>
                <label className="block font-bold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Assembly Notice & Cadet Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. All cadets must report in authorized PT kit / Field Camouflage 15 minutes before parade assembly."
                  value={routineForm.instructions || ''}
                  onChange={(e) => setRoutineForm({ ...routineForm, instructions: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2.5 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none resize-none"
                />
              </div>

              {/* PDF Document Upload */}
              <div className="p-4 bg-[#f6f3ed] dark:bg-[#141311] rounded-2xl border border-[#cdc6b3]/50 dark:border-[#333] space-y-3">
                <label className="block font-bold text-[#1c1c18] dark:text-[#fcfbf7]">
                  Official Routine PDF Document
                </label>
                <p className="text-[11px] text-[#695c4e] dark:text-[#aca596]">
                  Upload an official PDF schedule file or document. Cadets will download this file when clicking "Download PDF Routine".
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="japandi-btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-[#6b5e10] dark:text-[#eedc82]" />
                    <span>{routineForm.fileName ? 'Replace PDF File' : 'Upload Routine PDF'}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf"
                      onChange={handleRoutinePdfUpload}
                      className="hidden"
                    />
                  </label>

                  {routineForm.pdfUrl && (
                    <>
                      <a
                        href={routineForm.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#6b5e10] dark:text-[#eedc82] hover:underline flex items-center gap-1 font-bold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview Uploaded File ({routineForm.fileName || 'Routine.pdf'})</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => setRoutineForm({ ...routineForm, pdfUrl: '', fileName: '' })}
                        className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove File</span>
                      </button>
                    </>
                  )}
                </div>

                {routineForm.fileName && (
                  <div className="flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-300 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>File attached: {routineForm.fileName}</span>
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-between pt-2">
                {routineSavedSuccess ? (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Routine Configuration Saved & Published!</span>
                  </span>
                ) : <span />}

                <button
                  type="submit"
                  className="japandi-btn-primary text-xs py-2.5 px-6 font-bold cursor-pointer"
                >
                  Save Routine Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {(isAddingAnn || editingAnn) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#fcf9f3] dark:bg-[#1e1d19] border border-[#cdc6b3] dark:border-[#423e35] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#cdc6b3]/60 dark:border-[#423e35] pb-3">
              <h4 className="font-bold text-sm text-[#1c1c18] dark:text-[#fcfbf7]">
                {editingAnn ? 'Edit Training Announcement' : 'Announce Training or Platoon Event'}
              </h4>
              <button
                onClick={() => {
                  setIsAddingAnn(false);
                  setEditingAnn(null);
                }}
                className="text-[#7c7767] hover:text-[#1c1c18]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAnn} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Winter Training Camp"
                  value={annForm.title}
                  onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3.5 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold"
                />
              </div>

              {/* Type & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Announcement Type
                  </label>
                  <select
                    value={annForm.type || 'training'}
                    onChange={(e) => setAnnForm({ ...annForm, type: e.target.value as any })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold"
                  >
                    <option value="training">1. Training Session</option>
                    <option value="event">2. Platoon Event</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Category
                  </label>
                  <select
                    value={annForm.category}
                    onChange={(e) => setAnnForm({ ...annForm, category: e.target.value as any })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  >
                    <option value="Camp">Military Camp</option>
                    <option value="Parade">Squad Parade</option>
                    <option value="Workshop">Workshop / Lecture</option>
                    <option value="Competition">Firing / Drill Contest</option>
                    <option value="Special Drill">Special Drill</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Status
                  </label>
                  <select
                    value={annForm.status}
                    onChange={(e) => setAnnForm({ ...annForm, status: e.target.value as any })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none font-bold"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Authorized Uniform
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Service Dress / PT Kit"
                    value={annForm.uniform}
                    onChange={(e) => setAnnForm({ ...annForm, uniform: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15 Nov 2026 - 25 Nov 2026"
                    value={annForm.date}
                    onChange={(e) => setAnnForm({ ...annForm, date: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 06:30 AM - 10:00 AM"
                    value={annForm.time}
                    onChange={(e) => setAnnForm({ ...annForm, time: e.target.value })}
                    className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Venue / Location
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Main Parade Ground, NGDC"
                  value={annForm.venue}
                  onChange={(e) => setAnnForm({ ...annForm, venue: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Instructor In-Charge
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PUO Md. Abdul Matin"
                  value={annForm.instructor}
                  onChange={(e) => setAnnForm({ ...annForm, instructor: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1c1c18] dark:text-[#fcfbf7] mb-1">
                  Description / Event Brief
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide syllabus, prerequisites, or equipment to bring..."
                  value={annForm.description}
                  onChange={(e) => setAnnForm({ ...annForm, description: e.target.value })}
                  className="w-full bg-[#f6f3ed] dark:bg-[#141311] border border-[#cdc6b3] dark:border-[#423e35] px-3 py-2 rounded-xl text-[#1c1c18] dark:text-[#fcfbf7] outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="hasRegForm"
                  checked={annForm.hasRegistrationForm}
                  onChange={(e) => setAnnForm({ ...annForm, hasRegistrationForm: e.target.checked })}
                  className="rounded text-[#6b5e10]"
                />
                <label htmlFor="hasRegForm" className="font-semibold text-[#1c1c18] dark:text-[#fcfbf7]">
                  Attach Custom Cadet Registration Form to this announcement
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingAnn(false);
                    setEditingAnn(null);
                  }}
                  className="japandi-btn-secondary text-xs py-2 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="japandi-btn-primary text-xs py-2 px-4 font-bold"
                >
                  Save Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
