import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiZap } from 'react-icons/fi';

const AuthLayout = () => (
  <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <Outlet />
    </motion.div>
  </div>
);

export default AuthLayout;
