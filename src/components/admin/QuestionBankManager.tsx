/**
 * TRUSTGRID.AI - ONLINE PSYCHOMETRIC ASSESSMENT PLATFORM
 * QuestionBankManager.tsx - Question Bank Management, CSV Bulk Import & Question Authoring
 */

import React, { useState } from 'react';
import { QuestionBankItem, DifficultyLevel, AssessmentType } from '../../types';
import { ApiService } from '../../services/apiService';
import {
  Sliders,
  Plus,
  Trash2,
  Edit,
  Download,
  Upload,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  BrainCircuit,
  ShieldCheck,
  Filter
} from 'lucide-react';

export const QuestionBankManager: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionBankItem[]>(() => ApiService.getQuestionBank());
  const [selectedAssessment, setSelectedAssessment] = useState<string>('ALL');
  const [selectedSet, setSelectedSet] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Edit / Create Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionBankItem | null>(null);

  // Form State
  const [formAssessmentId, setFormAssessmentId] = useState('ASM_APTITUDE');
  const [formSectionName, setFormSectionName] = useState('Numerical / Quantitative Aptitude');
  const [formQuestionText, setFormQuestionText] = useState('');
  const [formOptA, setFormOptA] = useState('');
  const [formOptB, setFormOptB] = useState('');
  const [formOptC, setFormOptC] = useState('');
  const [formOptD, setFormOptD] = useState('');
  const [formCorrectAnswer, setFormCorrectAnswer] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [formDifficulty, setFormDifficulty] = useState<DifficultyLevel>('MEDIUM');
  const [formExplanation, setFormExplanation] = useState('');
  const [formPassageText, setFormPassageText] = useState('');
  const [formSituationText, setFormSituationText] = useState('');

  // CSV Import State
  const [importStatus, setImportStatus] = useState<{ imported: number; errors: string[] } | null>(null);

  // Filtered Questions
  const filteredQuestions = questions.filter(q => {
    const matchesAsm = selectedAssessment === 'ALL' || q.Assessment_ID === selectedAssessment;
    const matchesSet = selectedSet === 'ALL' || (q.Set_Code || 'SET_A') === selectedSet;
    const matchesDiff = selectedDifficulty === 'ALL' || q.Difficulty_Level === selectedDifficulty;
    const matchesSearch =
      q.Question_Text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.Section_Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.Question_ID.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAsm && matchesSet && matchesDiff && matchesSearch;
  });

  const handleOpenCreate = () => {
    setEditingQuestion(null);
    setFormAssessmentId('ASM_APTITUDE');
    setFormSectionName('Numerical / Quantitative Aptitude');
    setFormQuestionText('');
    setFormOptA('');
    setFormOptB('');
    setFormOptC('');
    setFormOptD('');
    setFormCorrectAnswer('A');
    setFormDifficulty('MEDIUM');
    setFormExplanation('');
    setFormPassageText('');
    setFormSituationText('');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (q: QuestionBankItem) => {
    setEditingQuestion(q);
    setFormAssessmentId(q.Assessment_ID);
    setFormSectionName(q.Section_Name);
    setFormQuestionText(q.Question_Text);
    setFormOptA(q.Option_A);
    setFormOptB(q.Option_B);
    setFormOptC(q.Option_C);
    setFormOptD(q.Option_D);
    setFormCorrectAnswer(q.Correct_Answer);
    setFormDifficulty(q.Difficulty_Level);
    setFormExplanation(q.Explanation || '');
    setFormPassageText(q.Passage_Text || '');
    setFormSituationText(q.Situation_Text || '');
    setIsEditorOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(`Are you sure you want to delete question ${id}?`)) {
      ApiService.deleteQuestion(id);
      setQuestions(questions.filter(q => q.Question_ID !== id));
    }
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestionText.trim() || !formOptA.trim() || !formOptB.trim()) return;

    if (editingQuestion) {
      const updated = ApiService.updateQuestion(editingQuestion.Question_ID, {
        Assessment_ID: formAssessmentId,
        Section_Name: formSectionName,
        Question_Text: formQuestionText.trim(),
        Option_A: formOptA.trim(),
        Option_B: formOptB.trim(),
        Option_C: formOptC.trim(),
        Option_D: formOptD.trim(),
        Correct_Answer: formCorrectAnswer,
        Difficulty_Level: formDifficulty,
        Explanation: formExplanation.trim(),
        Passage_Text: formPassageText.trim() || undefined,
        Situation_Text: formSituationText.trim() || undefined
      });
      setQuestions(questions.map(q => q.Question_ID === updated.Question_ID ? updated : q));
    } else {
      const newQ: QuestionBankItem = {
        Question_ID: `QUE_${Date.now()}_${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        Assessment_ID: formAssessmentId,
        Section_Name: formSectionName,
        Question_Text: formQuestionText.trim(),
        Option_A: formOptA.trim(),
        Option_B: formOptB.trim(),
        Option_C: formOptC.trim(),
        Option_D: formOptD.trim(),
        Correct_Answer: formCorrectAnswer,
        Marks: 1,
        Difficulty_Level: formDifficulty,
        Explanation: formExplanation.trim(),
        Question_Status: 'PUBLISHED',
        Passage_Text: formPassageText.trim() || undefined,
        Situation_Text: formSituationText.trim() || undefined
      };
      ApiService.createQuestion(newQ);
      setQuestions([...questions, newQ]);
    }

    setIsEditorOpen(false);
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = ['Question_ID', 'Assessment_ID', 'Section_Name', 'Question_Text', 'Option_A', 'Option_B', 'Option_C', 'Option_D', 'Correct_Answer', 'Marks', 'Difficulty_Level', 'Explanation'];
    const rows = filteredQuestions.map(q => [
      q.Question_ID,
      q.Assessment_ID,
      `"${q.Section_Name.replace(/"/g, '""')}"`,
      `"${q.Question_Text.replace(/"/g, '""')}"`,
      `"${q.Option_A.replace(/"/g, '""')}"`,
      `"${q.Option_B.replace(/"/g, '""')}"`,
      `"${q.Option_C.replace(/"/g, '""')}"`,
      `"${q.Option_D.replace(/"/g, '""')}"`,
      q.Correct_Answer,
      q.Marks,
      q.Difficulty_Level,
      `"${(q.Explanation || '').replace(/"/g, '""')}"`
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `question_bank_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import
  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        if (lines.length <= 1) {
          alert('CSV file is empty or only contains headers.');
          return;
        }

        const items: QuestionBankItem[] = [];
        // Skip header
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
          if (cols.length >= 8) {
            items.push({
              Question_ID: cols[0] || `QUE_IMP_${Date.now()}_${i}`,
              Assessment_ID: cols[1] || 'ASM_APTITUDE',
              Section_Name: cols[2] || 'Quantitative Aptitude',
              Question_Text: cols[3] || 'Sample Question Text',
              Option_A: cols[4] || 'Option A',
              Option_B: cols[5] || 'Option B',
              Option_C: cols[6] || 'Option C',
              Option_D: cols[7] || 'Option D',
              Correct_Answer: (cols[8] as any) || 'A',
              Marks: Number(cols[9]) || 1,
              Difficulty_Level: (cols[10] as any) || 'MEDIUM',
              Explanation: cols[11] || '',
              Question_Status: 'PUBLISHED'
            });
          }
        }

        const result = ApiService.bulkImportQuestions(items);
        setImportStatus(result);
        setQuestions(ApiService.getQuestionBank());
      } catch (err: any) {
        alert('Failed parsing CSV: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-900" />
            <h1 className="text-xl font-bold text-slate-900">Institutional Question Bank Manager</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Author, organize, export, and bulk-import standardized questions across the 3 assessments (Total in DB: {questions.length})
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Bulk CSV Import</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCsv}
              className="hidden"
            />
          </label>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Question</span>
          </button>
        </div>
      </div>

      {/* Import Status Alert */}
      {importStatus && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800 font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Successfully imported {importStatus.imported} questions into master question bank!</span>
          </div>
          <button onClick={() => setImportStatus(null)} className="text-emerald-900 hover:underline">Dismiss</button>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search questions, sections, IDs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <select
          value={selectedAssessment}
          onChange={e => setSelectedAssessment(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium text-slate-700"
        >
          <option value="ALL">All Assessments (270 Qs)</option>
          <option value="ASM_APTITUDE">Assessment 1: Aptitude (90 Qs)</option>
          <option value="ASM_COMPREHENSION">Assessment 2: Comprehension (90 Qs)</option>
          <option value="ASM_EI_SITUATIONAL">Assessment 3: EI & Situational (90 Qs)</option>
        </select>

        <select
          value={selectedSet}
          onChange={e => setSelectedSet(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-300 font-black text-slate-800 bg-white"
        >
          <option value="ALL">All Sets (SET A, B, C)</option>
          <option value="SET_A">SET A (90 Qs)</option>
          <option value="SET_B">SET B (90 Qs)</option>
          <option value="SET_C">SET C (90 Qs)</option>
        </select>

        <select
          value={selectedDifficulty}
          onChange={e => setSelectedDifficulty(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium text-slate-700"
        >
          <option value="ALL">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="DIFFICULT">Difficult</option>
        </select>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold">
          <span>Showing {filteredQuestions.length} Questions (GATE & CAT Standard)</span>
          <span>1 Mark per Question • Server-Authoritative Answer Key</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredQuestions.map(q => (
            <div key={q.Question_ID} className="p-5 hover:bg-slate-50/70 transition-colors space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    {q.Question_ID}
                  </span>
                  <span className="text-[10px] font-black text-purple-900 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
                    {q.Set_Code === 'SET_B' ? 'SET B' : q.Set_Code === 'SET_C' ? 'SET C' : 'SET A'}
                  </span>
                  <span className="text-[11px] font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                    {q.Assessment_ID.replace('ASM_', '')}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {q.Section_Name}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    q.Difficulty_Level === 'EASY'
                      ? 'bg-emerald-50 text-emerald-800'
                      : q.Difficulty_Level === 'MEDIUM'
                      ? 'bg-blue-50 text-blue-800'
                      : 'bg-rose-50 text-rose-800'
                  }`}>
                    {q.Difficulty_Level}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleOpenEdit(q)}
                    className="p-1.5 text-slate-500 hover:text-blue-900 hover:bg-blue-50 rounded-lg"
                    title="Edit Question"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.Question_ID)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Delete Question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <p className="text-xs font-bold text-slate-900 leading-relaxed">
                {q.Question_Text}
              </p>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { key: 'A', text: q.Option_A },
                  { key: 'B', text: q.Option_B },
                  { key: 'C', text: q.Option_C },
                  { key: 'D', text: q.Option_D }
                ].map(opt => (
                  <div
                    key={opt.key}
                    className={`p-2.5 rounded-xl border text-[11px] flex items-start gap-2 ${
                      q.Correct_Answer === opt.key
                        ? 'border-emerald-300 bg-emerald-50/50 text-emerald-950 font-bold'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] flex-shrink-0 ${
                      q.Correct_Answer === opt.key ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {opt.key}
                    </span>
                    <span className="leading-tight">{opt.text}</span>
                  </div>
                ))}
              </div>

              {/* Explanation (Admin-Only) */}
              {q.Explanation && (
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700">Admin Key Explanation: </span>
                  <span>{q.Explanation}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* QUESTION EDITOR MODAL */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-extrabold text-slate-900">
              {editingQuestion ? 'Edit Standardized Question' : 'Author New Standardized Question'}
            </h3>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Assessment</label>
                  <select
                    value={formAssessmentId}
                    onChange={e => setFormAssessmentId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-semibold"
                  >
                    <option value="ASM_APTITUDE">Assessment 1: Aptitude</option>
                    <option value="ASM_COMPREHENSION">Assessment 2: Comprehension</option>
                    <option value="ASM_EI_SITUATIONAL">Assessment 3: EI & Situational</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Section / Subcategory Name</label>
                  <input
                    type="text"
                    required
                    value={formSectionName}
                    onChange={e => setFormSectionName(e.target.value)}
                    placeholder="e.g. Numerical / Quantitative Aptitude"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Optional Passage Text for Comprehension or Situation for EI */}
              {formAssessmentId === 'ASM_COMPREHENSION' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reading Passage Context (Optional)</label>
                  <textarea
                    rows={3}
                    value={formPassageText}
                    onChange={e => setFormPassageText(e.target.value)}
                    placeholder="Paste associated reading passage if applicable..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-normal"
                  />
                </div>
              )}

              {formAssessmentId === 'ASM_EI_SITUATIONAL' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Workplace Situation Scenario (Optional)</label>
                  <textarea
                    rows={3}
                    value={formSituationText}
                    onChange={e => setFormSituationText(e.target.value)}
                    placeholder="Paste associated workplace crisis or situational narrative..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-normal"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Question Prompt *</label>
                <textarea
                  rows={2}
                  required
                  value={formQuestionText}
                  onChange={e => setFormQuestionText(e.target.value)}
                  placeholder="Enter the complete question prompt..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              {/* Options A, B, C, D */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Option A *</label>
                  <input
                    type="text"
                    required
                    value={formOptA}
                    onChange={e => setFormOptA(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Option B *</label>
                  <input
                    type="text"
                    required
                    value={formOptB}
                    onChange={e => setFormOptB(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Option C *</label>
                  <input
                    type="text"
                    required
                    value={formOptC}
                    onChange={e => setFormOptC(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Option D *</label>
                  <input
                    type="text"
                    required
                    value={formOptD}
                    onChange={e => setFormOptD(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Correct Answer (Server Key)</label>
                  <select
                    value={formCorrectAnswer}
                    onChange={e => setFormCorrectAnswer(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-bold text-emerald-800 bg-emerald-50/50"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Difficulty Level</label>
                  <select
                    value={formDifficulty}
                    onChange={e => setFormDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-semibold"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="DIFFICULT">Difficult</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Explanation for Admin Review</label>
                <textarea
                  rows={2}
                  value={formExplanation}
                  onChange={e => setFormExplanation(e.target.value)}
                  placeholder="Rationale or derivation of the correct answer..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
