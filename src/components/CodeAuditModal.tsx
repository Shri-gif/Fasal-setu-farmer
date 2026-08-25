import React, { useState } from 'react';
import { ShieldCheck, Bug, CheckCircle2, FileCode, AlertTriangle, X } from 'lucide-react';

interface CodeAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface IssueItem {
  file: string;
  type: 'Fatal Error' | 'Logic Bug' | 'Missing File' | 'Inconsistency';
  originalProblem: string;
  rootCause: string;
  solutionApplied: string;
}

const AUDITED_ISSUES: IssueItem[] = [
  {
    file: 'dashboard.html',
    type: 'Fatal Error',
    originalProblem: 'Uncaught SyntaxError: Cannot use import statement outside a module',
    rootCause: 'Loaded with <script src="js/dashboard.js"></script> without type="module", while dashboard.js uses ES module imports.',
    solutionApplied: 'Changed to <script type="module" src="js/dashboard.js"></script> and unified Supabase client imports.',
  },
  {
    file: 'earning.html / earnings.html',
    type: 'Missing File',
    originalProblem: 'Earnings page was loading dashboard.js and had no transactions, no filters, and wrong metric IDs.',
    rootCause: 'Line 249 was executing dashboard stats code instead of a dedicated earnings handler (js/earnings.js).',
    solutionApplied: 'Created dedicated js/earnings.js with full transaction parsing, date range filters (today, week, month), revenue calculator, and CSV export.',
  },
  {
    file: 'profile.js & profile.html',
    type: 'Logic Bug',
    originalProblem: 'Farm form was overwriting personal village data and completely ignoring farm size & farming type fields.',
    rootCause: 'setupFarmForm() grabbed IDs from profileForm (village, district, state) instead of farmForm and omitted farmSize and farmingType.',
    solutionApplied: 'Separated profileForm and farmForm data bindings, populated all 7 farmer schema fields correctly.',
  },
  {
    file: 'orders.js & orders.html',
    type: 'Logic Bug',
    originalProblem: 'Farmers could only view orders but had no way to transition status (Accept, Pack, Dispatch, Complete, Cancel).',
    rootCause: 'Static template string with missing interactive action dispatchers.',
    solutionApplied: 'Added full lifecycle dispatch buttons and order status transition handlers with instant database synchronization.',
  },
  {
    file: 'app.js & supabase.js',
    type: 'Inconsistency',
    originalProblem: 'Earnings page filename mismatch between app.js ("earnings.html") and dashboard.html links ("earning.html").',
    rootCause: 'Broken navigation links across multi-page redirects.',
    solutionApplied: 'Standardized route links and added cross-compatibility fallbacks for both file paths.',
  },
  {
    file: 'add-product.js',
    type: 'Logic Bug',
    originalProblem: 'Loading state disabled button but inner HTML mutations stripped the arrow span and reset editing flags.',
    rootCause: 'Direct innerHTML replacement without state preservation.',
    solutionApplied: 'Preserved editing state and button layout cleanly during async submit.',
  },
];

export const CodeAuditModal: React.FC<CodeAuditModalProps> = ({ isOpen, onClose }) => {
  const [selectedIssue, setSelectedIssue] = useState<IssueItem>(AUDITED_ISSUES[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">
              ✓
            </div>
            <div>
              <h2 className="font-bold text-base">Code Analysis & Bug Audit Report</h2>
              <p className="text-xs text-slate-400">All 6 files analyzed and corrected to error-free state</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AUDITED_ISSUES.map((issue, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedIssue(issue)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  selectedIssue.file === issue.file
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-emerald-700" />
                    {issue.file}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      issue.type === 'Fatal Error'
                        ? 'bg-rose-100 text-rose-800'
                        : issue.type === 'Missing File'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {issue.type}
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {issue.originalProblem}
                </p>
              </div>
            ))}
          </div>

          {/* Detailed Resolution Card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Bug className="w-4 h-4 text-rose-600" />
              <span>Issue Details for {selectedIssue.file}</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                <span className="font-bold block mb-0.5">Symptom / Error:</span>
                {selectedIssue.originalProblem}
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                <span className="font-bold block mb-0.5">Root Cause:</span>
                {selectedIssue.rootCause}
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                <span className="font-bold block mb-0.5 text-emerald-900 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Resolution Applied:
                </span>
                {selectedIssue.solutionApplied}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
