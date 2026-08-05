import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiX, FiTrendingUp, FiStar, FiClock, FiBriefcase } from 'react-icons/fi';
import api from '../../services/api';
import OpportunityCard from '../../components/opportunities/OpportunityCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FilterSidebar from '../../components/opportunities/FilterSidebar';

const OpportunitiesList = ({ routeCategory }) => {
  const { category: categoryParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [opportunities, setOpportunities] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const filters = {
    type: searchParams.get('type') || '',
    category: routeCategory || categoryParam || searchParams.get('category') || '',
    locationType: searchParams.get('locationType') || '',
    workMode: searchParams.get('workMode') || '',
    sort: searchParams.get('sort') || 'latest',
  };

  const buildQueryString = () => {
    const params = new URLSearchParams(searchParams);
    if (routeCategory || categoryParam) {
      params.set('category', routeCategory || categoryParam);
    }
    return params.toString();
  };

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const query = buildQueryString();
      const res = await api.get(`/opportunities${query ? `?${query}` : ''}`);
      setOpportunities(res.data.opportunities);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHighlights = async () => {
    try {
      const [featuredRes, latestRes] = await Promise.all([
        api.get('/opportunities?isFeatured=true&limit=4'),
        api.get('/opportunities?limit=4&sort=latest'),
      ]);
      setFeatured(featuredRes.data.opportunities || []);
      setLatest(latestRes.data.opportunities || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHighlights();
  }, []);

  useEffect(() => {
    fetchOpportunities();
    window.scrollTo(0, 0);
  }, [searchParams, routeCategory, categoryParam]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput) params.set('search', searchInput); else params.delete('search');
    setSearchParams(params);
  };

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value); else params.delete(key);
    params.delete('page');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchInput('');
  };

  return (
    <div className="page-enter max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center text-white shadow-glow-lg sm:p-12">
        <h1 className="mb-4 text-3xl font-extrabold sm:text-4xl md:text-5xl">Discover Your Next <span className="text-blue-200">Opportunity</span></h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-blue-100">Find the latest jobs, internships, hackathons, scholarships, and more tailored to your skills.</p>

        <form onSubmit={handleSearch} className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400" />
            <input type="text" placeholder="Search by title, company, or skills..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="w-full rounded-xl border-none py-4 pl-12 pr-4 text-lg text-gray-900 shadow-lg outline-none" />
          </div>
          <button type="submit" className="btn-primary whitespace-nowrap px-8 py-4 text-lg shadow-lg">Search</button>
        </form>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2 flex items-center gap-2 text-blue-600"><FiStar /> Featured</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{featured.length}</div>
          <div className="text-sm text-slate-500">Highlighted opportunities</div>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2 flex items-center gap-2 text-emerald-600"><FiClock /> Latest</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{latest.length}</div>
          <div className="text-sm text-slate-500">Freshly posted recently</div>
        </div>
        <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2 flex items-center gap-2 text-purple-600"><FiTrendingUp /> Trending</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{opportunities.length}</div>
          <div className="text-sm text-slate-500">Visible to students right now</div>
        </div>
      </div>

      {featured.length > 0 && (
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Featured Opportunities</h2>
            <a href="/opportunities?isFeatured=true" className="text-sm font-medium text-blue-600">View all</a>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featured.map((opp) => <OpportunityCard key={opp._id} opportunity={opp} />)}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="lg:hidden flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{total} {total === 1 ? 'Result' : 'Results'}</h2>
          <button onClick={() => setShowMobileFilters(true)} className="btn-outline flex items-center gap-2 px-4 py-2"><FiFilter /> Filters</button>
        </div>

        <div className="hidden lg:block w-72 flex-shrink-0">
          <FilterSidebar filters={filters} updateFilter={updateFilter} clearFilters={clearFilters} />
        </div>

        <AnimatePresence>
          {showMobileFilters && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex justify-end bg-gray-900/50 lg:hidden">
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="h-full w-[85%] max-w-md overflow-y-auto bg-white p-6 dark:bg-slate-900">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h3>
                  <button onClick={() => setShowMobileFilters(false)} className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"><FiX size={24} /></button>
                </div>
                <FilterSidebar filters={filters} updateFilter={updateFilter} clearFilters={clearFilters} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1">
          <div className="mb-6 hidden items-center justify-between lg:flex">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{total} {total === 1 ? 'Result' : 'Results'}</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Sort by:</span>
              <select value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)} className="form-input w-auto py-2 pl-3 pr-8 text-sm">
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="deadline">Deadline</option>
                <option value="highestSalary">Highest Salary</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
          ) : opportunities.length === 0 ? (
            (() => {
              const hasActiveFilters = searchParams.toString().length > 0;
              return hasActiveFilters ? (
                /* Search / filter returned no results */
                <div className="rounded-2xl border border-gray-200 bg-white py-20 text-center dark:border-slate-800 dark:bg-slate-900">
                  <FiSearch className="mx-auto mb-4 text-5xl text-gray-300" />
                  <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">No matching opportunities found</h3>
                  <p className="mx-auto mb-6 max-w-md text-gray-500 dark:text-gray-400">
                    No listings match your current search or filters. Try adjusting your keywords or clearing the filters.
                  </p>
                  <button onClick={clearFilters} className="btn-secondary">Clear All Filters</button>
                </div>
              ) : (
                /* Database is genuinely empty */
                <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-24 text-center px-6">
                  <div className="mx-auto mb-5 w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shadow-inner">
                    <FiBriefcase className="text-3xl text-blue-400" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
                    No opportunities available yet
                  </h3>
                  <p className="mx-auto max-w-md text-gray-500 dark:text-gray-400 leading-relaxed">
                    Please check back later or wait for the administrator to publish new opportunities.
                    {routeCategory && (
                      <><br /><span className="font-medium text-gray-600 dark:text-gray-300 mt-1 block">No opportunities available in the <strong>{routeCategory}</strong> category yet.</span></>
                    )}
                  </p>
                </div>
              );
            })()
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {opportunities.map((opp, i) => (
                <motion.div key={opp._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <OpportunityCard opportunity={opp} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpportunitiesList;
