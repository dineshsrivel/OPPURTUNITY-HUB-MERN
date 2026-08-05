import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiMapPin, FiClock, FiDollarSign, FiBriefcase, FiBookmark, FiShare2, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import DOMPurify from 'dompurify';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ReportModal from '../../components/opportunities/ReportModal';
import { timeAgo } from '../../utils/helpers';

// Configure DOMPurify hook to ensure all links open in a new tab with security attributes
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

const getSanitizedHtml = (htmlContent) => {
  if (!htmlContent) return '';
  const hasHtml = /<[a-z][\s\S]*>/i.test(htmlContent);
  const formattedContent = hasHtml ? htmlContent : htmlContent.replace(/\n/g, '<br />');
  return DOMPurify.sanitize(formattedContent, {
    ADD_ATTR: ['target', 'rel'],
  });
};

const OpportunityDetails = () => {
  const { id } = useParams();
  const { user } = useSelector(state => state.auth);
  const [opp, setOpp] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    const fetchOpp = async () => {
      try {
        const res = await api.get(`/opportunities/${id}`);
        setOpp(res.data.opportunity);
        setIsBookmarked(res.data.isBookmarked);
        setHasApplied(res.data.hasApplied);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOpp();
    window.scrollTo(0, 0);
  }, [id]);

  const handleBookmark = async () => {
    if (!user) return toast.error('Please login to bookmark');
    try {
      const res = await api.post(`/opportunities/${id}/bookmark`);
      setIsBookmarked(res.data.isBookmarked);
      toast.success(res.data.message);
    } catch (err) {
      toast.error('Failed to update bookmark');
    }
  };

  const handleApply = async () => {
    if (!user) return toast.error('Please login to apply');
    if (opp.applyLink) {
      window.open(opp.applyLink, '_blank', 'noopener,noreferrer');
      return;
    }
    setApplying(true);
    try {
      await api.post(`/applications`, { opportunity: id });
      setHasApplied(true);
      toast.success('Successfully applied!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (loading) return <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>;
  if (!opp) return <div className="py-20 text-center text-xl font-bold dark:text-white">Opportunity not found</div>;

  return (
    <div className="page-enter max-w-5xl mx-auto pb-12 px-4 sm:px-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm mb-8">
        <div className="h-32 sm:h-48 bg-gradient-primary w-full relative">
          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={handleShare} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center hover:bg-white/30 transition">
              <FiShare2 />
            </button>
            <button onClick={handleBookmark} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center hover:bg-white/30 transition">
              <FiBookmark fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
        
        <div className="px-6 sm:px-10 pb-8 relative">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-white border-4 border-white dark:border-slate-900 shadow-lg -mt-12 sm:-mt-16 mb-4 flex items-center justify-center overflow-hidden">
            {opp.companyLogo ? (
              <img src={opp.companyLogo} alt={opp.companyName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-blue-600">{opp.companyName?.[0]}</span>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">{opp.title}</h1>
              <div className="text-lg font-medium text-blue-600 dark:text-blue-400 mb-4">
                {opp.companyName}
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5"><FiBriefcase /> <span className="capitalize">{opp.type}</span></div>
                <div className="flex items-center gap-1.5"><FiMapPin /> <span className="capitalize">{opp.workMode || opp.locationType}</span> • {opp.location || 'Anywhere'}</div>
                {opp.salary ? (
                  <div className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-slate-300">
                    <FiDollarSign /> {opp.salary}
                  </div>
                ) : opp.salaryMax && (
                  <div className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-slate-300">
                    <FiDollarSign /> {opp.salaryMin ? `${opp.salaryMin} - ` : ''}{opp.salaryMax}
                  </div>
                )}
                <div className="flex items-center gap-1.5"><FiClock /> Posted {timeAgo(opp.createdAt)}</div>
              </div>
            </div>
            
            <div className="flex-shrink-0 flex flex-col gap-3">
              {hasApplied ? (
                <button disabled className="btn-secondary min-w-[160px] justify-center opacity-100 cursor-default bg-emerald-50 text-emerald-700 border-emerald-200">
                  <FiCheckCircle /> Applied
                </button>
              ) : (
                <button onClick={handleApply} disabled={applying} className="btn-primary min-w-[160px] justify-center shadow-lg shadow-blue-500/30">
                  {applying ? <LoadingSpinner size="sm" color="white" /> : 'Apply Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="premium-card p-6 sm:p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Job Description</h3>
            <div
              className="prose dark:prose-invert max-w-none text-gray-600 dark:text-slate-300"
              dangerouslySetInnerHTML={{ __html: getSanitizedHtml(opp.description) }}
            />
          </section>

          {opp.eligibility && (
            <section className="premium-card p-6 sm:p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Eligibility</h3>
              <div
                className="prose dark:prose-invert max-w-none text-gray-600 dark:text-slate-300"
                dangerouslySetInnerHTML={{ __html: getSanitizedHtml(opp.eligibility) }}
              />
            </section>
          )}

          {opp.requiredSkills?.length > 0 && (
            <section className="premium-card p-6 sm:p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Required Skills</h3>
              <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-slate-300 whitespace-pre-wrap">
                {opp.requiredSkills.join(', ')}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="premium-card p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Skills Required</h3>
            <div className="flex flex-wrap gap-2">
              {(opp.requiredSkills || opp.skills || []).map((skill, i) => (
                <span key={i} className="skill-tag text-sm bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300">
                  {skill}
                </span>
              ))}
            </div>
          </section>

          <section className="premium-card p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Key Details</h3>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Category</div>
                <div className="font-medium text-gray-900 dark:text-white">{opp.category || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Work Mode</div>
                <div className="font-medium text-gray-900 dark:text-white">{opp.workMode || opp.locationType || 'N/A'}</div>
              </div>
              {opp.applicationDeadline && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Application Deadline</div>
                  <div className="font-medium text-red-600 font-bold">{new Date(opp.applicationDeadline).toLocaleDateString()}</div>
                </div>
              )}
            </div>
          </section>

          <button 
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 mx-auto transition-colors"
          >
            <FiAlertTriangle /> Report this opportunity
          </button>
        </div>
      </div>

      <ReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} opportunityId={opp._id} />
    </div>
  );
};

export default OpportunityDetails;
