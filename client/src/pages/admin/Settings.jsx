import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiSave, FiLock, FiUser } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const { user } = useSelector(state => state.auth);
  
  const [profileData, setProfileData] = useState({ name: user?.name || '' });
  const [pwdData, setPwdData] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/updatedetails', profileData);
      toast.success('Profile updated successfully');
      // Ideally dispatch update user to redux, but page refresh works
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/updatepassword', pwdData);
      toast.success('Password updated successfully');
      setPwdData({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter max-w-4xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-display flex items-center gap-2">
          Admin Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your administrator account.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <div className="premium-card p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FiUser className="text-blue-600" /> Personal Details
          </h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="form-label">Email Address (Read-only)</label>
              <input type="email" readOnly className="form-input bg-gray-100 text-gray-500 cursor-not-allowed" value={user?.email || ''} />
            </div>
            <div>
              <label className="form-label">Full Name</label>
              <input type="text" required className="form-input" value={profileData.name} onChange={e => setProfileData({ ...profileData, name: e.target.value })} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              <FiSave /> Save Changes
            </button>
          </form>
        </div>

        {/* Security Settings */}
        <div className="premium-card p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FiLock className="text-red-600" /> Security
          </h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="form-label">Current Password</label>
              <input type="password" required className="form-input" value={pwdData.currentPassword} onChange={e => setPwdData({ ...pwdData, currentPassword: e.target.value })} />
            </div>
            <div>
              <label className="form-label">New Password</label>
              <input type="password" required minLength={8} className="form-input" value={pwdData.newPassword} onChange={e => setPwdData({ ...pwdData, newPassword: e.target.value })} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              <FiSave /> Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
