import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiExternalLink } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appRes, bookRes] = await Promise.all([
          api.get('/applications/my'),
          api.get('/opportunities/bookmarks'),
        ]);
        
        const apps = appRes.data.applications.map(a => ({ ...a.opportunity, typeContext: 'applied' }));
        const books = bookRes.data.bookmarks.map(b => ({ ...b.opportunity, typeContext: 'saved' }));
        
        // Merge, deduplicate by ID, and filter those with deadlines
        const map = new Map();
        [...apps, ...books].forEach(item => {
          if (item && item.deadline && !map.has(item._id)) {
            map.set(item._id, item);
          }
        });
        
        const sortedEvents = Array.from(map.values()).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        setEvents(sortedEvents);
      } catch (err) {
        console.error('Failed to fetch calendar events', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="page-enter max-w-4xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display flex items-center gap-3">
          <FiCalendar className="text-blue-600" /> Opportunity Calendar
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Upcoming deadlines for your saved and applied opportunities.</p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
          <FiCalendar className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No upcoming deadlines</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">You have no saved or applied opportunities with upcoming deadlines.</p>
          <Link to="/opportunities" className="btn-primary">Browse Opportunities</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event, i) => {
            const deadlineDate = new Date(event.deadline);
            const isPast = deadlineDate < new Date();
            
            return (
              <motion.div 
                key={event._id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className={`premium-card p-5 border-l-4 ${isPast ? 'border-l-gray-400' : 'border-l-blue-500'} flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${isPast ? 'bg-gray-100 text-gray-500 dark:bg-slate-800' : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30'}`}>
                    <span className="text-xs font-bold uppercase">{deadlineDate.toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-xl font-bold leading-none">{deadlineDate.getDate()}</span>
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${isPast ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                      {event.title}
                    </h3>
                    <div className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                      {event.companyName} • <span className="capitalize">{event.type}</span> • {event.typeContext === 'applied' ? 'Applied' : 'Saved'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className={`flex items-center gap-1 text-sm ${isPast ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                    <FiClock /> {isPast ? 'Expired' : 'Due by 11:59 PM'}
                  </div>
                  <Link to={`/opportunities/${event._id}`} className="btn-outline px-3 py-2 text-sm flex-shrink-0">
                    Details <FiExternalLink />
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

export default Calendar;
