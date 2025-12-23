import { Search, Filter, ChevronDown, Users, Calendar } from "lucide-react";

export default function FiltersSection({
  classes,
  selectedClass,
  setSelectedClass,
  searchTerm,
  setSearchTerm,
  studentStatusFilter,
  setStudentStatusFilter,
  sections = [],
  selectedSection = "all",
  setSelectedSection,
  feeMonths = [],
  selectedFeeMonth = "all",
  setSelectedFeeMonth
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Class Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Users size={14} />
            Select Class
          </label>
          <div className="relative">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
            >
              <option value="all">All Classes</option>
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

        {/* Section Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Section
          </label>
          <div className="relative">
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
              disabled={sections.length === 0}
            >
              <option value="all">All Sections</option>
              {sections.map((section) => (
                <option key={section} value={section}>
                  Section {section}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-3 pointer-events-none">
              <Filter className="text-gray-400" size={20} />
            </div>
          </div>
        </div>

        {/* Fee Month Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Calendar size={14} />
            Fee Month
          </label>
          <div className="relative">
            <select
              value={selectedFeeMonth}
              onChange={(e) => setSelectedFeeMonth(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
            >
              <option value="all">All Months</option>
              {feeMonths.map((month) => (
                <option key={month} value={month}>
                  {month.charAt(0).toUpperCase() + month.slice(1)}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-3 pointer-events-none">
              <ChevronDown className="text-gray-400" size={20} />
            </div>
          </div>
        </div>

        {/* Fee Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fee Status
          </label>
          <div className="relative">
            <select
              value={studentStatusFilter}
              onChange={(e) => setStudentStatusFilter(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="absolute right-3 top-3 pointer-events-none">
              <Filter className="text-gray-400" size={20} />
            </div>
          </div>
        </div>

        {/* Search Bar - Full Width */}
        <div className="w-[400px] mt-4 md:mt-0 md:col-span-2 lg:col-span-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Students
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, ID, father's name, class, or section..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          
        </div>
      </div>

     
    </div>
  );
}