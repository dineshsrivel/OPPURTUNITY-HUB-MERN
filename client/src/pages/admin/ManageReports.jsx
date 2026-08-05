import { useState, useEffect } from 'react';
import { FiCheckCircle, FiTrash2, FiAlertTriangle, FiEye } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { timeAgo } from '../../utils/helpers';

const ManageReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const res = await api.get('/admin/reports');
      setReports(res.data.reports);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (id) => {
    try {
      await api.put(`/admin/reports/${id}/resolve`, { status: 'resolved' });
      toast.success('Report resolved');
      fetchReports();
    } catch (err) {
      toast.error('Failed to resolve report');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await api.delete(`/admin/reports/${id}`);
      toast.success('Report deleted');
      fetchReports();
    } catch (err) {
      toast.error('Failed to delete report');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="page-enter max-w-6xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-display flex items-center gap-2">
          <FiAlertTriangle className="text-yellow-500" /> Manage Reports
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Review opportunities reported by students.</p>
      </div>

      <div className="premium-card p-0 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
            <tr>
              <th className="py-4 px-6 font-semibold text-gray-600 dark:text-gray-300 text-sm">Opportunity</th>
              <th className="py-4 px-6 font-semibold text-gray-600 dark:text-gray-300 text-sm">Reported By</th>
              <th className="py-4 px-6 font-semibold text-gray-600 dark:text-gray-300 text-sm">Reason / Details</th>
              <th className="py-4 px-6 font-semibold text-gray-600 dark:text-gray-300 text-sm">Status</th>
              <th className="py-4 px-6 font-semibold text-gray-600 dark:text-gray-300 text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {reports.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500">No reports found.</td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-6">
                    {report.opportunity ? (
                      <Link to={`/opportunities/${report.opportunity._id}`} className="font-semibold text-blue-600 hover:underline flex items-center gap-1">
                        {report.opportunity.title} <FiEye size={14} />
                      </Link>
                    ) : (
                      <span className="text-gray-400 italic">Deleted Opportunity</span>
                    )}
                    <div className="text-xs text-gray-500 mt-1">{report.opportunity?.companyName}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900 dark:text-white">{report.user?.name}</div>
                    <div className="text-xs text-gray-500">{timeAgo(report.createdAt)}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="badge badge-red capitalize mb-1 inline-block">{report.reason}</span>
                    <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={report.details}>
                      {report.details || 'No additional details'}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`badge ${report.status === 'pending' ? 'badge-yellow' : 'badge-green'} capitalize`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    {report.status === 'pending' && (
                      <button onClick={() => handleResolve(report._id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Mark Resolved">
                        <FiCheckCircle size={18} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(report._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Report">
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageReports;
