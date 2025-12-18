import { Search, Filter, ChevronDown } from "lucide-react";

export default function FiltersSection({
  classes,
  selectedClass,
  setSelectedClass,
  searchTerm,
  setSearchTerm,
  feeStatusFilter,
  setFeeStatusFilter
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 border border-gray-200">
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
          <div className="relative">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
            >
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-3 pointer-events-none">
              <ChevronDown className="text-gray-400" size={20} />
            </div>
          </div>
        </div>

        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Students</label>
          <div className="relative">
            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, ID, or father's name..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">Fee Status</label>
          <div className="relative">
            <select
              value={feeStatusFilter}
              onChange={(e) => setFeeStatusFilter(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
            >
              <option value="all">All Students</option>
              <option value="paid">Paid Only</option>
              <option value="defaulter">Defaulters Only</option>
            </select>
            <div className="absolute right-3 top-3 pointer-events-none">
              <Filter className="text-gray-400" size={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}