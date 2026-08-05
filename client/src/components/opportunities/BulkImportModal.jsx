import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUpload, FiFile, FiX, FiCheck, FiAlertCircle, FiDownload,
  FiChevronRight, FiLoader,
} from 'react-icons/fi';
import { HiOutlineDocumentText, HiOutlineTableCells } from 'react-icons/hi2';
import { MdOutlineCloudUpload } from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../../services/api';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmtBytes = (b) => {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(2)} MB`;
};

/** Quick client-side record counter (no full validation – just a count for preview) */
const countRecords = (file, text) => {
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'json') {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed.length;
      if (parsed.opportunities) return parsed.opportunities.length;
      if (parsed.data)          return parsed.data.length;
      return 1;
    } catch { return 0; }
  }
  if (ext === 'csv') {
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
      .filter((l) => l.trim().length > 0);
    return Math.max(0, lines.length - 1); // subtract header row
  }
  return 0;
};

// ── Sub-components ────────────────────────────────────────────────────────────
const STEPS = ['Reading File\u2026', 'Validating Records\u2026', 'Importing to MongoDB\u2026', 'Completed'];

const ProgressStepper = ({ step }) => (
  <div className="flex flex-col gap-3 w-full">
    {STEPS.map((label, i) => {
      const done    = i < step;
      const active  = i === step;
      const pending = i > step;
      return (
        <div key={label} className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
            done    ? 'bg-green-500 text-white'
            : active ? 'bg-blue-600 text-white animate-pulse'
            : 'bg-gray-100 dark:bg-slate-800 text-gray-400'
          }`}>
            {done ? (
              <FiCheck size={14} />
            ) : active ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <FiLoader size={14} />
              </motion.div>
            ) : (
              <span className="text-xs font-bold">{i + 1}</span>
            )}
          </div>
          <span className={`text-sm font-medium transition-colors ${
            done    ? 'text-green-600 dark:text-green-400 line-through opacity-60'
            : active ? 'text-blue-600 dark:text-blue-400'
            : pending ? 'text-gray-400 dark:text-gray-600'
            : ''
          }`}>
            {label}
          </span>
        </div>
      );
    })}
  </div>
);

const SummaryCard = ({ label, value, color }) => (
  <motion.div
    initial={{ scale: 0.85, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    className={`flex flex-col items-center justify-center p-4 rounded-2xl ${color} flex-1 min-w-[90px]`}
  >
    <span className="text-2xl font-extrabold">{value}</span>
    <span className="text-xs font-semibold opacity-75 mt-1 text-center leading-tight">{label}</span>
  </motion.div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const BulkImportModal = ({ isOpen, onClose, onImported }) => {
  const [phase,        setPhase]        = useState('upload');
  const [file,         setFile]         = useState(null);
  const [recordCount,  setRecordCount]  = useState(0);
  const [dragging,     setDragging]     = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [result,       setResult]       = useState(null);
  const [importing,    setImporting]    = useState(false);
  const inputRef = useRef();

  const reset = () => {
    setPhase('upload');
    setFile(null);
    setRecordCount(0);
    setDragging(false);
    setProgressStep(0);
    setResult(null);
    setImporting(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const ingestFile = useCallback((f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['json', 'csv'].includes(ext)) {
      toast.error('Only .json and .csv files are supported');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setRecordCount(countRecords(f, text));
      setFile(f);
      setPhase('preview');
    };
    reader.readAsText(f);
  }, []);

  const onDragOver  = (e) => { e.preventDefault(); setDragging(true);  };
  const onDragLeave = ()  => setDragging(false);
  const onDrop      = (e) => {
    e.preventDefault(); setDragging(false);
    ingestFile(e.dataTransfer.files[0]);
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setPhase('progress');

    const tick = (step, ms) => new Promise((r) => setTimeout(() => { setProgressStep(step); r(); }, ms));

    try {
      await tick(0, 300);
      await tick(1, 900);

      const formData = new FormData();
      formData.append('file', file);

      await tick(2, 500);

      const res = await api.post('/admin/opportunities/bulk-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });

      setProgressStep(3);
      setResult(res.data);
      setTimeout(() => setPhase('summary'), 600);
      onImported?.();
    } catch (err) {
      const msg = err.response?.data?.message || 'Import failed. Please check your file and try again.';
      toast.error(msg);
      reset();
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  const isCSV = file?.name?.toLowerCase().endsWith('.csv');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/70 px-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <MdOutlineCloudUpload className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">Bulk Import Opportunities</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Upload JSON or CSV — duplicates auto-skipped</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-white transition-all"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">

              {/* ── UPLOAD ── */}
              {phase === 'upload' && (
                <div>
                  <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all select-none ${
                      dragging
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 scale-[1.02]'
                        : 'border-gray-200 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-500 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <motion.div
                      animate={{ y: dragging ? -6 : 0 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/40 dark:to-indigo-900/40 flex items-center justify-center shadow-inner"
                    >
                      <FiUpload className="text-2xl text-violet-600 dark:text-violet-400" />
                    </motion.div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {dragging ? 'Drop it here!' : 'Drag & drop your file here'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">or click to browse</p>
                    </div>
                    <div className="flex gap-2 mt-1">
                      {['.json', '.csv'].map((ext) => (
                        <span key={ext} className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 font-mono font-semibold">{ext}</span>
                      ))}
                      <span className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500">max 20 MB</span>
                    </div>
                    <input
                      ref={inputRef}
                      type="file"
                      accept=".json,.csv"
                      className="hidden"
                      onChange={(e) => ingestFile(e.target.files[0])}
                    />
                  </div>

                  <div className="mt-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">Required fields per record</p>
                    <div className="flex flex-wrap gap-1.5">
                      {['title', 'companyName'].map((f) => (
                        <span key={f} className="text-xs px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-mono font-semibold">{f}</span>
                      ))}
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 opacity-80">All other fields are optional and will be auto-mapped.</p>
                  </div>
                </div>
              )}

              {/* ── PREVIEW ── */}
              {phase === 'preview' && file && (
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                    {isCSV
                      ? <HiOutlineTableCells className="text-green-500 text-2xl flex-shrink-0" />
                      : <HiOutlineDocumentText className="text-blue-500 text-2xl flex-shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{file.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{fmtBytes(file.size)}</p>
                    </div>
                    <button
                      onClick={reset}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-red-500 transition-all"
                      title="Remove file"
                    >
                      <FiX size={15} />
                    </button>
                  </div>

                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-1 py-6 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border border-violet-100 dark:border-violet-800/30"
                  >
                    <span className="text-5xl font-extrabold text-violet-700 dark:text-violet-400">
                      {recordCount.toLocaleString()}
                    </span>
                    <span className="text-sm font-semibold text-violet-600 dark:text-violet-300">Total Records Found</span>
                    {recordCount === 0 && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">No records detected — check your file format.</p>
                    )}
                  </motion.div>

                  <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 text-xs text-amber-700 dark:text-amber-400">
                    <FiAlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                    Duplicates (same title + company + apply link) will be skipped. Invalid records are reported in the summary.
                  </div>

                  <div className="flex gap-3">
                    <button onClick={reset} className="btn-outline flex-1 py-2.5 text-sm">
                      ← Change File
                    </button>
                    <button
                      onClick={handleImport}
                      disabled={recordCount === 0 || importing}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90 shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <FiUpload size={15} />
                      Import {recordCount > 0 ? `${recordCount.toLocaleString()} Records` : ''}
                    </button>
                  </div>
                </div>
              )}

              {/* ── PROGRESS ── */}
              {phase === 'progress' && (
                <div className="flex flex-col items-center gap-6 py-4">
                  <div className="relative w-24 h-24">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8"
                        className="text-gray-100 dark:text-slate-800" />
                      <motion.circle
                        cx="50" cy="50" r="42" fill="none"
                        stroke="url(#impGrad)" strokeWidth="8" strokeLinecap="round"
                        strokeDasharray="264"
                        animate={{ strokeDashoffset: 264 - (264 * (progressStep + 1)) / STEPS.length }}
                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                      />
                      <defs>
                        <linearGradient id="impGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#7c3aed" />
                          <stop offset="100%" stopColor="#4f46e5" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-violet-600 dark:text-violet-400">
                        {Math.round(((progressStep + 1) / STEPS.length) * 100)}%
                      </span>
                    </div>
                  </div>
                  <ProgressStepper step={progressStep} />
                </div>
              )}

              {/* ── SUMMARY ── */}
              {phase === 'summary' && result && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col items-center gap-2 py-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                      className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
                    >
                      <FiCheck className="text-3xl text-green-500" />
                    </motion.div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Import Successful!</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{file?.name} · {fmtBytes(file?.size || 0)}</p>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <SummaryCard label="Total Records" value={result.total?.toLocaleString()}
                      color="bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200" />
                    <SummaryCard label="Imported" value={result.imported?.toLocaleString()}
                      color="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" />
                    <SummaryCard label="Skipped" value={result.skipped?.toLocaleString()}
                      color="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300" />
                    <SummaryCard label="Failed" value={result.failed?.toLocaleString()}
                      color={result.failed > 0
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500'} />
                  </div>

                  {result.errors?.length > 0 && (
                    <details className="rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-xs">
                      <summary className="cursor-pointer p-3 font-semibold text-red-700 dark:text-red-400 select-none">
                        {result.errors.length} error detail(s) — click to expand
                      </summary>
                      <div className="p-3 pt-0 flex flex-col gap-1 max-h-32 overflow-y-auto">
                        {result.errors.map((e, i) => (
                          <div key={i} className="text-red-600 dark:text-red-400">Row {e.index}: {e.reason}</div>
                        ))}
                      </div>
                    </details>
                  )}

                  <div className="flex gap-3">
                    <button onClick={reset} className="btn-outline flex-1 py-2.5 text-sm">Import Another File</button>
                    <button
                      onClick={handleClose}
                      className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90 shadow-md transition-all"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BulkImportModal;
