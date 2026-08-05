import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrash2, FiSearch, FiUsers, FiUserCheck, FiUserX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(''); // 'student', 'admin'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({ search, role: roleFilter, page, limit: 10 }).toString();
      const res = await api.get(`/admin/users?${query}`);
      setUsers(res.data.users);
      setTotalPages(res.data.pages);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter]);

  const handleToggleStatus = async (id) => {
    try {
      await api.put(`/admin/users/${id}/toggle`);
      toast.success('User status updated');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('WARNING: Deleting a user is permanent and will delete all their data. Proceed?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted permanently');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="page-enter max-w-6xl mx-auto pb-10">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">Manage Users</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all students and companies.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select 
            value={roleFilter} 
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="form-input py-2 text-sm w-full sm:w-40"
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>

            <option value="admin">Admins</option>
          </select>
          <div className="relative w-full sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="form-input pl-10 py-2 w-full text-sm"
            />
          </div>
        </div>
      </div>

      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800">
                <th className="py-4 px-6 font-semibold text-gray-600 dark:text-slate-300 text-sm whitespace-nowrap">User</th>
                <th className="py-4 px-6 font-semibold text-gray-600 dark:text-slate-300 text-sm whitespace-nowrap">Role</th>
                <th className="py-4 px-6 font-semibold text-gray-600 dark:text-slate-300 text-sm whitespace-nowrap">Status</th>
                <th className="py-4 px-6 font-semibold text-gray-600 dark:text-slate-300 text-sm whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center"><LoadingSpinner /></td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-gray-500">
                    <FiUsers className="mx-auto text-3xl mb-3 text-gray-300" />
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6 min-w-[250px]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold overflow-hidden border border-blue-100">
                          {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : u.name[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white line-clamp-1">{u.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`badge capitalize ${u.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`flex items-center gap-1.5 text-sm font-medium ${u.isActive ? 'text-green-600' : 'text-red-500'}`}>
                        {u.isActive ? <><FiUserCheck /> Active</> : <><FiUserX /> Suspended</>}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button 
                        onClick={() => handleToggleStatus(u._id)}
                        disabled={u.role === 'admin'}
                        className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${u.isActive ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                        title={u.isActive ? "Suspend User" : "Activate User"}
                      >
                        {u.isActive ? <FiUserX /> : <FiUserCheck />}
                      </button>
                      <button 
                        onClick={() => handleDelete(u._id)}
                        disabled={u.role === 'admin'}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete Permanently"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="py-4 px-6 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center">
            <button 
              disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="btn-outline py-1.5 px-3 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button 
              disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
              className="btn-outline py-1.5 px-3 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
