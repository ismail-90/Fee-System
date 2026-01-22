'use client';
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Loader2, Search, Percent, DollarSign, ArrowRight,
  CheckCircle, XCircle, AlertCircle
} from "lucide-react";
import DashboardCards from '../../components/DashboardCards';
import AppLayout from '../../components/AppLayout';
import { increaseFeeAPI } from "../../Services/feeService";

export default function AccountantDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // States
  const [selectedClass, setSelectedClass] = useState("");
  const [updateType, setUpdateType] = useState("percentage"); // 'percentage' or 'amount'
  const [inputValue, setInputValue] = useState("");
  const [year, setYear] = useState(new Date().getFullYear()); // Current year as default
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  // Class list - you can fetch this from API or keep it static
  const classList = [
    "Play Group", "Nursery", "prep", "1", "2", "3", "4", "5", 
    "6", "7", "8", "9", "10", "11", "12"
  ];

  // Years dropdown (current year and next 2 years)
  const years = [
    new Date().getFullYear() - 1,
    new Date().getFullYear(),
    new Date().getFullYear() + 1,
    new Date().getFullYear() + 2,
  ];

  // Handle fee update with actual API call
  const handleUpdateFee = async () => {
    if (!selectedClass) {
      return setMessage({ type: "error", text: "Please select a class first." });
    }
    if (!inputValue || Number(inputValue) <= 0) {
      return setMessage({ type: "error", text: "Please enter a valid percentage or amount." });
    }
    if (!year) {
      return setMessage({ type: "error", text: "Please select a year." });
    }

    setIsProcessing(true);
    setMessage({ type: "", text: "" });

    try {
      // Prepare payload based on update type
      const payload = {
        className: selectedClass,
        year: Number(year),
        increaseType: updateType, // 'percentage' or 'amount'
      };

      // Add the appropriate field based on update type
      if (updateType === "percentage") {
        payload.percentage = Number(inputValue);
      } else {
        payload.amount = Number(inputValue);
      }

      // Call the actual API
      const response = await increaseFeeAPI(payload);

      if (response.success) {
        const successMessage = updateType === "percentage" 
          ? `Successfully increased fees by ${inputValue}% for class ${selectedClass} for year ${year}!`
          : `Successfully increased fees by Rs. ${inputValue} for class ${selectedClass} for year ${year}!`;
        
        setMessage({ type: "success", text: successMessage });
        setInputValue(""); // Clear input on success
      } else {
        throw new Error(response.message || "Failed to update fees");
      }

    } catch (error) {
      console.error("Fee update error:", error);
      setMessage({ 
        type: "error", 
        text: error.message || "Failed to update fees. Please try again." 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 p-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, Accountant!
            </p>
          </div>

          {/* Dashboard Cards */}
          <DashboardCards />

          {/* Fee Update Section */}
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">
              Update Tuition Fee
            </h2>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                  
                  {/* 1. Class Selection */}
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Class
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none transition cursor-pointer"
                      >
                        <option value="">-- Choose Class --</option>
                        {classList.map((cls) => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-3 pointer-events-none text-gray-500">
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  </div>

                  {/* 2. Year Selection */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Academic Year
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none transition cursor-pointer"
                    >
                      <option value="">Select Year</option>
                      {years.map((yr) => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Update Type Toggle */}
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Update By
                    </label>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                      <button
                        onClick={() => { setUpdateType("percentage"); setInputValue(""); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all duration-200
                        ${updateType === 'percentage' 
                          ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' 
                          : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <Percent size={16} /> Percentage
                      </button>
                      <button
                        onClick={() => { setUpdateType("amount"); setInputValue(""); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all duration-200
                        ${updateType === 'amount' 
                          ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' 
                          : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <DollarSign size={16} /> Amount
                      </button>
                    </div>
                  </div>

                  {/* 4. Value Input */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {updateType === 'percentage' ? 'Percentage (%)' : 'Amount (Rs.)'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step={updateType === "percentage" ? "0.1" : "1"}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={updateType === 'percentage' ? 'e.g. 10' : 'e.g. 500'}
                        className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                      <div className="absolute right-3 top-3 pointer-events-none text-gray-400 font-semibold">
                        {updateType === 'percentage' ? '%' : 'Rs'}
                      </div>
                    </div>
                  </div>

                  {/* 5. Submit Button */}
                  <div className="md:col-span-2">
                    <button
                      onClick={handleUpdateFee}
                      disabled={isProcessing || !selectedClass || !inputValue || !year}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-medium shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          Updating...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          Update Fee
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Success/Error Message Area */}
                {message.text && (
                  <div className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${
                    message.type === 'success' 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {message.type === 'success' ? (
                      <CheckCircle size={20} className="flex-shrink-0" />
                    ) : (
                      <AlertCircle size={20} className="flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium">{message.text}</span>
                    {message.type === 'success' && (
                      <button
                        onClick={() => setMessage({ type: "", text: "" })}
                        className="ml-auto text-gray-500 hover:text-gray-700"
                      >
                        <XCircle size={20} />
                      </button>
                    )}
                  </div>
                )}

                {/* Preview Logic */}
                {selectedClass && inputValue && year && (
                  <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-800 text-sm font-semibold mb-1">
                      <AlertCircle size={16} />
                      Preview Update
                    </div>
                    <p className="text-sm text-blue-700">
                      All students in <strong>Class {selectedClass}</strong> for academic year <strong>{year}</strong> will have their Tuition Fee increased by <strong>{inputValue}{updateType === 'percentage' ? '%' : ' Rs'}</strong>.
                    </p>
                    <div className="mt-2 text-xs text-blue-600">
                      Payload that will be sent: <code className="ml-1 bg-blue-100 px-2 py-1 rounded">{`{ className: "${selectedClass}", year: ${year}, increaseType: "${updateType}", ${updateType === "percentage" ? `percentage: ${inputValue}` : `amount: ${inputValue}`} }`}</code>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}