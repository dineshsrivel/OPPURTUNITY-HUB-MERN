/**
 * Format a salary range for display
 */
export const formatSalary = (min, max, unit = 'per annum', currency = 'INR') => {
  if (!min && !max) return 'Compensation not disclosed';
  const sym = currency === 'INR' ? '₹' : '$';
  const fmt = (n) => n >= 100000 ? `${(n / 100000).toFixed(1)}L` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n;
  if (min && max) return `${sym}${fmt(min)} – ${sym}${fmt(max)} ${unit}`;
  if (min) return `${sym}${fmt(min)}+ ${unit}`;
  return `Up to ${sym}${fmt(max)} ${unit}`;
};

/**
 * Get days remaining until a deadline
 */
export const getDaysRemaining = (deadline) => {
  if (!deadline) return null;
  const diff = new Date(deadline) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Format deadline as a human-readable string
 */
export const formatDeadline = (deadline) => {
  if (!deadline) return 'No deadline';
  const days = getDaysRemaining(deadline);
  if (days < 0)   return 'Expired';
  if (days === 0) return 'Ends today!';
  if (days === 1) return '1 day left';
  if (days <= 7)  return `${days} days left`;
  return new Date(deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

/**
 * Relative time (e.g. "2 hours ago")
 */
export const timeAgo = (dateStr) => {
  const diff    = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1)    return 'Just now';
  if (minutes < 60)   return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours   < 24)   return `${hours}h ago`;
  const days  = Math.floor(hours / 24);
  if (days    < 30)   return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

/**
 * Capitalize first letter
 */
export const capitalize = (str = '') => str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');

/**
 * Get status badge class
 */
export const getStatusClass = (status) => {
  const map = {
    applied:      'status-applied',
    under_review: 'status-under_review',
    interview:    'status-interview',
    selected:     'status-selected',
    rejected:     'status-rejected',
    withdrawn:    'status-withdrawn',
  };
  return map[status] || 'badge-gray';
};

/**
 * Get type badge class
 */
export const getTypeClass = (type) => {
  const map = { job: 'type-job', internship: 'type-internship', hackathon: 'type-hackathon', scholarship: 'type-scholarship' };
  return map[type] || 'badge-gray';
};

/**
 * Truncate string
 */
export const truncate = (str = '', max = 120) =>
  str.length > max ? str.slice(0, max) + '…' : str;
