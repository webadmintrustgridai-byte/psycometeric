/**
 * TRUSTGRID.AI - PSYCHOMETRIC & VIDEO ASSESSMENT PLATFORM
 * CandidateRegistrationModal.tsx - Comprehensive Registration & Duplicate Prevention
 */

import React, { useState } from 'react';
import { Candidate } from '../../types';
import { ApiService } from '../../services/apiService';
import { X, UserPlus, AlertCircle, CheckCircle2, UploadCloud, ShieldCheck } from 'lucide-react';

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
  const [formData, setFormData] = useState({
    Full_Name: '',
    Email: '',
    Phone_Number: '',
    Location: '',
    Qualification: 'B.Tech in Computer Science',
    University: '',
    Graduation_Year: '2022',
    Total_Experience: '4 Years',
    Current_Organization: '',
    Current_Designation: '',
    Industry: 'Information Technology',
    Skills: '',
    LinkedIn_URL: '',
    Portfolio_URL: '',
    Resume_URL: '',
    Consent_Status: 'GRANTED' as 'GRANTED' | 'DECLINED'
  });

  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEmailBlur = () => {
    if (!formData.Email) return;
    const existing = ApiService.getCandidates().find(
      c => c.Email.toLowerCase() === formData.Email.trim().toLowerCase()
    );
    if (existing) {
      setDuplicateWarning(`A candidate record already exists with email ${formData.Email} (${existing.Candidate_ID} - ${existing.Full_Name}).`);
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.Full_Name.trim()) {
      setError('Full Name is required.');
      return;
    }
    if (!formData.Email.trim() || !formData.Email.includes('@')) {
      setError('A valid work or personal email address is required.');
      return;
    }
    if (formData.Consent_Status !== 'GRANTED') {
      setError('Candidate data processing consent is required by the DPDP privacy regulation.');
      return;
    }

    try {
      const created = ApiService.createCandidate(formData);
      onSuccess(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create candidate.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Register New Candidate</h2>
              <p className="text-xs text-slate-500">Creates an isolated candidate profile in the master database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {duplicateWarning && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>{duplicateWarning}</span>
            </div>
          )}

          {/* Core Personal Details */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">1. Personal & Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rostova"
                  value={formData.Full_Name}
                  onChange={e => setFormData({ ...formData, Full_Name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. elena@example.com"
                  value={formData.Email}
                  onBlur={handleEmailBlur}
                  onChange={e => setFormData({ ...formData, Email: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={formData.Phone_Number}
                  onChange={e => setFormData({ ...formData, Phone_Number: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru, India"
                  value={formData.Location}
                  onChange={e => setFormData({ ...formData, Location: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Experience & Professional Background */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">2. Professional Background</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Software Architect"
                  value={formData.Current_Designation}
                  onChange={e => setFormData({ ...formData, Current_Designation: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Organization</label>
                <input
                  type="text"
                  placeholder="e.g. Synthetix Systems"
                  value={formData.Current_Organization}
                  onChange={e => setFormData({ ...formData, Current_Organization: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Experience</label>
                <input
                  type="text"
                  placeholder="e.g. 5.5 Years"
                  value={formData.Total_Experience}
                  onChange={e => setFormData({ ...formData, Total_Experience: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Skills (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, Python, System Design"
                  value={formData.Skills}
                  onChange={e => setFormData({ ...formData, Skills: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Education & Links */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">3. Education & Portfolios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">University / College</label>
                <input
                  type="text"
                  placeholder="e.g. IIT Madras"
                  value={formData.University}
                  onChange={e => setFormData({ ...formData, University: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">LinkedIn Profile URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={formData.LinkedIn_URL}
                  onChange={e => setFormData({ ...formData, LinkedIn_URL: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* DPDP Consent */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="consentCheck"
                checked={formData.Consent_Status === 'GRANTED'}
                onChange={e => setFormData({ ...formData, Consent_Status: e.target.checked ? 'GRANTED' : 'DECLINED' })}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="consentCheck" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                <strong>Data Processing & Assessment Consent (DPDP Act Compliant):</strong> The candidate consents to the collection, psychometric evaluation, video recording, and competency reporting strictly for recruitment evaluation. Biometric facial/voice emotion inference is strictly prohibited.
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-md shadow-blue-900/20 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Candidate Record
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
