import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiClock, FiXCircle, FiBookmark, FiExternalLink } from 'react-icons/fi';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { timeAgo, capitalize, getStatusClass } from '../../utils/helpers';
import { Link } from 'react-router-dom';

const Applications = () => {
  const [activeTab, setActiveTab] = useState('applied'); // 'saved', 'applied', 'closed'
  const [applications, setApplications] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [appRes, bookRes] = await Promise.all([
          api.get('/applications/my'),
          api.get('/opportunities/bookmarks'),
        ]);
        setApplications(appRes.data.applications);
        setBookmarks(bookRes.data.bookmarks);
      } catch (err) {
        console.error('Failed to fetch applications', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getFilteredItems = () => {
    if (activeTab === 'saved') {
      return bookmarks.map(b => ({ ...b, isBookmark: true }));
    }
    if (activeTab === 'closed') {
      return applications.filter(a => ['rejected', 'withdrawn', 'closed'].includes(a.status));
    }
    return applications.filter(a => !['rejected', 'withdrawn', 'closed'].includes(a.status));
  };

  const items = getFilteredItems();

  return (
    <div className="page-enter max-w-5xl mx-auto pb-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">Application Tracker</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Track your saved opportunities, active applications, and past history.</p>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-slate-800 pb-2">
        {['saved', 'applied', 'closed'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-1 font-semibold text-[0.9375rem] capitalize transition-colors relative ${activeTab === tab ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'}`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="app-tab" className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-blue-600 dark:bg-blue-400" />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
          {activeTab === 'saved' && <FiBookmark className="mx-auto text-4xl text-gray-400 mb-4" />}
          {activeTab === 'applied' && <FiCheckCircle className="mx-auto text-4xl text-gray-400 mb-4" />}
          {activeTab === 'closed' && <FiXCircle className="mx-auto text-4xl text-gray-400 mb-4" />}
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No {activeTab} opportunities found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Start exploring to find your next big opportunity.</p>
          <Link to="/opportunities" className="btn-primary">Browse Opportunities</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item, i) => {
            const opp = item.isBookmark ? item.opportunity : item.opportunity;
            if (!opp) return null;
            
            return (
              <motion.div 
                key={item._id} 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="premium-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center overflow-hidden border border-blue-100 dark:border-slate-700 flex-shrink-0">
                    {opp.companyLogo ? (
                      <img src={opp.companyLogo} alt={opp.companyName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-blue-600 font-bold text-lg">{opp.companyName?.[0]}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{opp.title}</h3>
                    <div className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-2">
                      <span>{opp.companyName}</span>
                      <span>•</span>
                      <span className="capitalize">{opp.type}</span>
                      <span>•</span>
                      <span>{opp.location || opp.locationType}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                  {!item.isBookmark ? (
                    <div className="text-right flex-1 sm:flex-none">
                      <span className={`badge ${getStatusClass(item.status)} capitalize`}>
                        {activeTab === 'closed' ? 'Closed' : item.status.replace('_', ' ')}
                      </span>
                      <div className="text-xs text-gray-400 mt-1">Applied {timeAgo(item.appliedAt)}</div>
                    </div>
                  ) : (
                    <div className="text-right flex-1 sm:flex-none">
                      <span className="badge badge-orange">Saved</span>
                      <div className="text-xs text-gray-400 mt-1">Saved {timeAgo(item.createdAt)}</div>
                    </div>
                  )}
                  <Link to={`/opportunities/${opp._id}`} className="btn-secondary px-3 py-2 text-sm flex-shrink-0">
                    View <FiExternalLink />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Applications;
