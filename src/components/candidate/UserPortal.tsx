/**
 * TRUSTGRID.AI - ONLINE PSYCHOMETRIC ASSESSMENT PLATFORM
 * UserPortal.tsx - Complete Candidate Dashboard, Dynamic Academic Profile & 3 Assessment Modules
 */

import React, { useState, useEffect } from 'react';
import {
  Candidate,
  AssessmentMaster,
  AcademicProfileRecord,
  CandidateFullAcademicProfile,
  EntranceExamRecord,
  CandidateActivitiesRecord,
  AssessmentAssignment,
  AssessmentAttempt,
  CONSOLIDATED_ASSESSMENTS,
  AssessmentType
} from '../../types';
import { ApiService } from '../../services/apiService';
import { PsychometricTestStation } from './PsychometricTestStation';
import { ReportGenerator } from '../../services/reportGenerator';
import { RadarChart } from '../common/RadarChart';
import {
  User,
  GraduationCap,
  BrainCircuit,
  Award,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Download,
  BookOpen,
  FileText,
  Video,
  UploadCloud,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Info,
  Calendar,
  Lock,
  PlayCircle,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  Camera,
  FileCheck
} from 'lucide-react';

interface UserPortalProps {
  initialCandidate?: Candidate;
}

export const UserPortal: React.FC<UserPortalProps> = ({ initialCandidate }) => {
  const [candidate, setCandidate] = useState<Candidate>(() => {
    if (initialCandidate) return initialCandidate;
    const session = ApiService.getCurrentSession();
    if (session && session.candidateId) {
      const found = ApiService.getCandidateById(session.candidateId);
      if (found) return found;
    }
    const list = ApiService.getCandidates();
    if (list.length > 0) return list[0];
    return {
      Candidate_ID: 'CAN_PREVIEW_001',
      Organization_ID: 'ORG_000001',
      Registration_Date: new Date().toISOString(),
      Full_Name: 'Candidate Preview',
      Primary_Email: 'preview@candidate.internal',
      Secondary_Email: '',
      Email: 'preview@candidate.internal',
      Mobile_Number: '+91 98000 00000',
      WhatsApp_Number: '+91 98000 00000',
      Date_of_Birth: '2004-01-01',
      Gender: 'MALE',
      College_Name: 'Engineering Institute of Technology',
      Department: 'Computer Science and Engineering',
      Degree: 'B.Tech',
      Academic_Year: '4th Year',
      Current_Semester: 'Semester 7',
      College_ID_Number: 'COL-PREVIEW-01',
      Photograph_URL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      Registration_Status: 'APPROVED',
      Profile_Status: 'PROFILE_COMPLETED',
      Verification_Status: 'VERIFIED',
      Consent_Status: 'GRANTED',
      Record_Status: 'ACTIVE',
      Created_At: new Date().toISOString(),
      Updated_At: new Date().toISOString()
    };
  });

  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'ACADEMIC_PROFILE' | 'ACTIVITIES_DOCS' | 'VIDEO_PROFILE' | 'TEST_STATION' | 'RESULTS'>('DASHBOARD');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('ASM_APTITUDE');
  const [showInstructionsModal, setShowInstructionsModal] = useState<AssessmentMaster | null>(null);
  const [isSavedInDb, setIsSavedInDb] = useState(false);

  // Load candidate academic profile
  const academicRecords = ApiService.getAcademicProfiles(candidate?.Candidate_ID || '');
  const rec10 = academicRecords.find(a => a.Education_Level === '10TH');
  const rec12 = academicRecords.find(a => a.Education_Level === '12TH');
  const recCol = academicRecords.find(a => a.Education_Level === 'COLLEGE_SEMESTER');

  // Academic Profile Form State
  const [sslc10, setSslc10] = useState({
    schoolName: rec10?.School_or_College || 'National Public School',
    board: rec10?.Board_or_University || 'CBSE',
    passingYear: rec10?.Passing_Year || '2020',
    mathsMarks: rec10?.Mathematics_Marks || 95,
    scienceMarks: rec10?.Science_Marks || 92,
    englishMarks: rec10?.English_Marks || 90,
    totalMarks: rec10?.Total_Marks || 465,
    percentage: rec10?.Percentage || 93.0
  });

  const [hsc12, setHsc12] = useState({
    schoolName: rec12?.School_or_College || 'National Junior College',
    board: rec12?.Board_or_University || 'State Board',
    passingYear: rec12?.Passing_Year || '2022',
    mathsMarks: rec12?.Mathematics_Marks || 96,
    physicsMarks: rec12?.Physics_Marks || 94,
    chemistryMarks: rec12?.Chemistry_Marks || 90,
    mpcGroupMarks: 280,
    englishMarks: rec12?.English_Marks || 88,
    totalMarks: rec12?.Total_Marks || 468,
    percentage: rec12?.Percentage || 93.6
  });

  const [collegeSemesters, setCollegeSemesters] = useState<{
    semesterNumber: number;
    marks: number;
    maxMarks: number;
    cgpa: number;
  }[]>([
    { semesterNumber: 1, marks: 820, maxMarks: 1000, cgpa: 8.5 },
    { semesterNumber: 2, marks: 840, maxMarks: 1000, cgpa: 8.7 },
    { semesterNumber: 3, marks: 860, maxMarks: 1000, cgpa: 8.9 },
    { semesterNumber: 4, marks: 880, maxMarks: 1000, cgpa: 9.1 },
    { semesterNumber: 5, marks: 890, maxMarks: 1000, cgpa: 9.2 },
    { semesterNumber: 6, marks: 910, maxMarks: 1000, cgpa: 9.4 }
  ]);

  const [overallCGPA, setOverallCGPA] = useState<number>(recCol?.Overall_CGPA || 8.97);
  const [backlogs, setBacklogs] = useState<number>(recCol?.Backlogs || 0);
  const [arrearsHistory, setArrearsHistory] = useState<string>(recCol?.Arrears_History || 'Nil');

  // Entrance Exams State (JEE, BITSAT & GATE Score)
  const initialExams = ApiService.getEntranceExams(candidate?.Candidate_ID || '');
  const jeeInit = initialExams.find(e => e.Examination_Name === 'JEE_MAIN' || e.Examination_Name === 'JEE_ADVANCED');
  const bitsatInit = initialExams.find(e => e.Examination_Name === 'BITSAT');
  const gateInit = initialExams.find(e => e.Examination_Name === 'GATE');

  const [jeeScore, setJeeScore] = useState<string>(jeeInit?.Score ? String(jeeInit.Score) : '260');
  const [jeePercentile, setJeePercentile] = useState<string>(jeeInit?.Percentile ? String(jeeInit.Percentile) : '99.12');
  const [jeeRank, setJeeRank] = useState<string>(jeeInit?.Rank ? String(jeeInit.Rank) : '8420');

  const [bitsatScore, setBitsatScore] = useState<string>(bitsatInit?.Score ? String(bitsatInit.Score) : '342');
  const [bitsatPercentile, setBitsatPercentile] = useState<string>(bitsatInit?.Percentile ? String(bitsatInit.Percentile) : '98.8');
  const [bitsatRank, setBitsatRank] = useState<string>(bitsatInit?.Rank ? String(bitsatInit.Rank) : '2150');

  const [gateScore, setGateScore] = useState<string>(gateInit?.Score ? String(gateInit.Score) : '785');
  const [gatePercentile, setGatePercentile] = useState<string>(gateInit?.Percentile ? String(gateInit.Percentile) : '99.42');
  const [gateRank, setGateRank] = useState<string>(gateInit?.Rank ? String(gateInit.Rank) : '312');

  const [entranceExams, setEntranceExams] = useState<EntranceExamRecord[]>(initialExams);
  const [activities, setActivities] = useState<CandidateActivitiesRecord | undefined>(() => ApiService.getCandidateActivities(candidate?.Candidate_ID || ''));

  // Document Uploads State (CV / Resume, College ID, Certificates)
  const [cvUrlInput, setCvUrlInput] = useState('');
  const [collegeIdUrlInput, setCollegeIdUrlInput] = useState('');
  const [certUrlInput, setCertUrlInput] = useState('');

  // Video Profile state
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('Campus Technical Presentation');
  const [videoSubmissions, setVideoSubmissions] = useState(() => ApiService.getVideoProfiles(candidate?.Candidate_ID || ''));

  // Handlers for Profile Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && candidate) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Photo size exceeds 5MB campus limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoDataUrl = reader.result as string;
        const updated = ApiService.updateCandidate(candidate.Candidate_ID, { Photograph_URL: photoDataUrl });
        setCandidate(updated);
        alert('Profile photograph updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePromptPhotoUrl = () => {
    if (!candidate) return;
    const url = prompt('Enter Profile Photo Image URL:', candidate.Photograph_URL || '');
    if (url && url.trim()) {
      const updated = ApiService.updateCandidate(candidate.Candidate_ID, { Photograph_URL: url.trim() });
      setCandidate(updated);
      alert('Profile photo updated successfully!');
    }
  };

  // Handlers for CV / Resume Upload
  const handleCvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && candidate) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds the 10MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileUrl = reader.result as string;
        const updatedCand = ApiService.updateCandidate(candidate.Candidate_ID, { Resume_URL: fileUrl });
        setCandidate(updatedCand);
        ApiService.saveCandidateActivities(candidate.Candidate_ID, { Resume_URL: fileUrl });
        setActivities(prev => ({
          Activity_ID: prev?.Activity_ID || `ACT_${Date.now()}`,
          Candidate_ID: candidate.Candidate_ID,
          NCC_Participation: prev?.NCC_Participation || 'No',
          Sports_Activities: prev?.Sports_Activities || 'None',
          Extracurricular_Activities: prev?.Extracurricular_Activities || 'None',
          Achievements: prev?.Achievements || 'None',
          Resume_URL: fileUrl,
          College_ID_URL: prev?.College_ID_URL || '',
          Certificates_URL: prev?.Certificates_URL || ''
        }));
        alert('Curriculum Vitae (CV / Resume) uploaded and saved successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCvUrl = () => {
    if (!cvUrlInput.trim() || !candidate) return;
    const url = cvUrlInput.trim();
    const updatedCand = ApiService.updateCandidate(candidate.Candidate_ID, { Resume_URL: url });
    setCandidate(updatedCand);
    ApiService.saveCandidateActivities(candidate.Candidate_ID, { Resume_URL: url });
    setActivities(prev => ({
      Activity_ID: prev?.Activity_ID || `ACT_${Date.now()}`,
      Candidate_ID: candidate.Candidate_ID,
      NCC_Participation: prev?.NCC_Participation || 'No',
      Sports_Activities: prev?.Sports_Activities || 'None',
      Extracurricular_Activities: prev?.Extracurricular_Activities || 'None',
      Achievements: prev?.Achievements || 'None',
      Resume_URL: url,
      College_ID_URL: prev?.College_ID_URL || '',
      Certificates_URL: prev?.Certificates_URL || ''
    }));
    setCvUrlInput('');
    alert('CV link saved successfully!');
  };

  const handleCollegeIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && candidate) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileUrl = reader.result as string;
        ApiService.saveCandidateActivities(candidate.Candidate_ID, { College_ID_URL: fileUrl });
        setActivities(prev => ({
          Activity_ID: prev?.Activity_ID || `ACT_${Date.now()}`,
          Candidate_ID: candidate.Candidate_ID,
          NCC_Participation: prev?.NCC_Participation || 'No',
          Sports_Activities: prev?.Sports_Activities || 'None',
          Extracurricular_Activities: prev?.Extracurricular_Activities || 'None',
          Achievements: prev?.Achievements || 'None',
          Resume_URL: prev?.Resume_URL || candidate.Resume_URL || '',
          College_ID_URL: fileUrl,
          Certificates_URL: prev?.Certificates_URL || ''
        }));
        alert('College ID Card attached successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCollegeIdUrl = () => {
    if (!collegeIdUrlInput.trim() || !candidate) return;
    const url = collegeIdUrlInput.trim();
    ApiService.saveCandidateActivities(candidate.Candidate_ID, { College_ID_URL: url });
    setActivities(prev => ({
      Activity_ID: prev?.Activity_ID || `ACT_${Date.now()}`,
      Candidate_ID: candidate.Candidate_ID,
      NCC_Participation: prev?.NCC_Participation || 'No',
      Sports_Activities: prev?.Sports_Activities || 'None',
      Extracurricular_Activities: prev?.Extracurricular_Activities || 'None',
      Achievements: prev?.Achievements || 'None',
      Resume_URL: prev?.Resume_URL || candidate.Resume_URL || '',
      College_ID_URL: url,
      Certificates_URL: prev?.Certificates_URL || ''
    }));
    setCollegeIdUrlInput('');
    alert('College ID Card URL saved successfully!');
  };

  const handleCertificatesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && candidate) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileUrl = reader.result as string;
        ApiService.saveCandidateActivities(candidate.Candidate_ID, { Certificates_URL: fileUrl });
        setActivities(prev => ({
          Activity_ID: prev?.Activity_ID || `ACT_${Date.now()}`,
          Candidate_ID: candidate.Candidate_ID,
          NCC_Participation: prev?.NCC_Participation || 'No',
          Sports_Activities: prev?.Sports_Activities || 'None',
          Extracurricular_Activities: prev?.Extracurricular_Activities || 'None',
          Achievements: prev?.Achievements || 'None',
          Resume_URL: prev?.Resume_URL || candidate.Resume_URL || '',
          College_ID_URL: prev?.College_ID_URL || '',
          Certificates_URL: fileUrl
        }));
        alert('Certificates attached successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCertUrl = () => {
    if (!certUrlInput.trim() || !candidate) return;
    const url = certUrlInput.trim();
    ApiService.saveCandidateActivities(candidate.Candidate_ID, { Certificates_URL: url });
    setActivities(prev => ({
      Activity_ID: prev?.Activity_ID || `ACT_${Date.now()}`,
      Candidate_ID: candidate.Candidate_ID,
      NCC_Participation: prev?.NCC_Participation || 'No',
      Sports_Activities: prev?.Sports_Activities || 'None',
      Extracurricular_Activities: prev?.Extracurricular_Activities || 'None',
      Achievements: prev?.Achievements || 'None',
      Resume_URL: prev?.Resume_URL || candidate.Resume_URL || '',
      College_ID_URL: prev?.College_ID_URL || '',
      Certificates_URL: url
    }));
    setCertUrlInput('');
    alert('Certificates URL saved successfully!');
  };

  // Assignments & Attempts
  const assignments = ApiService.getAssignmentsForCandidate(candidate?.Candidate_ID || '');
  const attempts = ApiService.getAttempts().filter(a => a.Candidate_ID === candidate?.Candidate_ID);
  const assessmentMaster = ApiService.getAssessmentMaster();

  // Profile completion calculation
  const isPersonalComplete = Boolean(candidate?.Full_Name && candidate?.Primary_Email && candidate?.College_ID_Number);
  const isAcademicComplete = Boolean(rec10 && rec12);
  const isDocumentComplete = Boolean(candidate?.Resume_URL || activities?.Resume_URL);
  const isVideoComplete = videoSubmissions.length > 0;

  const completionPercent = Math.round(
    (Number(isPersonalComplete) * 25) +
    (Number(isAcademicComplete) * 25) +
    (Number(isDocumentComplete) * 25) +
    (Number(isVideoComplete) * 25)
  );

  const handleSaveAcademic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidate) return;

    // Recalculate average CGPA
    const avgCgpa = collegeSemesters.length > 0
      ? Math.round((collegeSemesters.reduce((acc, s) => acc + s.cgpa, 0) / collegeSemesters.length) * 100) / 100
      : overallCGPA;

    setOverallCGPA(avgCgpa);

    const fullProfile: CandidateFullAcademicProfile = {
      sslc10: {
        schoolName: sslc10.schoolName,
        board: sslc10.board,
        passingYear: sslc10.passingYear,
        mathsMarks: Number(sslc10.mathsMarks),
        scienceMarks: Number(sslc10.scienceMarks),
        englishMarks: Number(sslc10.englishMarks),
        totalMarks: Number(sslc10.totalMarks),
        percentage: Number(sslc10.percentage)
      },
      hsc12: {
        schoolName: hsc12.schoolName,
        board: hsc12.board,
        passingYear: hsc12.passingYear,
        mathsMarks: Number(hsc12.mathsMarks),
        physicsMarks: Number(hsc12.physicsMarks),
        chemistryMarks: Number(hsc12.chemistryMarks),
        mpcGroupMarks: Number(hsc12.mpcGroupMarks),
        englishMarks: Number(hsc12.englishMarks),
        totalMarks: Number(hsc12.totalMarks),
        percentage: Number(hsc12.percentage)
      },
      college: {
        collegeName: candidate.College_Name,
        degree: candidate.Degree,
        department: candidate.Department,
        academicYear: candidate.Academic_Year,
        currentSemester: candidate.Current_Semester,
        semesters: collegeSemesters,
        overallCGPA: avgCgpa,
        backlogs: Number(backlogs),
        arrearsHistory
      }
    };

    ApiService.saveFullAcademicProfile(candidate.Candidate_ID, fullProfile);

    // Save National Entrance Exams (JEE, BITSAT & GATE Score)
    const examsToSave: EntranceExamRecord[] = [];
    if (jeeScore) {
      examsToSave.push({
        Exam_Record_ID: jeeInit?.Exam_Record_ID || `ENT_JEE_${Date.now()}`,
        Candidate_ID: candidate.Candidate_ID,
        Examination_Name: 'JEE_MAIN',
        Examination_Year: '2022',
        Score: Number(jeeScore),
        Percentile: Number(jeePercentile),
        Rank: Number(jeeRank),
        Created_At: new Date().toISOString()
      });
    }
    if (bitsatScore) {
      examsToSave.push({
        Exam_Record_ID: bitsatInit?.Exam_Record_ID || `ENT_BIT_${Date.now()}`,
        Candidate_ID: candidate.Candidate_ID,
        Examination_Name: 'BITSAT',
        Examination_Year: '2022',
        Score: Number(bitsatScore),
        Percentile: Number(bitsatPercentile),
        Rank: Number(bitsatRank),
        Created_At: new Date().toISOString()
      });
    }
    if (gateScore) {
      examsToSave.push({
        Exam_Record_ID: gateInit?.Exam_Record_ID || `ENT_GATE_${Date.now()}`,
        Candidate_ID: candidate.Candidate_ID,
        Examination_Name: 'GATE',
        Examination_Year: '2025',
        Score: Number(gateScore),
        Percentile: Number(gatePercentile),
        Rank: Number(gateRank),
        Created_At: new Date().toISOString()
      });
    }
    ApiService.saveEntranceExams(candidate.Candidate_ID, examsToSave);
    setEntranceExams(examsToSave);

    setIsSavedInDb(true);
    setTimeout(() => setIsSavedInDb(false), 2500);
  };

  const handleAddSemester = () => {
    const nextNum = collegeSemesters.length + 1;
    setCollegeSemesters([...collegeSemesters, { semesterNumber: nextNum, marks: 850, maxMarks: 1000, cgpa: 8.5 }]);
  };

  const handleRemoveSemester = (idx: number) => {
    if (collegeSemesters.length <= 1) return;
    setCollegeSemesters(collegeSemesters.filter((_, i) => i !== idx));
  };

  const handleStartAssessmentClick = (asm: AssessmentMaster) => {
    if (!ApiService.isAssessmentLive(asm.Assessment_ID)) {
      alert('This assessment has not been started by the administrator yet. Access unlocks as soon as enabled by the administrator.');
      return;
    }
    setShowInstructionsModal(asm);
  };

  const handleConfirmStartAssessment = () => {
    if (!showInstructionsModal) return;
    setSelectedAssessmentId(showInstructionsModal.Assessment_ID);
    setShowInstructionsModal(null);
    setActiveTab('TEST_STATION');
  };

  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim() || !candidate) return;
    const submitted = ApiService.submitVideoProfile({
      candidateId: candidate.Candidate_ID,
      videoUrl: videoUrl.trim(),
      videoTitle: videoTitle.trim()
    });
    setVideoSubmissions([submitted, ...videoSubmissions]);
    setVideoUrl('');
    alert('Video profile submitted for technical review!');
  };

  // If candidate is actively taking an assessment
  if (activeTab === 'TEST_STATION') {
    return (
      <PsychometricTestStation
        candidate={candidate}
        assessmentId={selectedAssessmentId}
        onFinish={() => setActiveTab('DASHBOARD')}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Brand & Candidate Profile Hero Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <img
              src={candidate?.Photograph_URL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
              alt={candidate?.Full_Name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-900 shadow-md transition-all group-hover:brightness-75"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250';
              }}
            />
            <label
              htmlFor="candidate-photo-input"
              className="absolute inset-0 rounded-2xl bg-black/50 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-[9px] font-bold"
              title="Click to update Profile Photo"
            >
              <Camera className="w-4 h-4 mb-0.5" />
              <span>Change</span>
            </label>
            <input
              id="candidate-photo-input"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
              candidate?.Registration_Status === 'APPROVED' ? 'bg-emerald-500' : 'bg-amber-500'
            }`} />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-slate-900">{candidate?.Full_Name}</h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                {candidate?.Candidate_ID}
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-0.5">
              {candidate?.Degree} in {candidate?.Department} • {candidate?.College_Name}
            </p>

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {/* Registration Status Badge */}
              <span className={`px-2.5 py-0.5 rounded-xl text-[11px] font-bold flex items-center gap-1 ${
                candidate?.Registration_Status === 'APPROVED'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : candidate?.Registration_Status === 'REJECTED'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                {candidate?.Registration_Status === 'APPROVED' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span>Registration: {candidate?.Registration_Status.replace(/_/g, ' ')}</span>
              </span>

              {/* College ID */}
              <span className="text-[11px] text-slate-500 font-medium">
                Roll No: <span className="font-semibold text-slate-700">{candidate?.College_ID_Number}</span>
              </span>

              {/* Change Photo Link */}
              <button
                type="button"
                onClick={handlePromptPhotoUrl}
                className="text-[11px] font-semibold text-blue-900 hover:underline flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100"
                title="Paste Photo Image URL"
              >
                <Camera className="w-3 h-3 text-blue-700" />
                <span>Update Photo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Completion Meter */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 w-full md:w-56 flex-shrink-0">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-600">Profile Readiness</span>
            <span className="text-blue-900">{completionPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-900 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Academic: {isAcademicComplete ? '✓' : 'Pending'}</span>
            <span>Docs: {isDocumentComplete ? '✓' : 'Pending'}</span>
            <span>Video: {isVideoComplete ? '✓' : 'Pending'}</span>
          </div>
        </div>
      </div>

      {/* Candidate Subnav Tabs */}
      <div className="bg-white rounded-3xl p-2 border border-slate-200 shadow-sm flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'DASHBOARD'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Assessment Station</span>
          </button>

          <button
            onClick={() => setActiveTab('ACADEMIC_PROFILE')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'ACADEMIC_PROFILE'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Academic Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('ACTIVITIES_DOCS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'ACTIVITIES_DOCS'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>CV, Exams & Docs</span>
          </button>

          <button
            onClick={() => setActiveTab('VIDEO_PROFILE')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'VIDEO_PROFILE'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>AI Video Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('RESULTS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'RESULTS'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Official Report</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: MAIN DASHBOARD & THE 3 STANDARDIZED ASSESSMENTS
          ========================================================================= */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">
          
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Standardized Campus Assessments</h2>
              <p className="text-xs text-slate-500">Three mandatory modules • 30 Questions • 30 Marks each • Single attempt</p>
            </div>
          </div>

          {/* EXACTLY THREE CONSOLIDATED ASSESSMENT CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {assessmentMaster.map((asm) => {
              const assign = assignments.find(a => a.Assessment_ID === asm.Assessment_ID);
              const attempt = attempts.find(a => a.Assessment_ID === asm.Assessment_ID && a.Attempt_Status === 'COMPLETED');
              const inProgress = attempts.find(a => a.Assessment_ID === asm.Assessment_ID && a.Attempt_Status === 'IN_PROGRESS');
              const isLive = ApiService.isAssessmentLive(asm.Assessment_ID);

              // Determine Card Status Color
              let statusColor = 'border-slate-200 bg-white';
              let badgeColor = 'bg-slate-100 text-slate-600';
              let statusText = 'Waiting for Admin';
              let isClickable = false;

              if (attempt) {
                statusColor = 'border-emerald-300 bg-emerald-50/20';
                badgeColor = 'bg-emerald-100 text-emerald-800 border border-emerald-300';
                statusText = `Completed (${attempt.Score}/30)`;
              } else if (inProgress) {
                statusColor = 'border-amber-300 bg-amber-50/20';
                badgeColor = 'bg-amber-100 text-amber-800 border border-amber-300';
                statusText = 'In Progress';
                isClickable = true;
              } else if (isLive) {
                statusColor = 'border-emerald-400 bg-emerald-50/25';
                badgeColor = 'bg-emerald-100 text-emerald-800 border border-emerald-300';
                statusText = assign?.Retake_Approved ? 'Retake Authorized' : 'Live & Open to Everyone';
                isClickable = true;
              } else {
                statusColor = 'border-slate-200 bg-slate-50/60';
                badgeColor = 'bg-slate-100 text-slate-500 border border-slate-200';
                statusText = 'Not Started by Admin';
                isClickable = false;
              }

              return (
                <div
                  key={asm.Assessment_ID}
                  className={`rounded-3xl border p-6 flex flex-col justify-between shadow-sm transition-all hover:shadow-md ${statusColor}`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${badgeColor}`}>
                        {statusText}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-blue-900">
                        {asm.Assessment_Type === 'APTITUDE' ? (
                          <BrainCircuit className="w-4 h-4" />
                        ) : asm.Assessment_Type === 'COMPREHENSION' ? (
                          <BookOpen className="w-4 h-4" />
                        ) : (
                          <ShieldCheck className="w-4 h-4" />
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                        {asm.Assessment_Name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {asm.Assessment_Type === 'APTITUDE'
                          ? 'CAT-style aptitude covering Quantitative, Logical, Verbal, and Analytical reasoning.'
                          : asm.Assessment_Type === 'COMPREHENSION'
                          ? '3 reading passages with 10 questions each evaluating textual inference and analysis.'
                          : '6 realistic workplace situations with 5 questions each assessing EQ and situational judgment.'}
                      </p>
                    </div>

                    {/* Meta Specs */}
                    <div className="bg-white/80 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Date:</span>
                        <span className="font-semibold text-slate-800">{assign?.Scheduled_Date || 'Campus Lab Day'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> Duration:</span>
                        <span className="font-semibold text-slate-800">{asm.Duration_Minutes} Minutes</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-slate-400" /> Marks:</span>
                        <span className="font-semibold text-slate-800">{asm.Total_Questions} Qs • {asm.Total_Marks} Marks</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Button */}
                  <div className="pt-5 border-t border-slate-100 mt-4">
                    {attempt ? (
                      <button
                        onClick={() => setActiveTab('RESULTS')}
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <FileText className="w-4 h-4" />
                        <span>View Results</span>
                      </button>
                    ) : inProgress ? (
                      <button
                        onClick={() => handleStartAssessmentClick(asm)}
                        className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>Resume Assessment</span>
                      </button>
                    ) : isClickable ? (
                      <button
                        onClick={() => handleStartAssessmentClick(asm)}
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>Start Assessment</span>
                      </button>
                    ) : (
                      <div className="space-y-1">
                        <button
                          disabled
                          className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed flex items-center justify-center gap-1.5"
                        >
                          <Lock className="w-4 h-4" />
                          <span>Waiting for Admin to Start</span>
                        </button>
                        <p className="text-[10px] text-center text-slate-400">
                          Assessment unlocks once started by admin
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 2: DYNAMIC ACADEMIC PROFILE (10TH, 12TH, DYNAMIC SEMESTERS)
          ========================================================================= */}
      {activeTab === 'ACADEMIC_PROFILE' && (
        <form onSubmit={handleSaveAcademic} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Academic Credentials & Semester Ledger</h2>
              <p className="text-xs text-slate-500 mt-0.5">Mandatory academic profile for campus placement and comparative evaluation</p>
            </div>
            {isSavedInDb && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Academic Profile Synchronized</span>
              </span>
            )}
          </div>

          {/* Section 1: 10th Standard / SSLC */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-3 py-1 rounded-xl inline-block">
              1. 10th Standard / SSLC Marks (M / S / E: Mathematics, Science, English)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">School Name</label>
                <input
                  type="text"
                  value={sslc10.schoolName}
                  onChange={e => setSslc10({ ...sslc10, schoolName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Board</label>
                <input
                  type="text"
                  value={sslc10.board}
                  onChange={e => setSslc10({ ...sslc10, board: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Passing Year</label>
                <input
                  type="text"
                  value={sslc10.passingYear}
                  onChange={e => setSslc10({ ...sslc10, passingYear: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mathematics Marks</label>
                <input
                  type="number"
                  value={sslc10.mathsMarks}
                  onChange={e => setSslc10({ ...sslc10, mathsMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Science Marks</label>
                <input
                  type="number"
                  value={sslc10.scienceMarks}
                  onChange={e => setSslc10({ ...sslc10, scienceMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">English Marks</label>
                <input
                  type="number"
                  value={sslc10.englishMarks}
                  onChange={e => setSslc10({ ...sslc10, englishMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Overall 10th Percentage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={sslc10.percentage}
                  onChange={e => setSslc10({ ...sslc10, percentage: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: 12th Standard / HSC */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-3 py-1 rounded-xl inline-block">
              2. 12th Standard / HSC Marks (M / P / C / E: Mathematics, Physics, Chemistry, English)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Junior College / School Name</label>
                <input
                  type="text"
                  value={hsc12.schoolName}
                  onChange={e => setHsc12({ ...hsc12, schoolName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Board</label>
                <input
                  type="text"
                  value={hsc12.board}
                  onChange={e => setHsc12({ ...hsc12, board: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Passing Year</label>
                <input
                  type="text"
                  value={hsc12.passingYear}
                  onChange={e => setHsc12({ ...hsc12, passingYear: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mathematics Marks</label>
                <input
                  type="number"
                  value={hsc12.mathsMarks}
                  onChange={e => setHsc12({ ...hsc12, mathsMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Physics Marks</label>
                <input
                  type="number"
                  value={hsc12.physicsMarks}
                  onChange={e => setHsc12({ ...hsc12, physicsMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chemistry Marks</label>
                <input
                  type="number"
                  value={hsc12.chemistryMarks}
                  onChange={e => setHsc12({ ...hsc12, chemistryMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">English Marks</label>
                <input
                  type="number"
                  value={hsc12.englishMarks}
                  onChange={e => setHsc12({ ...hsc12, englishMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Overall 12th Percentage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={hsc12.percentage}
                  onChange={e => setHsc12({ ...hsc12, percentage: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Section 3: College Dynamic Semesters */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-3 py-1 rounded-xl inline-block">
                  3. College Degree Semester-wise Ledger
                </h3>
                <p className="text-xs text-slate-500 mt-1">Add all completed semesters according to your degree duration</p>
              </div>

              <button
                type="button"
                onClick={handleAddSemester}
                className="px-3.5 py-1.5 bg-blue-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm hover:bg-blue-800"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Semester</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {collegeSemesters.map((sem, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-blue-900 text-white text-xs font-bold flex items-center justify-center">
                      S{sem.semesterNumber}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-800">Semester {sem.semesterNumber}</span>
                      <span className="text-[11px] text-slate-400 block">Marks: {sem.marks} / {sem.maxMarks}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block">CGPA</label>
                      <input
                        type="number"
                        step="0.01"
                        max="10.0"
                        min="0"
                        value={sem.cgpa}
                        onChange={e => {
                          const updated = [...collegeSemesters];
                          updated[idx].cgpa = Number(e.target.value);
                          setCollegeSemesters(updated);
                        }}
                        className="w-16 px-2 py-1 text-xs font-bold rounded-lg border border-slate-300 text-center"
                      />
                    </div>
                    {collegeSemesters.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSemester(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Overall CGPA and Backlogs summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200">
                <span className="text-xs font-bold text-slate-600 block">Overall Cumulative CGPA (10-Point Scale)</span>
                <span className="text-2xl font-black text-blue-950 mt-1 block">
                  {collegeSemesters.length > 0
                    ? (collegeSemesters.reduce((acc, s) => acc + s.cgpa, 0) / collegeSemesters.length).toFixed(2)
                    : overallCGPA.toFixed(2)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Active Backlogs / Arrears</label>
                <input
                  type="number"
                  min="0"
                  value={backlogs}
                  onChange={e => setBacklogs(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Arrears History (Cleared)</label>
                <input
                  type="text"
                  value={arrearsHistory}
                  onChange={e => setArrearsHistory(e.target.value)}
                  placeholder="Nil or Cleared in 2nd attempt"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Section 4: National Competitive Entrance Examinations (JEE, BITSAT & GATE Score) */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 bg-purple-50 px-3 py-1 rounded-xl inline-block">
              4. National Entrance Examinations (JEE, BITSAT & GATE Score)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* JEE */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-bold text-xs text-slate-900 block">JEE Main / Advanced</span>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Score</label>
                  <input
                    type="number"
                    value={jeeScore}
                    onChange={e => setJeeScore(e.target.value)}
                    placeholder="e.g. 260"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Percentile (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={jeePercentile}
                    onChange={e => setJeePercentile(e.target.value)}
                    placeholder="e.g. 99.12"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 font-bold text-blue-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">All India Rank</label>
                  <input
                    type="number"
                    value={jeeRank}
                    onChange={e => setJeeRank(e.target.value)}
                    placeholder="e.g. 8420"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 font-bold"
                  />
                </div>
              </div>

              {/* BITSAT */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-bold text-xs text-slate-900 block">BITSAT</span>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Score</label>
                  <input
                    type="number"
                    value={bitsatScore}
                    onChange={e => setBitsatScore(e.target.value)}
                    placeholder="e.g. 342"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Percentile (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={bitsatPercentile}
                    onChange={e => setBitsatPercentile(e.target.value)}
                    placeholder="e.g. 98.8"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 font-bold text-blue-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Rank</label>
                  <input
                    type="number"
                    value={bitsatRank}
                    onChange={e => setBitsatRank(e.target.value)}
                    placeholder="e.g. 2150"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 font-bold"
                  />
                </div>
              </div>

              {/* GATE SCORE */}
              <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-purple-950 block">GATE Score</span>
                  <span className="text-[10px] bg-purple-200/80 text-purple-900 font-extrabold px-2 py-0.5 rounded-md">Graduate Exam</span>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-purple-900 mb-1">GATE Score (out of 1000)</label>
                  <input
                    type="number"
                    value={gateScore}
                    onChange={e => setGateScore(e.target.value)}
                    placeholder="e.g. 785"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-purple-300 font-black text-purple-950 focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-purple-900 mb-1">GATE Percentile (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={gatePercentile}
                    onChange={e => setGatePercentile(e.target.value)}
                    placeholder="e.g. 99.42"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-purple-300 font-black text-purple-900 focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-purple-900 mb-1">All India Rank (AIR)</label>
                  <input
                    type="number"
                    value={gateRank}
                    onChange={e => setGateRank(e.target.value)}
                    placeholder="e.g. 312"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-purple-300 font-black text-purple-950 focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-900 text-white rounded-xl text-xs font-bold shadow-md hover:bg-blue-800 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Academic Credentials & Entrance Exam Scores</span>
            </button>
          </div>
        </form>
      )}

      {/* =========================================================================
          TAB 3: CURRICULUM VITAE (CV), ENTRANCE EXAMS & DOCUMENTS
          ========================================================================= */}
      {activeTab === 'ACTIVITIES_DOCS' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900">Curriculum Vitae (CV), Entrance Exams & Documents</h2>
            <p className="text-xs text-slate-500 mt-0.5">Upload your CV / Resume, Student ID, academic certifications, and competitive scores</p>
          </div>

          {/* Candidate Curriculum Vitae (CV) & Documents Upload */}
          <div className="space-y-4 p-6 bg-blue-50/50 rounded-3xl border border-blue-200/80">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-900" />
                  <span>Curriculum Vitae (CV / Resume) & Documents Upload</span>
                </h3>
                <p className="text-xs text-slate-500">Upload your updated CV (PDF), Student College ID, and Certificates for campus verification</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* CV / Resume Upload Card */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">1. Resume / CV (PDF)</span>
                  {candidate?.Resume_URL || activities?.Resume_URL ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ✓ Uploaded
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                      Required
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] text-slate-500">Upload PDF / Word File (Max 10MB)</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCvFileUpload}
                    className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-400">Or paste Cloud / Drive URL:</div>
                  <div className="flex gap-1.5">
                    <input
                      type="url"
                      value={cvUrlInput}
                      onChange={e => setCvUrlInput(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full px-2.5 py-1 text-xs rounded-xl border border-slate-300"
                    />
                    <button
                      type="button"
                      onClick={handleSaveCvUrl}
                      className="px-2.5 py-1 bg-blue-900 text-white rounded-xl text-xs font-bold hover:bg-blue-800"
                    >
                      Save
                    </button>
                  </div>
                </div>

                {(candidate?.Resume_URL || activities?.Resume_URL) && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-600 truncate max-w-[140px]">
                      Current CV Attached
                    </span>
                    <a
                      href={candidate?.Resume_URL || activities?.Resume_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-900 font-bold hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View CV</span>
                    </a>
                  </div>
                )}
              </div>

              {/* College ID Card Upload Card */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">2. College ID Card</span>
                  {activities?.College_ID_URL ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ✓ Attached
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      Optional
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] text-slate-500">Upload ID Card Image / PDF</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleCollegeIdUpload}
                    className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-400">Or paste Drive URL:</div>
                  <div className="flex gap-1.5">
                    <input
                      type="url"
                      value={collegeIdUrlInput}
                      onChange={e => setCollegeIdUrlInput(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full px-2.5 py-1 text-xs rounded-xl border border-slate-300"
                    />
                    <button
                      type="button"
                      onClick={handleSaveCollegeIdUrl}
                      className="px-2.5 py-1 bg-blue-900 text-white rounded-xl text-xs font-bold hover:bg-blue-800"
                    >
                      Save
                    </button>
                  </div>
                </div>

                {activities?.College_ID_URL && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-600">College ID Verified</span>
                    <a
                      href={activities.College_ID_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-900 font-bold hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Certificates Upload Card */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">3. Certifications & Scorecards</span>
                  {activities?.Certificates_URL ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ✓ Attached
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      Optional
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] text-slate-500">Upload PDF / Image</label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleCertificatesUpload}
                    className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-400">Or paste Drive URL:</div>
                  <div className="flex gap-1.5">
                    <input
                      type="url"
                      value={certUrlInput}
                      onChange={e => setCertUrlInput(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full px-2.5 py-1 text-xs rounded-xl border border-slate-300"
                    />
                    <button
                      type="button"
                      onClick={handleSaveCertUrl}
                      className="px-2.5 py-1 bg-blue-900 text-white rounded-xl text-xs font-bold hover:bg-blue-800"
                    >
                      Save
                    </button>
                  </div>
                </div>

                {activities?.Certificates_URL && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-600">Certificates Attached</span>
                    <a
                      href={activities.Certificates_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-900 font-bold hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Entrance Exams Summary */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Competitive Entrance Examinations</h3>
            {entranceExams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entranceExams.map(ex => (
                  <div key={ex.Exam_Record_ID} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs">{ex.Examination_Name.replace(/_/g, ' ')}</span>
                      <span className="text-[11px] font-mono text-slate-500">Year: {ex.Examination_Year}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Score</span>
                        <span className="font-bold text-slate-800">{ex.Score || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Percentile</span>
                        <span className="font-bold text-blue-900">{ex.Percentile ? `${ex.Percentile}%` : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Rank</span>
                        <span className="font-bold text-slate-800">{ex.Rank ? `#${ex.Rank}` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                No entrance examinations logged. Details can be updated in candidate registration settings.
              </div>
            )}
          </div>

          {/* Activities Summary */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Activities & Institutional Engagement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">NCC Participation</span>
                <p className="text-slate-600">{activities?.NCC_Participation || 'No participation recorded'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">Sports Activities</span>
                <p className="text-slate-600">{activities?.Sports_Activities || 'None recorded'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 md:col-span-2">
                <span className="font-bold text-slate-700 block mb-1">Honors & Achievements</span>
                <p className="text-slate-600">{activities?.Achievements || 'None recorded'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: AI VIDEO PROFILE SUBMISSION
          ========================================================================= */}
      {activeTab === 'VIDEO_PROFILE' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900">AI Video Profile & Technical Introduction</h2>
            <p className="text-xs text-slate-500 mt-0.5">Record or submit a 2-minute video pitch highlighting your technical projects and leadership skills</p>
          </div>

          <form onSubmit={handleVideoSubmit} className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Submit New Video Pitch</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Video Presentation Title</label>
                <input
                  type="text"
                  required
                  value={videoTitle}
                  onChange={e => setVideoTitle(e.target.value)}
                  placeholder="e.g. Distributed Systems Architecture Overview"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Video URL (Google Drive, Loom, YouTube or Cloud URL)</label>
                <input
                  type="url"
                  required
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/... or https://loom.com/..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                Videos are archived in Google Drive and evaluated for communication and structural articulation.
              </span>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-900 text-white text-xs font-bold rounded-xl shadow-md hover:bg-blue-800 transition-all flex items-center gap-1.5"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Submit Video</span>
              </button>
            </div>
          </form>

          {/* Submissions List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Archived Submissions</h3>
            {videoSubmissions.length > 0 ? (
              <div className="space-y-3">
                {videoSubmissions.map(v => (
                  <div key={v.Video_ID} className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{v.Video_Title}</h4>
                        <span className="text-[11px] text-slate-400 block font-mono">
                          Submitted on {new Date(v.Submission_Date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                        v.Review_Status === 'REVIEWED'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {v.Review_Status}
                      </span>
                      <a
                        href={v.Video_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-slate-500 hover:text-blue-900 rounded-lg hover:bg-slate-100"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                No video submission recorded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: OFFICIAL RESULTS & STEN RADAR
          ========================================================================= */}
      {activeTab === 'RESULTS' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Official Psychometric Assessment Summary</h2>
              <p className="text-xs text-slate-500 mt-0.5">Standardized STEN Normative Scale (Mean 5.5, SD 2.0)</p>
            </div>
            <button
              onClick={() => {
                const report = ApiService.getReports(candidate.Candidate_ID)[0] || {
                  Report_ID: `RPT_${candidate.Candidate_ID}`,
                  Candidate_ID: candidate.Candidate_ID,
                  Report_Type: 'PSYCHOMETRIC',
                  Composite_Score: 92,
                  Aptitude_Score: 94,
                  Strengths: ['High analytical and quantitative deduction', 'Strong empathy and de-escalation'],
                  Development_Areas: ['Further refine speed on non-linear data matrices'],
                  Created_At: new Date().toISOString()
                };
                ReportGenerator.generatePsychometricPdf(candidate, ApiService.getScores(candidate.Candidate_ID), report);
              }}
              className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md hover:bg-blue-800"
            >
              <Download className="w-4 h-4" />
              <span>Download Official PDF Report</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {assessmentMaster.map(asm => {
              const att = attempts.find(a => a.Assessment_ID === asm.Assessment_ID && a.Attempt_Status === 'COMPLETED');
              return (
                <div key={asm.Assessment_ID} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">{asm.Assessment_Type}</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900">
                      {att ? `${att.Score} / 30` : 'Not Taken'}
                    </span>
                    <span className="text-xs font-bold text-blue-900">
                      {att ? `${Math.round((att.Score / 30) * 100)}%` : '0%'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Status: {att ? 'Validated & Stored in Google Sheets' : 'Pending Attempt'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          INSTRUCTIONS & CONFIRMATION MODAL BEFORE STARTING ASSESSMENT
          ========================================================================= */}
      {showInstructionsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-900 text-white flex items-center justify-center shadow-md">
                <PlayCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{showInstructionsModal.Assessment_Name}</h3>
                <p className="text-xs text-slate-500">Supervised Campus Assessment Protocol</p>
              </div>
            </div>

            {/* Test Instructions */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs text-slate-700 leading-relaxed">
              <div className="font-bold text-slate-900">Mandatory Assessment Guidelines:</div>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Total Questions: <span className="font-semibold text-slate-900">30 Questions</span> (1 mark per question, Total: 30 marks).</li>
                <li>Duration: <span className="font-semibold text-slate-900">{showInstructionsModal.Duration_Minutes} Minutes</span>. The server timer starts immediately upon confirmation.</li>
                <li>Single Attempt Rule: Once initiated, retakes are strictly locked and can only be authorized by an administrator.</li>
                <li>Autosave Active: Responses synchronize automatically per question selection.</li>
                <li>Anti-Cheating Policy: Fullscreen is monitored, right-click/copying is disabled, and tab visibility changes will trigger audit warnings.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowInstructionsModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStartAssessment}
                className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Start Timer</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
