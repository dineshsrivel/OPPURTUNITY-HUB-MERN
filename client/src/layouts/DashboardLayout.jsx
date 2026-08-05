import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/common/Sidebar';
import DashboardHeader from '../components/common/DashboardHeader';
import { setSidebarMobile } from '../store/slices/uiSlice';

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const { sidebarOpen, sidebarMobile } = useSelector(state => state.ui);

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile overlay backdrop */}
      <AnimatePresence>
        {sidebarMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => dispatch(setSidebarMobile(false))}
          />
        )}
      </AnimatePresence>

      {/* Main content area dynamically offset from fixed sidebar */}
      <div
        className={`min-h-screen flex flex-col transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'lg:pl-[260px]' : 'lg:pl-[72px]'
        }`}
      >
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
