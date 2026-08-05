const FilterSidebar = ({ filters, updateFilter, clearFilters }) => {
  const categories = ['Jobs', 'Internships', 'Freelancing', 'Hackathons', 'Scholarships'];
  const locations = ['Remote', 'Hybrid', 'Onsite'];
  const workModes = ['Remote', 'Hybrid', 'Onsite'];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-gray-900 dark:text-white">Filters</h3>
        <button onClick={clearFilters} className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">Clear all</button>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 dark:text-slate-200 mb-3 text-sm">Category</h4>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat} className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" name="category" checked={filters.category === cat} onChange={() => updateFilter('category', filters.category === cat ? '' : cat)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-gray-600 dark:text-slate-300 text-sm">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 dark:text-slate-200 mb-3 text-sm">Location</h4>
        <div className="space-y-2">
          {locations.map((loc) => (
            <label key={loc} className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" name="location" checked={filters.locationType === loc.toLowerCase()} onChange={() => updateFilter('locationType', filters.locationType === loc.toLowerCase() ? '' : loc.toLowerCase())} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-gray-600 dark:text-slate-300 capitalize text-sm">{loc}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 dark:text-slate-200 mb-3 text-sm">Work Mode</h4>
        <select value={filters.workMode || ''} onChange={(e) => updateFilter('workMode', e.target.value)} className="form-input w-full text-sm">
          <option value="">All modes</option>
          {workModes.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
        </select>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 dark:text-slate-200 mb-3 text-sm">Minimum Salary</h4>
        <input type="number" placeholder="e.g. 50000" onChange={(e) => updateFilter('salary', e.target.value)} className="form-input w-full text-sm" />
      </div>
    </div>
  );
};

export default FilterSidebar;
