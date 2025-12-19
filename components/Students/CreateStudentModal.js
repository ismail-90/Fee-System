'use client';
import { useState, useEffect } from "react";
import { X, PlusCircle, User, Loader2 } from "lucide-react";
import { getCampusesAPI } from "../../Services/campusService";
import { useAuth } from '@/context/AuthContext';
import toast from "react-hot-toast";

export default function CreateStudentModal({ isOpen, onClose, onCreateStudent }) {
  const { user } = useAuth();
  const [campuses, setCampuses] = useState([]);
  const [loadingCampuses, setLoadingCampuses] = useState(false);
  const [selectedCampusName, setSelectedCampusName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    student: {
      name: "",
      fatherName: "",
      className: "1",
      campusId: ""
    },
    fee: {
      feeMonth: "",
      tutionFee: 0,
      labsFee: 0,
      examFeeTotal: 0,
      extraFee: 0,
      others: 0,
      lateFeeFine: 0,
      prevBal: 0,
    }
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      student: {
        name: "",
        fatherName: "",
        className: "1",
        campusId: ""
      },
      fee: {
        feeMonth: "",
        tutionFee: 0,
        labsFee: 0,
        examFeeTotal: 0,
        extraFee: 0,
        others: 0,
        lateFeeFine: 0,
        prevBal: 0,
      }
    });
    setSelectedCampusName("");
  };

  // Fetch campuses based on user role
  useEffect(() => {
    if (isOpen && user) {
      const fetchCampuses = async () => {
        setLoadingCampuses(true);
        try {
          if (user.role === 'accountant') {
            // For accountant, use their campus_id from profile
            const campusId = user.campus_id || user.profile?.campus_id || "6930155397209b93b965d546";
            const campusName = user.campus?.name || "Royal Campus Har";
            
            setFormData(prev => ({
              ...prev,
              student: {
                ...prev.student,
                campusId: campusId
              }
            }));
            setSelectedCampusName(campusName);
          } else if (user.role === 'admin') {
            // For admin, fetch all campuses
            const response = await getCampusesAPI();
            console.log("Campuses API Response:", response);
            
            let campusesData = [];
            
            if (response.campuses && Array.isArray(response.campuses)) {
              campusesData = response.campuses;
            } else if (response.success && Array.isArray(response.data)) {
              campusesData = response.data;
            } else if (Array.isArray(response)) {
              campusesData = response;
            }
            
            if (campusesData.length > 0) {
              setCampuses(campusesData);
              setFormData(prev => ({
                ...prev,
                student: {
                  ...prev.student,
                  campusId: campusesData[0]._id
                }
              }));
              setSelectedCampusName(campusesData[0].name);
            } else {
              console.warn("No campuses found in response");
              toast.error("No campuses available");
            }
          }
        } catch (error) {
          console.error("Error fetching campuses:", error);
          toast.error("Failed to load campuses");
        } finally {
          setLoadingCampuses(false);
        }
      };

      fetchCampuses();
    }
  }, [isOpen, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('student.')) {
      const fieldName = name.split('.')[1];
      
      if (fieldName === 'campusId' && user?.role === 'admin') {
        const selectedCampus = campuses.find(campus => campus._id === value);
        setSelectedCampusName(selectedCampus?.name || "");
      }
      
      setFormData({
        ...formData,
        student: {
          ...formData.student,
          [fieldName]: value
        }
      });
    } else if (name.startsWith('fee.')) {
      const fieldName = name.split('.')[1];
      
      // Parse number fields
      const numericFields = [
        'tutionFee', 'labsFee', 'examFeeTotal', 'extraFee', 
        'others', 'lateFeeFine', 'prevBal'
      ];
      
      const newValue = numericFields.includes(fieldName) 
        ? (value === "" ? 0 : parseFloat(value))
        : value;
      
      setFormData({
        ...formData,
        fee: {
          ...formData.fee,
          [fieldName]: newValue
        }
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.student.name.trim()) {
      toast.error("Please enter student name");
      return;
    }
    if (!formData.student.fatherName.trim()) {
      toast.error("Please enter father's name");
      return;
    }
    if (!formData.fee.feeMonth) {
      toast.error("Please select fee month");
      return;
    }
    if (!formData.student.campusId) {
      toast.error("Please select campus");
      return;
    }
    
    setSubmitting(true);
    
    try {
      const apiData = {
        student: {
          name: formData.student.name.trim(),
          fatherName: formData.student.fatherName.trim(),
          className: formData.student.className,
          campusId: formData.student.campusId
        },
        fee: {
          feeMonth: formData.fee.feeMonth,
          tutionFee: formData.fee.tutionFee,
          labsFee: formData.fee.labsFee,
          examFeeTotal: formData.fee.examFeeTotal,
          extraFee: formData.fee.extraFee,
          others: formData.fee.others,
          lateFeeFine: formData.fee.lateFeeFine,
          prevBal: formData.fee.prevBal
        }
      };
      
      console.log("Submitting student data:", apiData);
      
      // Pass data as-is to parent component
      await onCreateStudent(apiData);
      
      // If successful, close modal
      onClose();
      
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error("Failed to create student");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <PlusCircle className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">Add New Student</h2>
              <p className="text-blue-100">Fill in the student details below</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column - Student Information */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Student Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student Name *
                    </label>
                    <input
                      type="text"
                      name="student.name"
                      value={formData.student.name}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Enter student name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Father Name *
                    </label>
                    <input
                      type="text"
                      name="student.fatherName"
                      value={formData.student.fatherName}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Enter father's name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class *
                    </label>
                    <select
                      name="student.className"
                      value={formData.student.className}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={`${i + 1}`}>
                          Class {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Campus *
                    </label>
                    {loadingCampuses ? (
                      <div className="flex items-center gap-2 py-2.5">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        <span className="text-sm text-gray-500">Loading campuses...</span>
                      </div>
                    ) : user?.role === 'accountant' ? (
                      // For Accountant - Read only field
                      <div>
                        <input
                          type="text"
                          value={selectedCampusName}
                          readOnly
                          disabled={submitting}
                          className="w-full px-4 py-2.5 border border-gray-300 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Accountant can only add students to their assigned campus
                        </p>
                        <input
                          type="hidden"
                          name="student.campusId"
                          value={formData.student.campusId}
                        />
                      </div>
                    ) : user?.role === 'admin' ? (
                      // For Admin - Dropdown with all campuses
                      <div>
                        <select
                          name="student.campusId"
                          value={formData.student.campusId}
                          onChange={handleChange}
                          required
                          disabled={submitting || campuses.length === 0}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {campuses.length === 0 ? (
                            <option value="">No campuses available</option>
                          ) : (
                            <>
                              <option value="">Select Campus</option>
                              {campuses.map(campus => (
                                <option key={campus._id} value={campus._id}>
                                  {campus.name} - {campus.city}
                                </option>
                              ))}
                            </>
                          )}
                        </select>
                        {campuses.length === 0 && !loadingCampuses && (
                          <p className="text-xs text-red-500 mt-1">
                            No campuses found. Please contact administrator.
                          </p>
                        )}
                        {selectedCampusName && (
                          <p className="text-xs text-green-600 mt-1">
                            Selected: {selectedCampusName}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        Campus selection not available for your role
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Fee Information */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Fee Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fee Month *
                    </label>
                    <select
                      name="fee.feeMonth"
                      value={formData.fee.feeMonth}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Month</option>
                      <option value="jan">January</option>
                      <option value="feb">February</option>
                      <option value="mar">March</option>
                      <option value="apr">April</option>
                      <option value="may">May</option>
                      <option value="jun">June</option>
                      <option value="jul">July</option>
                      <option value="aug">August</option>
                      <option value="sep">September</option>
                      <option value="oct">October</option>
                      <option value="nov">November</option>
                      <option value="dec">December</option>
                    </select>
                  </div>

                  {/* Basic Fees */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Basic Fees (Rs.)</h4>
                    {[
                      { key: 'tutionFee', label: 'Tuition Fee' },
                      { key: 'labsFee', label: 'Labs Fee' },
                      { key: 'examFeeTotal', label: 'Exam Fee Total' },
                      { key: 'extraFee', label: 'Extra Fee' },
                      { key: 'others', label: 'Others' },
                      { key: 'lateFeeFine', label: 'Late Fee Fine' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between">
                        <label className="text-sm text-gray-600">{label}:</label>
                        <input
                          type="number"
                          name={`fee.${key}`}
                          value={formData.fee[key]}
                          onChange={handleChange}
                          min="0"
                          disabled={submitting}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-right disabled:opacity-50"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Previous Balance */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Previous Balance (Rs.):</label>
                      <input
                        type="number"
                        name="fee.prevBal"
                        value={formData.fee.prevBal}
                        onChange={handleChange}
                        min="0"
                        disabled={submitting}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-right disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-lg hover:from-blue-700 hover:to-purple-800 transition-all font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Creating..." : "Create Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}