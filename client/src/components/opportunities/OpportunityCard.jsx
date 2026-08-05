import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiClock, FiDollarSign, FiBriefcase } from 'react-icons/fi';
import { timeAgo, capitalize } from '../../utils/helpers';

const OpportunityCard = ({ opportunity }) => {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="premium-card p-5 h-full flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center overflow-hidden border border-blue-100 dark:border-slate-700 flex-shrink-0">
            {opportunity.companyLogo ? (
              <img src={opportunity.companyLogo} alt={opportunity.companyName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-blue-600 font-bold text-lg">{opportunity.companyName?.[0] || 'O'}</span>
            )}
          </div>
          <span className={`badge capitalize ${opportunity.type === 'job' ? 'badge-blue' : opportunity.type === 'internship' ? 'badge-purple' : 'badge-green'}`}>
            {opportunity.type}
          </span>
        </div>

        <Link to={`/opportunities/${opportunity._id}`} className="no-underline">
          <h3 className="text-[1.125rem] font-bold text-gray-900 dark:text-white mb-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
            {opportunity.title}
          </h3>
        </Link>
        <div className="text-[0.9375rem] font-medium text-blue-600 dark:text-blue-400 mb-4">
          {opportunity.companyName}
        </div>

        <div className="flex flex-wrap gap-y-2 gap-x-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5"><FiMapPin /> <span className="capitalize">{opportunity.locationType}</span></div>
          <div className="flex items-center gap-1.5"><FiBriefcase /> {opportunity.category}</div>
          {opportunity.salaryMax && (
            <div className="flex items-center gap-1.5"><FiDollarSign /> {opportunity.salaryMin ? `${opportunity.salaryMin} - ` : ''}{opportunity.salaryMax}</div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {opportunity.skills?.slice(0, 3).map((skill, i) => (
            <span key={i} className="skill-tag text-xs py-0.5 px-2 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-none">{skill}</span>
          ))}
          {opportunity.skills?.length > 3 && (
            <span className="skill-tag text-xs py-0.5 px-2 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-none">+{opportunity.skills.length - 3}</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-slate-800">
        <div className="text-xs text-gray-400 flex items-center gap-1.5">
          <FiClock /> {timeAgo(opportunity.createdAt)}
        </div>
        <Link to={`/opportunities/${opportunity._id}`} className="btn-primary py-2 px-4 text-sm">
          Apply Now
        </Link>
      </div>
    </motion.div>
  );
};

export default OpportunityCard;
