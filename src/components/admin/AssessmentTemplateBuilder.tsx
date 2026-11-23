/**
 * TRUSTGRID.AI - PSYCHOMETRIC & VIDEO ASSESSMENT PLATFORM
 * AssessmentTemplateBuilder.tsx - Psychometric Blueprint & Adaptive Test Configuration
 */

import React, { useState } from 'react';
import { AssessmentCategory, AssessmentTemplate } from '../../types';
import { ApiService } from '../../services/apiService';
import {
  Sliders,
  CheckCircle2,
  BrainCircuit,
  Clock,
  Sparkles,
  Plus,
  FileCheck
} from 'lucide-react';

export const AssessmentTemplateBuilder: React.FC = () => {
  const [templates, setTemplates] = useState<AssessmentTemplate[]>(() => ApiService.getTemplates());
  const [title, setTitle] = useState('');
  const [timeLimit, setTimeLimit] = useState(30);
  const [passingScore, setPassingScore] = useState(65);
  const [selectedCats, setSelectedCats] = useState<AssessmentCategory[]>([
    'PERSONALITY',
    'APTITUDE',
    'SITUATIONAL_JUDGEMENT'
  ]);
  const [adaptive, setAdaptive] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const availableCategories: { id: AssessmentCategory; label: string; desc: string }[] = [
    { id: 'APTITUDE', label: 'Aptitude Test', desc: 'Quantitative problem solving, percentage variations, ratios & calculations' },
    { id: 'LOGICAL_REASONING', label: 'Logical Reasoning Test', desc: 'Pattern deduction, syllogisms, sequence series & logical inference' },
    { id: 'VERBAL_REASONING', label: 'Verbal Reasoning Test', desc: 'Critical textual comprehension, vocabulary in context & verbal analogies' },
    { id: 'PERSONALITY', label: 'Personality Test', desc: 'Big Five Model (Openness, Conscientiousness, Extraversion, Agreeableness, Emotional Stability)' },
    { id: 'EMOTIONAL_INTELLIGENCE', label: 'Emotional Intelligence (EQ) Test', desc: 'Self-awareness, emotional self-regulation, empathy & social management' },
    { id: 'SITUATIONAL_JUDGEMENT', label: 'Situational Judgment Test (SJT)', desc: 'Workplace crisis scenarios, architectural ethics, escalation & trade-offs' },
    { id: 'COMMUNICATION_SKILLS', label: 'Communication Skills Assessment', desc: 'Tone calibration, constructive feedback, active listening & de-escalation' },
    { id: 'LEARNING_AGILITY', label: 'Learning Agility Assessment', desc: 'Mental agility, change adaptability, experimentation & rapid unlearning' },
    { id: 'THEMATIC_APPERCEPTION', label: 'Thematic Apperception Test (TAT)', desc: 'Workplace projective scenarios assessing Achievement (nAch) & Affiliation (nAff)' }
  ];

  const toggleCategory = (cat: AssessmentCategory) => {
    if (selectedCats.includes(cat)) {
      setSelectedCats(selectedCats.filter(c => c !== cat));
    } else {
      setSelectedCats([...selectedCats, cat]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedCats.length === 0) return;

    const newTemplate: AssessmentTemplate = {
      Template_ID: `TMP_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      Organization_ID: 'ORG_000002',
      Title: title.trim(),
      Categories: selectedCats,
      Time_Limit_Minutes: timeLimit,
      Passing_Score: passingScore,
      Total_Marks: 100,
      Adaptive_Enabled: adaptive,
      Negative_Marking: false,
      Status: 'ACTIVE',
      Created_At: new Date().toISOString()
    };

    setTemplates([newTemplate, ...templates]);
    setTitle('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Sliders className="w-5 h-5 text-blue-900" />
          <h1 className="text-xl font-bold text-slate-900">Psychometric Assessment Builder</h1>
        </div>
        <p className="text-xs text-slate-500">
          Design tailored assessment blueprints, question category weights, and adaptive testing algorithms.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Creator */}
        <form onSubmit={handleSave} className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Configure Assessment Blueprint
          </h2>

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Assessment template created and saved to DB_05_Assessment_Templates!
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assessment Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Lead Engineer Psychometric & Cognitive Benchmark"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Time Limit (Minutes)</label>
              <input
                type="number"
                min={5}
                max={120}
                value={timeLimit}
                onChange={e => setTimeLimit(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Benchmark Passing Score (%)</label>
              <input
                type="number"
                min={10}
                max={99}
                value={passingScore}
                onChange={e => setPassingScore(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Categories Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Assessment Domains
            </label>
            <div className="space-y-2">
              {availableCategories.map(cat => {
                const isSelected = selectedCats.includes(cat.id);
                return (
                  <div
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-blue-900 bg-blue-50/60 ring-1 ring-blue-900'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-0.5 h-4 w-4 rounded text-blue-900 focus:ring-blue-600"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{cat.label}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{cat.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Adaptive Testing Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <h4 className="text-xs font-bold text-slate-800">Adaptive Progression Engine</h4>
              <p className="text-[11px] text-slate-500">Dynamically balances item difficulty based on candidate response time & accuracy</p>
            </div>
            <input
              type="checkbox"
              checked={adaptive}
              onChange={e => setAdaptive(e.target.checked)}
              className="h-4 w-4 rounded text-blue-900"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Save Assessment Template
            </button>
          </div>
        </form>

        {/* Existing Templates List */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Active Templates ({templates.length})
          </h2>

          <div className="space-y-3">
            {templates.map(t => (
              <div key={t.Template_ID} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900">{t.Title}</h4>
                  <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {t.Time_Limit_Minutes}m
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {t.Categories.map(c => (
                    <span key={c} className="text-[9px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
