import { User, CheckCircle, XCircle, DollarSign } from "lucide-react";

export default function StatsCards({ students }) {
  const totalRevenue = students.reduce((sum, s) => sum + (s.allTotal || 0), 0);
  const paidStudents = students.filter(s => s.curBalance <= 0).length;
  const defaulters = students.filter(s => s.curBalance > 0).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Students</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{students.length}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <User className="text-blue-600" size={24} />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Paid Students</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{paidStudents}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <CheckCircle className="text-green-600" size={24} />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Defaulters</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{defaulters}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <XCircle className="text-red-600" size={24} />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              Rs. {totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <DollarSign className="text-purple-600" size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}