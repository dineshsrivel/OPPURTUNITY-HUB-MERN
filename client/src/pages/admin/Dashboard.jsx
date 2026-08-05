import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiShield, FiBriefcase, FiCheck, FiX, FiList, FiClock, FiActivity, FiTrendingUp } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { timeAgo } from '../../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#2563EB', '#D97706', '#059669', '#7C3AED', '#EF4444', '#0891B2', '#4F46E5'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/admin/stats');
        setData(res.data);
      } catch (_) {
        toast.error('Failed to load dashboard data');
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  const { stats, recentUsers, recentApps, recentOpps } = data || {};

  const statCards = [
    { label: 'Total Users',        value: stats?.totalUsers,        color: '#2563EB', bg: '#EFF6FF', icon: FiUsers, link: '/admin/users' },
    { label: 'Opportunities',      value: stats?.totalOpportunities,color: '#D97706', bg: '#FEF3C7', icon: FiBriefcase, link: '/admin/opportunities' },
    { label: 'Categories',         value: stats?.totalCategories,   color: '#059669', bg: '#D1FAE5', icon: FiList, link: '/admin/categories' },
    { label: 'Active Opps',        value: stats?.activeOpps,        color: '#10B981', bg: '#ECFDF5', icon: FiActivity, link: '/admin/opportunities' },
    { label: 'Expired Opps',       value: stats?.expiredOpps,       color: '#EF4444', bg: '#FEF2F2', icon: FiX, link: '/admin/opportunities' },
    { label: 'New This Month',     value: stats?.newOppsThisMonth,  color: '#8B5CF6', bg: '#F5F3FF', icon: FiTrendingUp, link: '/admin/opportunities' },
  ];

  return (
    <div className="page-enter max-w-6xl mx-auto pb-10">
      <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-display">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Platform overview and management.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/opportunities" className="btn-outline px-4 py-2"><FiBriefcase /> Manage Opportunities</Link>
          <Link to="/admin/users" className="btn-primary px-4 py-2"><FiUsers /> Manage Users</Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {statCards.map((s, i) => (
          <Link to={s.link} key={s.label} className="no-underline">
            <motion.div className="stat-card flex items-center gap-4 hover:shadow-lg transition-shadow cursor-pointer h-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg, color: s.color }}>
                <s.icon size={22} />
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">{s.label}</div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-display leading-none">{s.value ?? 0}</div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Items */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Recent Opportunities */}
          <div className="premium-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recently Added Opportunities</h2>
              <Link to="/admin/opportunities" className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline">View All</Link>
            </div>
            
            {recentOpps?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No opportunities found</div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-slate-800">
                {recentOpps?.map(opp => (
                  <div key={opp._id} className="py-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {opp.companyLogo ? <img src={opp.companyLogo} alt="" className="w-full h-full object-cover" /> : <FiBriefcase className="text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 dark:text-white truncate">{opp.title}</div>
                      <div className="text-sm text-gray-500 truncate">{opp.companyName} • <span className="capitalize">{opp.type}</span></div>
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                      <FiClock /> {timeAgo(opp.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Users */}
          <div className="premium-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">New Users</h2>
              <Link to="/admin/users" className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline">View All</Link>
            </div>
            
            {recentUsers?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No recent users</div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-slate-800">
                {recentUsers?.map(user => (
                  <div key={user._id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : user.name[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <span className="badge badge-gray capitalize text-xs">{user.role}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Charts */}
        <div className="space-y-8">
          <div className="premium-card p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <FiList className="text-blue-600" /> Opportunities by Category
            </h2>
            <div className="h-[250px] w-full">
              {stats?.categoryStats?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.categoryStats} dataKey="count" nameKey="_id" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2}>
                      {stats.categoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value, name) => [value, name.charAt(0).toUpperCase() + name.slice(1)]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">No data available</div>
              )}
            </div>
            {/* Custom Legend */}
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              {stats?.categoryStats?.map((cat, i) => (
                <div key={cat._id} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 capitalize">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  {cat._id} ({cat.count})
                </div>
              ))}
            </div>
          </div>

          <div className="premium-card p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <FiTrendingUp className="text-purple-600" /> Monthly Growth
            </h2>
            <div className="h-[200px] w-full">
              {stats?.monthlyOpps?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.monthlyOpps.map(d => ({ name: `${d._id.month}/${d._id.year}`, count: d.count }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                    <RechartsTooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">No data available</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
