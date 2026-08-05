import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

const initialState = {
  title: '',
  companyName: '',
  companyLogo: '',
  category: 'Jobs',
  type: 'job',
  description: '',
  requiredSkills: '',
  eligibility: '',
  location: '',
  workMode: 'Remote',
  salary: '',
  salaryMin: '',
  salaryMax: '',
  applicationDeadline: '',
  applyLink: '',
  contactEmail: '',
  postedDate: '',
  status: 'Active',
  isFeatured: false,
};

const CATEGORY_TYPE_MAP = {
  Jobs: 'job',
  Internships: 'internship',
  Freelancing: 'freelancing',
  Hackathons: 'hackathon',
  Scholarships: 'scholarship',
};

const Label = ({ children, required }) => (
  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
    {children}{required && <span className="ml-0.5 text-red-500">*</span>}
  </label>
);

const Field = ({ label, required, error, children }) => (
  <div>
    <Label required={required}>{label}</Label>
    {children}
    {error && (
      <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
        <FiAlertCircle size={11} /> {error}
      </p>
    )}
  </div>
);

const OpportunityFormModal = ({ isOpen, onClose, opportunity, onSaved }) => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (opportunity) {
      setForm({
        title: opportunity.title || '',
        companyName: opportunity.companyName || '',
        companyLogo: opportunity.companyLogo || '',
        category: opportunity.category || 'Jobs',
        type: opportunity.type || 'job',
        description: opportunity.description || '',
        requiredSkills: (opportunity.requiredSkills || opportunity.skills || []).join(', '),
        eligibility: opportunity.eligibility || '',
        location: opportunity.location || '',
        workMode: opportunity.workMode || opportunity.locationType || 'Remote',
        salary: opportunity.salary || '',
        salaryMin: opportunity.salaryMin || '',
        salaryMax: opportunity.salaryMax || '',
        applicationDeadline: opportunity.applicationDeadline ? new Date(opportunity.applicationDeadline).toISOString().slice(0, 10) : '',
        applyLink: opportunity.applyLink || '',
        contactEmail: opportunity.contactEmail || '',
        postedDate: opportunity.postedDate ? new Date(opportunity.postedDate).toISOString().slice(0, 10) : '',
        status: opportunity.status || 'Active',
        isFeatured: opportunity.isFeatured || false,
      });
    } else {
      setForm(initialState);
    }
    setErrors({});
  }, [opportunity, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
      // Auto-sync type when category changes
      if (name === 'category') {
        updated.type = CATEGORY_TYPE_MAP[value] || 'job';
      }
      return updated;
    });
    // Clear error on change
    if (errors[name]) setErrors((prev) => { const e = { ...prev }; delete e[name]; return e; });
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.companyName.trim()) e.companyName = 'Company name is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (form.applyLink && !/^https?:\/\/.+/.test(form.applyLink)) e.applyLink = 'Must start with http:// or https://';
    if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) e.contactEmail = 'Invalid email address';
    if (form.companyLogo && !/^https?:\/\/.+/.test(form.companyLogo)) e.companyLogo = 'Must be a valid URL';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the validation errors');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        requiredSkills: form.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
        skills: form.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        applicationDeadline: form.applicationDeadline ? new Date(form.applicationDeadline) : undefined,
        postedDate: form.postedDate ? new Date(form.postedDate) : undefined,
        deadline: form.applicationDeadline ? new Date(form.applicationDeadline) : undefined,
        locationType: form.workMode.toLowerCase(),
      };

      if (opportunity) {
        await api.put(`/opportunities/${opportunity._id}`, payload);
        toast.success('✅ Opportunity updated successfully');
      } else {
        await api.post('/opportunities', payload);
        toast.success('✅ Opportunity created successfully');
      }

      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to save opportunity');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 px-4 py-6"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ y: 24, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 24, opacity: 0, scale: 0.97 }}
          className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl dark:bg-slate-900 flex flex-col"
          style={{ maxHeight: 'calc(100vh - 48px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {opportunity ? 'Edit Opportunity' : 'Add New Opportunity'}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {opportunity ? 'Update the details below and save changes.' : 'Fill out the form to publish a new opportunity to MongoDB.'}
              </p>
            </div>
            <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0">
              <FiX size={20} />
            </button>
          </div>

          {/* Scrollable form body */}
          <div className="overflow-y-auto flex-1 px-6 py-5">
            <form id="opp-form" onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">

              {/* Title — full width */}
              <div className="md:col-span-2">
                <Field label="Opportunity Title" required error={errors.title}>
                  <input
                    name="title" value={form.title} onChange={handleChange}
                    placeholder="e.g. Senior Frontend Developer at Razorpay"
                    className={`form-input w-full ${errors.title ? 'border-red-400' : ''}`}
                  />
                </Field>
              </div>

              {/* Company Name */}
              <Field label="Company / Organization Name" required error={errors.companyName}>
                <input
                  name="companyName" value={form.companyName} onChange={handleChange}
                  placeholder="e.g. Razorpay"
                  className={`form-input w-full ${errors.companyName ? 'border-red-400' : ''}`}
                />
              </Field>

              {/* Company Logo */}
              <Field label="Company Logo (Image URL)" error={errors.companyLogo}>
                <input
                  name="companyLogo" value={form.companyLogo} onChange={handleChange}
                  placeholder="https://logo.clearbit.com/example.com"
                  className={`form-input w-full ${errors.companyLogo ? 'border-red-400' : ''}`}
                />
              </Field>

              {/* Category */}
              <div>
                <Label>Category</Label>
                <select name="category" value={form.category} onChange={handleChange} className="form-input w-full">
                  {Object.keys(CATEGORY_TYPE_MAP).map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Type (auto-synced from category, but editable) */}
              <div>
                <Label>Type</Label>
                <select name="type" value={form.type} onChange={handleChange} className="form-input w-full">
                  <option value="job">Job</option>
                  <option value="internship">Internship</option>
                  <option value="freelancing">Freelancing</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="scholarship">Scholarship</option>
                </select>
              </div>

              {/* Description — full width */}
              <div className="md:col-span-2">
                <Field label="Description" required error={errors.description}>
                  <textarea
                    name="description" rows={4} value={form.description} onChange={handleChange}
                    placeholder="Describe the opportunity, responsibilities, and what the applicant will gain..."
                    className={`form-input w-full resize-none ${errors.description ? 'border-red-400' : ''}`}
                  />
                </Field>
              </div>

              {/* Skills */}
              <div>
                <Label>Skills Required</Label>
                <input
                  name="requiredSkills" value={form.requiredSkills} onChange={handleChange}
                  placeholder="React, Node.js, SQL (comma-separated)"
                  className="form-input w-full"
                />
              </div>

              {/* Eligibility */}
              <div>
                <Label>Eligibility</Label>
                <input
                  name="eligibility" value={form.eligibility} onChange={handleChange}
                  placeholder="e.g. Final year B.Tech students in CS/IT"
                  className="form-input w-full"
                />
              </div>

              {/* Location */}
              <div>
                <Label>Location</Label>
                <input
                  name="location" value={form.location} onChange={handleChange}
                  placeholder="e.g. Bengaluru, Remote, Pan India"
                  className="form-input w-full"
                />
              </div>

              {/* Work Mode */}
              <div>
                <Label>Work Mode</Label>
                <select name="workMode" value={form.workMode} onChange={handleChange} className="form-input w-full">
                  <option>Remote</option>
                  <option>Hybrid</option>
                  <option>Onsite</option>
                </select>
              </div>

              {/* Salary / Stipend */}
              <div>
                <Label>Salary / Stipend</Label>
                <input
                  name="salary" value={form.salary} onChange={handleChange}
                  placeholder="e.g. ₹20,000/month or ₹8,00,000/year"
                  className="form-input w-full"
                />
              </div>

              {/* Application Deadline */}
              <div>
                <Label>Application Deadline</Label>
                <input type="date" name="applicationDeadline" value={form.applicationDeadline} onChange={handleChange} className="form-input w-full" />
              </div>

              {/* Official Apply Link */}
              <div>
                <Field label="Official Apply Link" error={errors.applyLink}>
                  <input
                    name="applyLink" value={form.applyLink} onChange={handleChange}
                    placeholder="https://company.com/careers/apply"
                    className={`form-input w-full ${errors.applyLink ? 'border-red-400' : ''}`}
                  />
                </Field>
              </div>

              {/* Contact Email (optional) */}
              <div>
                <Field label="Contact Email (Optional)" error={errors.contactEmail}>
                  <input
                    type="email" name="contactEmail" value={form.contactEmail} onChange={handleChange}
                    placeholder="careers@company.com"
                    className={`form-input w-full ${errors.contactEmail ? 'border-red-400' : ''}`}
                  />
                </Field>
              </div>

              {/* Min/Max Salary (numeric, optional) */}
              <div>
                <Label>Min Salary (numeric, optional)</Label>
                <input type="number" name="salaryMin" value={form.salaryMin} onChange={handleChange} placeholder="e.g. 500000" className="form-input w-full" />
              </div>

              <div>
                <Label>Max Salary (numeric, optional)</Label>
                <input type="number" name="salaryMax" value={form.salaryMax} onChange={handleChange} placeholder="e.g. 800000" className="form-input w-full" />
              </div>

              {/* Status */}
              <div>
                <Label>Status</Label>
                <select name="status" value={form.status} onChange={handleChange} className="form-input w-full">
                  <option>Active</option>
                  <option>Expired</option>
                </select>
              </div>

              {/* Posted Date */}
              <div>
                <Label>Posted Date (optional)</Label>
                <input type="date" name="postedDate" value={form.postedDate} onChange={handleChange} className="form-input w-full" />
              </div>

              {/* Featured checkbox — full width */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <input
                    id="featured" type="checkbox" name="isFeatured"
                    checked={form.isFeatured} onChange={handleChange}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                  <div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">⭐ Mark as Featured</div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">Featured opportunities appear in the highlighted section on the home page.</div>
                  </div>
                </label>
              </div>

            </form>
          </div>

          {/* Footer with actions */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 flex-shrink-0 bg-gray-50/50 dark:bg-slate-900 rounded-b-3xl">
            <button type="button" onClick={onClose} className="btn-outline px-5 py-2.5 text-sm">
              Cancel
            </button>
            <button
              type="submit"
              form="opp-form"
              disabled={loading}
              className="btn-primary px-5 py-2.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed min-w-[140px] flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
              ) : opportunity ? 'Save Changes' : 'Create Opportunity'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OpportunityFormModal;
