import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiTrash2, FiSearch, FiBriefcase, FiEdit3, FiPlus, FiAlertTriangle,
  FiX, FiRefreshCw, FiFilter, FiZap, FiMapPin, FiClock, FiChevronLeft,
  FiChevronRight, FiEye, FiDownload,
} from 'react-icons/fi';
import { MdDeleteSweep } from 'react-icons/md';
import { HiOutlineArrowUpTray } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import OpportunityFormModal from '../../components/opportunities/OpportunityFormModal';
import BulkImportModal from '../../components/opportunities/BulkImportModal';

// ── Category colour map ──────────────────────────────────────────────────────
const CAT_STYLES = {
  job:          { bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',   dot: 'bg-blue-500' },
  internship:   { bg: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', dot: 'bg-purple-500' },
  freelancing:  { bg: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',   dot: 'bg-cyan-500' },
  hackathon:    { bg: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300', dot: 'bg-orange-500' },
  scholarship:  { bg: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',   dot: 'bg-green-500' },
};

const CATEGORY_LABELS = [
  { type: 'job',         label: 'Jobs',          icon: '💼' },
  { type: 'internship',  label: 'Internships',   icon: '🎓' },
  { type: 'freelancing', label: 'Freelancing',   icon: '🚀' },
  { type: 'hackathon',   label: 'Hackathons',    icon: '⚡' },
  { type: 'scholarship', label: 'Scholarships',  icon: '🏆' },
];

// ── Confirmation Dialog ──────────────────────────────────────────────────────
const ConfirmDialog = ({ isOpen, title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/70 px-4"
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
          className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${danger ? 'bg-red-100' : 'bg-blue-100'}`}>
              <FiAlertTriangle className={`text-xl ${danger ? 'text-red-500' : 'text-blue-500'}`} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{message}</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onCancel} className="btn-outline py-2 px-4 text-sm">Cancel</button>
            <button
              onClick={onConfirm}
              className={`py-2 px-4 text-sm font-semibold rounded-xl transition-all ${danger
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ── Skeleton Row ─────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[1, 2, 3, 4, 5].map((i) => (
      <td key={i} className="py-4 px-4">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-full" style={{ width: `${40 + i * 10}%` }} />
      </td>
    ))}
  </tr>
);

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ onAdd, onImport }) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mb-5 shadow-inner">
      <FiBriefcase className="text-3xl text-blue-400" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Opportunities Yet</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6 leading-relaxed">
      The database is currently empty. Add your first opportunity manually or use <strong>Bulk Import</strong> to upload a JSON or CSV file.
    </p>
    <div className="flex gap-3 flex-wrap justify-center">
      <button onClick={onAdd} className="btn-primary flex items-center gap-2 px-5 py-2.5">
        <FiPlus /> Add Manually
      </button>
      <button onClick={onImport} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90 shadow-sm transition-all">
        <HiOutlineArrowUpTray /> Bulk Import
      </button>
    </div>
  </div>
);

const CAT_FILTER_MAP = {
  job: 'Jobs', internship: 'Internships', freelancing: 'Freelancing',
  hackathon: 'Hackathons', scholarship: 'Scholarships',
};

const ManageOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [allOpportunities, setAllOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [stats, setStats] = useState(null);
  const [bulkImportOpen,  setBulkImportOpen]  = useState(false);
  const [deleteAllLoading, setDeleteAllLoading] = useState(false);
  const [syncingGreenhouse, setSyncingGreenhouse] = useState(false);
  const [syncingMuse,       setSyncingMuse]       = useState(false);
  const [syncingRemotive,   setSyncingRemotive]   = useState(false);
  const [syncingDevpost,    setSyncingDevpost]    = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);   // { id, title }
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await api.get('/admin/stats');
      setStats(res.data.stats);
    } catch (_) {} finally { setStatsLoading(false); }
  }, []);

  const fetchOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch all opportunities dynamically for stat card counting
      const allRes = await api.get('/opportunities?limit=10000');
      const allData = allRes.data.opportunities || [];
      setAllOpportunities(allData);

      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (categoryFilter) params.set('category', categoryFilter);
      if (statusFilter) params.set('status', statusFilter);
      if (workModeFilter) params.set('workMode', workModeFilter);
      params.set('page', page);
      params.set('limit', 10);
      const res = await api.get(`/opportunities?${params.toString()}`);
      setOpportunities(res.data.opportunities || []);
      setTotalPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (_) {
      toast.error('Failed to load opportunities');
    } finally { setLoading(false); }
  }, [debouncedSearch, categoryFilter, statusFilter, workModeFilter, page]);

  const getCategoryCount = (type) => {
    if (!allOpportunities || allOpportunities.length === 0) return 0;
    const targetCat = CAT_FILTER_MAP[type] || '';
    return allOpportunities.filter((opp) => {
      return (
        opp.type === type ||
        (targetCat && opp.category === targetCat)
      );
    }).length;
  };

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchOpportunities(); }, [fetchOpportunities]);

  const handleSyncGreenhouse = async () => {
    try {
      setSyncingGreenhouse(true);
      const res = await api.post('/jobs/greenhouse/sync');
      toast.success(
        `Greenhouse Sync completed! Fetched ${res.data.fetched || 0}, Added ${res.data.added || 0}, Skipped ${res.data.skipped || 0}`
      );
      fetchOpportunities();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Greenhouse sync failed');
    } finally {
      setSyncingGreenhouse(false);
    }
  };

  const handleSyncMuse = async () => {
    try {
      setSyncingMuse(true);
      const res = await api.post('/internships/muse/sync');
      toast.success(
        `Muse Sync completed! Fetched ${res.data.fetched || 0}, Added ${res.data.added || 0}, Skipped ${res.data.skipped || 0}`
      );
      fetchOpportunities();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Muse sync failed');
    } finally {
      setSyncingMuse(false);
    }
  };

  const handleSyncRemotive = async () => {
    try {
      setSyncingRemotive(true);
      const res = await api.post('/freelancing/remotive/sync');
      toast.success(
        `Remotive Freelancing Sync completed! Fetched ${res.data.fetched || 0}, Added ${res.data.added || 0}, Skipped ${res.data.skipped || 0}`
      );
      fetchOpportunities();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Remotive sync failed');
    } finally {
      setSyncingRemotive(false);
    }
  };

  const handleSyncDevpost = async () => {
    try {
      setSyncingDevpost(true);
      const res = await api.post('/hackathons/devpost/sync');
      toast.success(
        `Hackathons Sync completed! Fetched ${res.data.fetched || 0}, Added ${res.data.added || 0}, Skipped ${res.data.skipped || 0}`
      );
      fetchOpportunities();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hackathons sync failed');
    } finally {
      setSyncingDevpost(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/opportunities/${confirmDelete.id}`);
      toast.success('Opportunity deleted successfully');
      fetchOpportunities();
      fetchStats();
    } catch (_) { toast.error('Failed to delete opportunity'); }
    finally { setConfirmDelete(null); }
  };


  const handleDeleteAll = async () => {
    try {
      setDeleteAllLoading(true);
      const res = await api.delete('/admin/opportunities/all');
      toast.success(res.data.message || 'All opportunities deleted');
      fetchOpportunities();
      fetchStats();
    } catch (_) { toast.error('Failed to delete all opportunities'); }
    finally { setDeleteAllLoading(false); setConfirmDeleteAll(false); }
  };

  // ── Export all opportunities ────────────────────────────────────────────────
  const handleExport = async (format) => {
    try {
      const res = await api.get('/opportunities?limit=10000');
      const opps = res.data.opportunities || [];
      if (opps.length === 0) { toast('No opportunities to export', { icon: 'ℹ️' }); return; }

      let content, mimeType, filename;
      if (format === 'json') {
        content  = JSON.stringify(opps, null, 2);
        mimeType = 'application/json';
        filename = `opportunities-${new Date().toISOString().slice(0,10)}.json`;
      } else {
        const fields = ['title','companyName','type','category','description','location','workMode',
          'salary','applicationDeadline','applyLink','contactEmail','status','isFeatured'];
        const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const rows   = [fields.join(','), ...opps.map((o) => fields.map((f) => escape(o[f])).join(','))];
        content  = rows.join('\n');
        mimeType = 'text/csv';
        filename = `opportunities-${new Date().toISOString().slice(0,10)}.csv`;
      }

      const blob = new Blob([content], { type: mimeType });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${opps.length} opportunities as ${format.toUpperCase()}`);
    } catch (_) { toast.error('Export failed'); }
  };

  const clearFilters = () => {
    setSearch(''); setCategoryFilter(''); setStatusFilter(''); setWorkModeFilter(''); setPage(1);
  };
  const hasFilters = search || categoryFilter || statusFilter || workModeFilter;

  return (
    <div className="page-enter max-w-7xl mx-auto pb-12">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display flex items-center gap-2">
            <FiBriefcase className="text-blue-600" /> Manage Opportunities
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Add, edit, publish, and remove opportunities from MongoDB.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          {/* Sync Muse Button */}
          <button
            onClick={handleSyncMuse}
            disabled={syncingMuse}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all disabled:opacity-50"
            title="Sync internships from The Muse API"
          >
            <FiZap className={syncingMuse ? 'animate-spin' : ''} />
            {syncingMuse ? 'Syncing Muse...' : 'Sync Muse'}
          </button>

          {/* Sync Greenhouse Button */}
          <button
            onClick={handleSyncGreenhouse}
            disabled={syncingGreenhouse}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all disabled:opacity-50"
            title="Sync jobs from Greenhouse API"
          >
            <FiZap className={syncingGreenhouse ? 'animate-spin' : ''} />
            {syncingGreenhouse ? 'Syncing Greenhouse...' : 'Sync Greenhouse'}
          </button>

          {/* Sync Remotive Button */}
          <button
            onClick={handleSyncRemotive}
            disabled={syncingRemotive}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-all disabled:opacity-50"
            title="Sync freelancing opportunities from Remotive API"
          >
            <FiZap className={syncingRemotive ? 'animate-spin' : ''} />
            {syncingRemotive ? 'Syncing Remotive...' : 'Sync Remotive'}
          </button>

          {/* Bulk Import Button */}
          <button
            onClick={() => setBulkImportOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90 shadow-sm transition-all"
          >
            <HiOutlineArrowUpTray />
            Bulk Import
          </button>

          {/* Export Dropdown */}
          <div className="relative group">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all"
            >
              <FiDownload /> Export
            </button>
            <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50">
              <button onClick={() => handleExport('json')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                Export as JSON
              </button>
              <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                Export as CSV
              </button>
            </div>
          </div>

          {/* Delete All Button */}
          <button
            onClick={() => setConfirmDeleteAll(true)}
            disabled={deleteAllLoading || total === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {deleteAllLoading ? <FiRefreshCw className="animate-spin" /> : <MdDeleteSweep />}
            Delete All
          </button>

          {/* Add Opportunity Button */}
          <button
            onClick={() => { setSelectedOpportunity(null); setModalOpen(true); }}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
          >
            <FiPlus /> Add Opportunity
          </button>
        </div>
      </div>

      {/* ── Stats Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {CATEGORY_LABELS.map(({ type, label, icon }) => {
          const count = loading ? '—' : getCategoryCount(type);
          return (
            <motion.div
              key={type}
              whileHover={{ y: -2 }}
              onClick={() => {
                const catVal = CAT_FILTER_MAP[type] || '';
                setCategoryFilter((prev) => prev === catVal ? '' : catVal);
                setPage(1);
              }}
              className={`premium-card p-3 text-center cursor-pointer transition-all ${
                categoryFilter === CAT_FILTER_MAP[type]
                  ? 'ring-2 ring-blue-500'
                  : ''
              }`}
            >
              <div className="text-xl mb-1">{icon}</div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">{loading ? <span className="inline-block w-4 h-3 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" /> : count}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight mt-0.5">{label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Total count */}
      <div className="mb-4 flex items-center gap-3">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-bold text-gray-900 dark:text-white text-lg">{total}</span> total opportunities in database
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
            <FiX size={12} /> Clear filters
          </button>
        )}
      </div>

      {/* ── Search & Filter Bar ───────────────────────────────────────────── */}
      <div className="premium-card p-4 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search by title, company, skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-9 py-2 w-full text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <FiX size={14} />
            </button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="form-input py-2 text-sm min-w-[130px]">
            <option value="">All Categories</option>
            {['Jobs','Internships','Freelancing','Hackathons','Scholarships'].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="form-input py-2 text-sm min-w-[110px]">
            <option value="">All Status</option>
            <option>Active</option>
            <option>Expired</option>
          </select>

          <select value={workModeFilter} onChange={(e) => { setWorkModeFilter(e.target.value); setPage(1); }} className="form-input py-2 text-sm min-w-[120px]">
            <option value="">All Work Modes</option>
            <option>Remote</option>
            <option>Hybrid</option>
            <option>Onsite</option>
          </select>
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-700">
                <th className="py-3.5 px-4 font-semibold text-gray-500 dark:text-slate-400 text-xs uppercase tracking-wider whitespace-nowrap">Opportunity</th>
                <th className="py-3.5 px-4 font-semibold text-gray-500 dark:text-slate-400 text-xs uppercase tracking-wider whitespace-nowrap">Company</th>
                <th className="py-3.5 px-4 font-semibold text-gray-500 dark:text-slate-400 text-xs uppercase tracking-wider whitespace-nowrap">Type</th>
                <th className="py-3.5 px-4 font-semibold text-gray-500 dark:text-slate-400 text-xs uppercase tracking-wider whitespace-nowrap">Location</th>
                <th className="py-3.5 px-4 font-semibold text-gray-500 dark:text-slate-400 text-xs uppercase tracking-wider whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : opportunities.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    {hasFilters ? (
                      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                        <FiSearch className="text-4xl text-gray-300 mb-3" />
                        <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">No matching opportunities</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Try adjusting your search or filter criteria.</p>
                        <button onClick={clearFilters} className="btn-outline text-sm py-2 px-4">Clear Filters</button>
                      </div>
                    ) : (
                      <EmptyState
                        onAdd={() => { setSelectedOpportunity(null); setModalOpen(true); }}
                        onImport={() => setBulkImportOpen(true)}
                      />
                    )}
                  </td>
                </tr>
              ) : (
                opportunities.map((opp, idx) => {
                  const style = CAT_STYLES[opp.type] || CAT_STYLES.job;
                  return (
                    <motion.tr
                      key={opp._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Title column */}
                      <td className="py-3.5 px-4 min-w-[240px] max-w-[320px]">
                        <div className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {opp.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${opp.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-gray-400'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${opp.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                            {opp.status}
                          </span>
                          {opp.isFeatured && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-medium">
                              ⭐ Featured
                            </span>
                          )}
                        </div>
                        {opp.applicationDeadline && (
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                            <FiClock size={10} /> Due {new Date(opp.applicationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        )}
                      </td>

                      {/* Company column */}
                      <td className="py-3.5 px-4 min-w-[160px]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-200 dark:border-slate-700">
                            {opp.companyLogo
                              ? <img src={opp.companyLogo} alt="" className="w-full h-full object-contain p-0.5" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                              : null}
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 hidden items-center justify-center w-full h-full">
                              {opp.companyName?.[0] || '?'}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-slate-300 line-clamp-1">{opp.companyName || '—'}</span>
                        </div>
                      </td>

                      {/* Type column */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${style.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          {opp.type}
                        </span>
                      </td>

                      {/* Location column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <FiMapPin size={12} />
                          <span className="capitalize">{opp.workMode || opp.locationType || 'Remote'}</span>
                        </div>
                        {opp.location && opp.location !== 'Remote' && (
                          <div className="text-xs text-gray-400 mt-0.5">{opp.location}</div>
                        )}
                      </td>

                      {/* Actions column */}
                      <td className="py-3.5 px-4">
                        <div className="flex justify-end gap-1">
                          <a
                            href={`/opportunities/${opp._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-white transition-all"
                            title="Preview"
                          >
                            <FiEye size={15} />
                          </a>
                          <button
                            onClick={() => { setSelectedOpportunity(opp); setModalOpen(true); }}
                            className="p-2 rounded-lg text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                            title="Edit"
                          >
                            <FiEdit3 size={15} />
                          </button>
                          <button
                            onClick={() => setConfirmDelete({ id: opp._id, title: opp.title })}
                            className="p-2 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all"
                            title="Delete"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="py-3.5 px-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages} &nbsp;·&nbsp; {total} total
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-1 btn-outline py-1.5 px-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiChevronLeft size={14} /> Prev
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 btn-outline py-1.5 px-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <FiChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <OpportunityFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        opportunity={selectedOpportunity}
        onSaved={() => { fetchOpportunities(); fetchStats(); }}
      />

      <BulkImportModal
        isOpen={bulkImportOpen}
        onClose={() => setBulkImportOpen(false)}
        onImported={() => { fetchOpportunities(); fetchStats(); }}
      />

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Opportunity"
        message={`Are you sure you want to delete "${confirmDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />

      <ConfirmDialog
        isOpen={confirmDeleteAll}
        title="Delete ALL Opportunities"
        message={`This will permanently remove ALL ${total} opportunities from MongoDB. Student pages will immediately show the empty state. This cannot be undone.`}
        confirmLabel={deleteAllLoading ? 'Deleting...' : `Delete All ${total} Opportunities`}
        danger
        onConfirm={handleDeleteAll}
        onCancel={() => setConfirmDeleteAll(false)}
      />
    </div>
  );
};

export default ManageOpportunities;
