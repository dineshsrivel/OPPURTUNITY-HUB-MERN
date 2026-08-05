import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FiUpload, FiPlus, FiX, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { getMe } from '../../store/slices/authSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    phone: '',
    githubUrl: '',
    linkedinUrl: '',
    skills: [],
    interests: [],
  });
  
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        phone: user.phone || '',
        githubUrl: user.githubUrl || '',
        linkedinUrl: user.linkedinUrl || '',
        skills: user.skills || [],
        interests: user.preferredRoles || [], // Mapping preferredRoles to interests
      });
    }
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('avatar', file);

    setUploading(true);
    try {
      await api.post('/users/avatar', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Profile picture updated!');
      dispatch(getMe());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const addInterest = () => {
    if (interestInput.trim() && !formData.interests.includes(interestInput.trim())) {
      setFormData({ ...formData, interests: [...formData.interests, interestInput.trim()] });
      setInterestInput('');
    }
  };

  const removeInterest = (interest) => {
    setFormData({ ...formData, interests: formData.interests.filter(i => i !== interest) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await api.put('/users/profile', {
        ...formData,
        preferredRoles: formData.interests
      });
      toast.success(response.data?.message || 'Profile updated successfully!');
      dispatch(getMe());
    } catch (err) {
      console.error('Profile update error:', err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        err.message ||
        'Failed to update profile';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <LoadingSpinner />;

  return (
    <div className="page-enter max-w-4xl mx-auto pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">Student Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your personal information, skills, and career interests.</p>
      </div>

      <div className="premium-card p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 flex items-center justify-center">
              {uploading ? (
                <LoadingSpinner size="sm" />
              ) : user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-blue-600">{user.name.charAt(0)}</span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-colors">
              <FiUpload size={14} />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
            </label>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
            <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
            <p className="text-sm mt-2 text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/30 inline-block px-3 py-1 rounded-full">
              Profile Completeness: {user.profileCompletion || 0}%
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="premium-card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label">Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" required />
          </div>
          <div>
            <label className="form-label">Location</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} className="form-input" placeholder="e.g. New York, NY" />
          </div>
          <div>
            <label className="form-label">Phone Number</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="form-input" placeholder="e.g. +1 234 567 890" />
          </div>
          <div>
            <label className="form-label">GitHub URL</label>
            <input type="url" name="githubUrl" value={formData.githubUrl} onChange={handleChange} className="form-input" placeholder="https://github.com/username" />
          </div>
          <div>
            <label className="form-label">LinkedIn URL</label>
            <input type="url" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} className="form-input" placeholder="https://linkedin.com/in/username" />
          </div>
          <div className="md:col-span-2">
            <label className="form-label">Bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} className="form-input resize-none" rows="3" placeholder="Tell us about yourself..."></textarea>
          </div>
        </div>

        <hr className="border-gray-200 dark:border-slate-800" />

        <div>
          <label className="form-label">Skills</label>
          <div className="flex gap-2 mb-3">
            <input 
              type="text" 
              value={skillInput} 
              onChange={(e) => setSkillInput(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              className="form-input" 
              placeholder="e.g. React, Python, Data Analysis" 
            />
            <button type="button" onClick={addSkill} className="btn-secondary px-4"><FiPlus /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill, index) => (
              <span key={index} className="skill-tag flex items-center gap-1 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                {skill}
                <FiX className="cursor-pointer hover:text-red-500" onClick={() => removeSkill(skill)} />
              </span>
            ))}
          </div>
        </div>

        <hr className="border-gray-200 dark:border-slate-800" />

        <div>
          <label className="form-label">Career Interests</label>
          <div className="flex gap-2 mb-3">
            <input 
              type="text" 
              value={interestInput} 
              onChange={(e) => setInterestInput(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
              className="form-input" 
              placeholder="e.g. Frontend Development, Machine Learning" 
            />
            <button type="button" onClick={addInterest} className="btn-secondary px-4"><FiPlus /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.interests.map((interest, index) => (
              <span key={index} className="skill-tag bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-900/50 dark:text-green-400 flex items-center gap-1">
                {interest}
                <FiX className="cursor-pointer hover:text-red-500" onClick={() => removeInterest(interest)} />
              </span>
            ))}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? <LoadingSpinner size="sm" color="white" /> : <FiSave />}
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
