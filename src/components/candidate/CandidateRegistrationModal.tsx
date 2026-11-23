/**
 * TRUSTGRID.AI - ONLINE PSYCHOMETRIC ASSESSMENT PLATFORM
 * CandidateRegistrationModal.tsx - Comprehensive Registration & Document Upload
 */

import React, { useState } from 'react';
import { Candidate, RegistrationStatus } from '../../types';
import { ApiService } from '../../services/apiService';
import {
  X,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  UploadCloud,
  FileText,
  Award,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Calendar,
  Phone,
  Mail,
  Building,
  User
} from 'lucide-react';

interface CandidateRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (candidate: Candidate) => void;
}

export const CandidateRegistrationModal: React.FC<CandidateRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'EDUCATION' | 'ACTIVITIES' | 'ENTRANCE' | 'DOCUMENTS'>('PERSONAL');

  // Form State
  const [formData, setFormData] = useState({
    // Personal
    Full_Name: '',
    Primary_Email: '',
    Secondary_Email: '',
    Mobile_Number: '',
    WhatsApp_Number: '',
    Date_of_Birth: '2004-01-01',
    Gender: 'PREFER_NOT_TO_SAY' as 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY',
    Photograph_URL: '',
    // Education
    College_Name: '',
    Department: 'Computer Science and Engineering',
    Degree: 'B.Tech',
    Academic_Year: '4th Year',
    Current_Semester: 'Semester 7',
    College_ID_Number: '',
    // Activities
    NCC_Participation: 'No',
    Sports_Activities: '',
    Extracurricular_Activities: '',
    Leadership_Activities: '',
    Achievements: '',
    // Entrance Exams
    Entrance_Exam_Name: 'JEE_MAIN',
    Entrance_Exam_Year: '2022',
    Entrance_Exam_Score: '',
    Entrance_Exam_Percentile: '',
    Entrance_Exam_Rank: '',
    // Documents
    Resume_URL: '',
    College_ID_URL: '',
    Scorecard_URL: '',
    Certificates_URL: '',
    // Consent
    Consent_Status: 'GRANTED' as 'GRANTED' | 'DECLINED'
  });

  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleEmailBlur = () => {
    if (!formData.Primary_Email) return;
    const existing = ApiService.getCandidates().find(
      c => (c.Primary_Email && c.Primary_Email.toLowerCase() === formData.Primary_Email.trim().toLowerCase()) ||
           (c.Email && c.Email.toLowerCase() === formData.Primary_Email.trim().toLowerCase())
    );
    if (existing) {
      setDuplicateWarning(`A candidate record already exists with email ${formData.Primary_Email} (${existing.Candidate_ID} - ${existing.Full_Name}).`);
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleFileUploadMock = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds the 5MB campus upload limit.');
        return;
      }
      // Generate object URL for preview/Drive simulation
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, [field]: url }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.Full_Name.trim()) {
      setActiveTab('PERSONAL');
      setError('Full Name is required.');
      return;
    }
    if (!formData.Primary_Email.trim() || !formData.Primary_Email.includes('@')) {
      setActiveTab('PERSONAL');
      setError('A valid primary email address is required.');
      return;
    }
    if (!formData.College_Name.trim()) {
      setActiveTab('EDUCATION');
      setError('College Name is required.');
      return;
    }
    if (!formData.College_ID_Number.trim()) {
      setActiveTab('EDUCATION');
      setError('College ID Number is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create Candidate Record
      const createdCandidate = ApiService.createCandidate({
        Full_Name: formData.Full_Name.trim(),
        Primary_Email: formData.Primary_Email.trim(),
        Secondary_Email: formData.Secondary_Email.trim(),
        Email: formData.Primary_Email.trim(),
        Mobile_Number: formData.Mobile_Number.trim(),
        WhatsApp_Number: formData.WhatsApp_Number.trim() || formData.Mobile_Number.trim(),
        Date_of_Birth: formData.Date_of_Birth,
        Gender: formData.Gender,
        College_Name: formData.College_Name.trim(),
        Department: formData.Department.trim(),
        Degree: formData.Degree.trim(),
        Academic_Year: formData.Academic_Year,
        Current_Semester: formData.Current_Semester,
        College_ID_Number: formData.College_ID_Number.trim(),
        Photograph_URL: formData.Photograph_URL,
        Resume_URL: formData.Resume_URL,
        Registration_Status: 'APPROVED',
        Profile_Status: 'PROFILE_COMPLETED'
      });

      // 2. Save Activities Record
      ApiService.saveCandidateActivities(createdCandidate.Candidate_ID, {
        NCC_Participation: formData.NCC_Participation,
        Sports_Activities: formData.Sports_Activities,
        Extracurricular_Activities: formData.Extracurricular_Activities,
        Leadership_Activities: formData.Leadership_Activities,
        Achievements: formData.Achievements,
        Resume_URL: formData.Resume_URL,
        College_ID_URL: formData.College_ID_URL,
        Certificates_URL: formData.Certificates_URL
      });

      // 3. Save Entrance Exam Record if entered
      if (formData.Entrance_Exam_Score || formData.Entrance_Exam_Percentile || formData.Entrance_Exam_Rank) {
        ApiService.saveEntranceExams(createdCandidate.Candidate_ID, [
          {
            Exam_Record_ID: `ENT_${Date.now()}`,
            Candidate_ID: createdCandidate.Candidate_ID,
            Examination_Name: formData.Entrance_Exam_Name as any,
            Examination_Year: formData.Entrance_Exam_Year,
            Score: Number(formData.Entrance_Exam_Score) || undefined,
            Percentile: Number(formData.Entrance_Exam_Percentile) || undefined,
            Rank: Number(formData.Entrance_Exam_Rank) || undefined,
            Scorecard_URL: formData.Scorecard_URL
          }
        ]);
      }

      onSuccess(createdCandidate);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-900 text-white flex items-center justify-center shadow-sm">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Campus Candidate Registration</h2>
              <p className="text-xs text-slate-500">Official TRUSTGRID.AI Student Enrollment & Assessment Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-6 pt-2 overflow-x-auto gap-2">
          {[
            { id: 'PERSONAL', label: '1. Personal Info', icon: <User className="w-3.5 h-3.5" /> },
            { id: 'EDUCATION', label: '2. College & Degree', icon: <GraduationCap className="w-3.5 h-3.5" /> },
            { id: 'ACTIVITIES', label: '3. Activities & NCC', icon: <Award className="w-3.5 h-3.5" /> },
            { id: 'ENTRANCE', label: '4. Entrance Exams', icon: <BookOpen className="w-3.5 h-3.5" /> },
            { id: 'DOCUMENTS', label: '5. Document Uploads', icon: <UploadCloud className="w-3.5 h-3.5" /> }
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
                activeTab === t.id
                  ? 'border-blue-900 text-blue-900 bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-800 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {duplicateWarning && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2 text-amber-800 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{duplicateWarning}</span>
            </div>
          )}

          {/* TAB 1: PERSONAL INFORMATION */}
          {activeTab === 'PERSONAL' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.Full_Name}
                    onChange={e => setFormData({ ...formData, Full_Name: e.target.value })}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.Gender}
                    onChange={e => setFormData({ ...formData, Gender: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primary Email ID (Campus / Personal) *</label>
                  <input
                    type="email"
                    required
                    value={formData.Primary_Email}
                    onChange={e => setFormData({ ...formData, Primary_Email: e.target.value })}
                    onBlur={handleEmailBlur}
                    placeholder="student@college.edu or name@gmail.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Secondary / Alternate Email ID</label>
                  <input
                    type="email"
                    value={formData.Secondary_Email}
                    onChange={e => setFormData({ ...formData, Secondary_Email: e.target.value })}
                    placeholder="alternate@gmail.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Contact Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.Mobile_Number}
                    onChange={e => setFormData({ ...formData, Mobile_Number: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={formData.WhatsApp_Number}
                    onChange={e => setFormData({ ...formData, WhatsApp_Number: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.Date_of_Birth}
                    onChange={e => setFormData({ ...formData, Date_of_Birth: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Candidate Photo URL (or upload in Step 5)</label>
                  <input
                    type="url"
                    value={formData.Photograph_URL}
                    onChange={e => setFormData({ ...formData, Photograph_URL: e.target.value })}
                    placeholder="https://.../photo.jpg"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EDUCATION */}
          {activeTab === 'EDUCATION' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">College & Degree Enrollment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">College / Institute Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.College_Name}
                    onChange={e => setFormData({ ...formData, College_Name: e.target.value })}
                    placeholder="e.g. National Institute of Technology"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department / Branch *</label>
                  <input
                    type="text"
                    required
                    value={formData.Department}
                    onChange={e => setFormData({ ...formData, Department: e.target.value })}
                    placeholder="Computer Science & Engineering"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Degree Program *</label>
                  <select
                    value={formData.Degree}
                    onChange={e => setFormData({ ...formData, Degree: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="B.Tech">B.Tech / B.E.</option>
                    <option value="M.Tech">M.Tech / M.E.</option>
                    <option value="BCA">BCA</option>
                    <option value="MCA">MCA</option>
                    <option value="B.Sc">B.Sc Computer Science / IT</option>
                    <option value="M.Sc">M.Sc Computer Science / IT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Academic Year</label>
                  <select
                    value={formData.Academic_Year}
                    onChange={e => setFormData({ ...formData, Academic_Year: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year (Final Year)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Semester</label>
                  <select
                    value={formData.Current_Semester}
                    onChange={e => setFormData({ ...formData, Current_Semester: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                    <option value="Semester 5">Semester 5</option>
                    <option value="Semester 6">Semester 6</option>
                    <option value="Semester 7">Semester 7</option>
                    <option value="Semester 8">Semester 8</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">College ID Card Roll / Registration Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.College_ID_Number}
                    onChange={e => setFormData({ ...formData, College_ID_Number: e.target.value })}
                    placeholder="e.g. 2022-CSE-042 or 22BCE1042"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVITIES & ACHIEVEMENTS */}
          {activeTab === 'ACTIVITIES' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Activities, NCC & Achievements</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">NCC Participation</label>
                <input
                  type="text"
                  value={formData.NCC_Participation}
                  onChange={e => setFormData({ ...formData, NCC_Participation: e.target.value })}
                  placeholder="e.g. NCC 'B' Certificate - Senior Division Navy Wing (or 'No')"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sports Participation</label>
                <input
                  type="text"
                  value={formData.Sports_Activities}
                  onChange={e => setFormData({ ...formData, Sports_Activities: e.target.value })}
                  placeholder="e.g. College Badminton Team Captain, State Athletics 400m"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Extracurricular Activities</label>
                <textarea
                  rows={2}
                  value={formData.Extracurricular_Activities}
                  onChange={e => setFormData({ ...formData, Extracurricular_Activities: e.target.value })}
                  placeholder="e.g. Hackathon participant, cultural club lead, debating society"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Leadership Roles & Responsibilities</label>
                <input
                  type="text"
                  value={formData.Leadership_Activities}
                  onChange={e => setFormData({ ...formData, Leadership_Activities: e.target.value })}
                  placeholder="e.g. President of Coding Club, Class Representative"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Honors & Achievements</label>
                <textarea
                  rows={2}
                  value={formData.Achievements}
                  onChange={e => setFormData({ ...formData, Achievements: e.target.value })}
                  placeholder="e.g. Smart India Hackathon finalist, 1st place in Inter-College Robotics"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          )}

          {/* TAB 4: ENTRANCE EXAMINATIONS */}
          {activeTab === 'ENTRANCE' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Entrance Examinations Appeared</h3>
              <p className="text-xs text-slate-500">Provide details of national or state competitive examinations (JEE, BITSAT, CET, GATE).</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Examination Name</label>
                  <select
                    value={formData.Entrance_Exam_Name}
                    onChange={e => setFormData({ ...formData, Entrance_Exam_Name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="JEE_MAIN">JEE Main</option>
                    <option value="JEE_ADVANCED">JEE Advanced</option>
                    <option value="BITSAT">BITSAT</option>
                    <option value="STATE_CET">State CET / EAMCET / KCET</option>
                    <option value="GATE">GATE</option>
                    <option value="OTHER">Other National Examination</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Examination Year</label>
                  <input
                    type="text"
                    value={formData.Entrance_Exam_Year}
                    onChange={e => setFormData({ ...formData, Entrance_Exam_Year: e.target.value })}
                    placeholder="2022"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Raw Score (if known)</label>
                  <input
                    type="number"
                    value={formData.Entrance_Exam_Score}
                    onChange={e => setFormData({ ...formData, Entrance_Exam_Score: e.target.value })}
                    placeholder="e.g. 260"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Percentile</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.Entrance_Exam_Percentile}
                    onChange={e => setFormData({ ...formData, Entrance_Exam_Percentile: e.target.value })}
                    placeholder="e.g. 99.12"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">All India / State Rank</label>
                  <input
                    type="number"
                    value={formData.Entrance_Exam_Rank}
                    onChange={e => setFormData({ ...formData, Entrance_Exam_Rank: e.target.value })}
                    placeholder="e.g. 8420"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Scorecard Document URL / Drive Link</label>
                  <input
                    type="url"
                    value={formData.Scorecard_URL}
                    onChange={e => setFormData({ ...formData, Scorecard_URL: e.target.value })}
                    placeholder="https://.../scorecard.pdf"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DOCUMENT UPLOADS */}
          {activeTab === 'DOCUMENTS' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Document Uploads & Verification</h3>
              <p className="text-xs text-slate-500">Upload PDF or Image files (Max 5MB each). Files will be securely archived in the institutional cloud repository.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50/50">
                  <label className="block text-xs font-bold text-slate-800 mb-1">College ID Card Photo</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={e => handleFileUploadMock('College_ID_URL', e)}
                    className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100"
                  />
                  {formData.College_ID_URL && <p className="text-[11px] text-emerald-600 mt-1">✓ File selected</p>}
                </div>

                <div className="border border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50/50">
                  <label className="block text-xs font-bold text-slate-800 mb-1">Candidate Photograph</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleFileUploadMock('Photograph_URL', e)}
                    className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100"
                  />
                  {formData.Photograph_URL && <p className="text-[11px] text-emerald-600 mt-1">✓ Photograph selected</p>}
                </div>

                <div className="border border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50/50">
                  <label className="block text-xs font-bold text-slate-800 mb-1">Resume / CV (PDF)</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={e => handleFileUploadMock('Resume_URL', e)}
                    className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100"
                  />
                  {formData.Resume_URL && <p className="text-[11px] text-emerald-600 mt-1">✓ Resume selected</p>}
                </div>

                <div className="border border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50/50">
                  <label className="block text-xs font-bold text-slate-800 mb-1">Academic Certificates / Scorecards</label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={e => handleFileUploadMock('Certificates_URL', e)}
                    className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100"
                  />
                  {formData.Certificates_URL && <p className="text-[11px] text-emerald-600 mt-1">✓ Certificates selected</p>}
                </div>
              </div>

              {/* Data Privacy Declaration */}
              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-900 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 leading-relaxed">
                  <span className="font-bold text-blue-950">Campus Assessment Workflow:</span> Upon submission, your application will enter <span className="font-semibold text-amber-700">Pending Approval</span> status. Once reviewed and approved by the campus coordinator, your assessment schedule will activate on your dashboard.
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              {activeTab !== 'PERSONAL' && (
                <button
                  type="button"
                  onClick={() => {
                    const tabs: ('PERSONAL' | 'EDUCATION' | 'ACTIVITIES' | 'ENTRANCE' | 'DOCUMENTS')[] = ['PERSONAL', 'EDUCATION', 'ACTIVITIES', 'ENTRANCE', 'DOCUMENTS'];
                    const curIdx = tabs.indexOf(activeTab);
                    if (curIdx > 0) setActiveTab(tabs[curIdx - 1]);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl"
                >
                  Previous
                </button>
              )}

              {activeTab !== 'DOCUMENTS' ? (
                <button
                  type="button"
                  onClick={() => {
                    const tabs: ('PERSONAL' | 'EDUCATION' | 'ACTIVITIES' | 'ENTRANCE' | 'DOCUMENTS')[] = ['PERSONAL', 'EDUCATION', 'ACTIVITIES', 'ENTRANCE', 'DOCUMENTS'];
                    const curIdx = tabs.indexOf(activeTab);
                    if (curIdx < tabs.length - 1) setActiveTab(tabs[curIdx + 1]);
                  }}
                  className="px-5 py-2 text-xs font-bold bg-blue-900 text-white rounded-xl shadow-md hover:bg-blue-800"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting Registration...' : 'Submit Registration'}</span>
                </button>
              )}
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
