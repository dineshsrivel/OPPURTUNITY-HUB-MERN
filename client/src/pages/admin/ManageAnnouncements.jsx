import { useState } from 'react';
import { FiSend, FiZap } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ManageAnnouncements = () => {
  const [formData, setFormData] = useState({ title: '', message: '', link: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/admin/notifications/broadcast', formData);
      toast.success(res.data.message || 'Announcement sent!');
      setFormData({ title: '', message: '', link: '' });
    } catch (err) {
      toast.error('Failed to send announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter max-w-3xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-display flex items-center gap-2">
          <FiZap className="text-blue-600" /> Broadcast Announcement
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Send a notification to all registered students.</p>
      </div>

      <div className="premium-card p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="form-label">Announcement Title</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Hackathon Registrations Open!"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label">Message</label>
            <textarea
              required
              className="form-input min-h-[120px]"
              placeholder="Provide details here..."
              value={formData.message}
              onChange={e => setFormData({ ...formData, message: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-2">Max 500 characters.</p>
          </div>

          <div>
            <label className="form-label">Action Link (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. /opportunities or https://external.com"
              value={formData.link}
              onChange={e => setFormData({ ...formData, link: e.target.value })}
            />
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? 'Sending...' : (
                <>
                  <FiSend /> Broadcast to All Students
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageAnnouncements;
