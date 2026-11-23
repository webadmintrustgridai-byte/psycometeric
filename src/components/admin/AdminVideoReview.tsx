/**
 * TRUSTGRID.AI - ONLINE PSYCHOMETRIC ASSESSMENT PLATFORM
 * AdminVideoReview.tsx - AI & Candidate Video Profile Review Console (Part 16)
 */

import React, { useState } from 'react';
import { CandidateVideoProfile, Candidate } from '../../types';
import { ApiService } from '../../services/apiService';
import {
  Video,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  Search,
  Download,
  AlertCircle
} from 'lucide-react';

export const AdminVideoReview: React.FC = () => {
  const [videos, setVideos] = useState<CandidateVideoProfile[]>(() => ApiService.getVideoProfiles());
  const candidates = ApiService.getCandidates();
  const [selectedVideo, setSelectedVideo] = useState<CandidateVideoProfile | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'REVIEWED' | 'REJECTED'>('REVIEWED');
  const [comments, setComments] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVideos = videos.filter(v => {
    const cand = candidates.find(c => c.Candidate_ID === v.Candidate_ID);
    const name = cand?.Full_Name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           v.Video_Title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           v.Candidate_ID.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleOpenReview = (v: CandidateVideoProfile) => {
    setSelectedVideo(v);
    setReviewStatus(v.Review_Status === 'REJECTED' ? 'REJECTED' : 'REVIEWED');
    setComments(v.Review_Comments || '');
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVideo) return;

    ApiService.reviewVideoProfile(
      selectedVideo.Video_ID,
      reviewStatus,
      comments.trim(),
      'USR_ADMIN_001'
    );

    setVideos(ApiService.getVideoProfiles());
    setSelectedVideo(null);
    alert('Candidate video review status and feedback updated successfully.');
  };

  const handleExportStatus = () => {
    const headers = ['Video_ID', 'Candidate_ID', 'Candidate_Name', 'Video_Title', 'Video_URL', 'Review_Status', 'Review_Comments', 'Submission_Date'];
    const rows = videos.map(v => {
      const c = candidates.find(cand => cand.Candidate_ID === v.Candidate_ID);
      return [
        v.Video_ID,
        v.Candidate_ID,
        `"${c?.Full_Name || 'Unknown'}"`,
        `"${v.Video_Title || 'Video'}"`,
        v.Video_URL,
        v.Review_Status,
        `"${(v.Review_Comments || '').replace(/"/g, '""')}"`,
        v.Submission_Date
      ].join(',');
    });

    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encoded = encodeURI(csv);
    const a = document.createElement('a');
    a.href = encoded;
    a.download = `video_submissions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-900" />
            <h1 className="text-xl font-bold text-slate-900">Candidate Video Profile Review Console</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Evaluate candidate self-presentations, technical project pitches, and communication fluency
          </p>
        </div>

        <button
          onClick={handleExportStatus}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Video Status</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm max-w-md">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search candidate name, video title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Video Submissions Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Candidate</th>
                <th className="py-3 px-4">Video Details</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Comments</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVideos.length > 0 ? (
                filteredVideos.map(v => {
                  const cand = candidates.find(c => c.Candidate_ID === v.Candidate_ID);
                  return (
                    <tr key={v.Video_ID} className="hover:bg-slate-50/70">
                      <td className="py-4 px-6">
                        <span className="font-extrabold text-slate-900 block">{cand?.Full_Name || v.Candidate_ID}</span>
                        <span className="text-[11px] text-slate-400 block font-mono">{v.Candidate_ID}</span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-800 block">{v.Video_Title}</span>
                        <a
                          href={v.Video_URL}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-blue-900 hover:underline inline-flex items-center gap-1 mt-0.5"
                        >
                          <span>Open Video Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                          v.Review_Status === 'REVIEWED'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {v.Review_Status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                        {v.Review_Comments || 'No reviewer comments yet.'}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleOpenReview(v)}
                          className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-sm"
                        >
                          Review & Rate
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-slate-400">
                    No video submissions found in system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REVIEW MODAL */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-5">
            <h3 className="text-base font-extrabold text-slate-900">
              Review Candidate Video Submission
            </h3>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
              <span className="font-bold text-slate-800 block">{selectedVideo.Video_Title}</span>
              <a
                href={selectedVideo.Video_URL}
                target="_blank"
                rel="noreferrer"
                className="text-blue-900 underline font-semibold flex items-center gap-1"
              >
                <span>Watch Video in External Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Evaluation Decision</label>
                <select
                  value={reviewStatus}
                  onChange={e => setReviewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-semibold"
                >
                  <option value="REVIEWED">Mark as Reviewed & Approved</option>
                  <option value="REJECTED">Mark as Incomplete / Resubmission Required</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Review Feedback & Articulation Notes</label>
                <textarea
                  rows={3}
                  required
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  placeholder="e.g. Excellent clarity on architectural tradeoff, concise delivery within 2 minutes."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedVideo(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
