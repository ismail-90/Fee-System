'use client';
import { useState, useEffect } from "react";
import { X, PlusCircle, User, Loader2 } from "lucide-react";
import { getCampusesAPI } from "../../Services/campusService";
import { useAuth } from '../../context/AuthContext';
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
      campusId: "",
      section: "A"
    },
    fee: {
      ts: 0,
      cs: 0,
      feeMonth: "",
      tutionFee: 0,
      labsFee: 0,
      lateFeeFine: 0,
      extraFee: 0,
      others: 0,
      examFeeTotal: 0,
      examFeeCurrentPaid: 0,
      examFeeBalanced: 0,
      karateFeeTotal: 0,
      karateFeeCurrentPaid: 0,
      karateFeeBalanced: 0,
      admissionFeeTotal: 0,
      admissionFeeCurrentPaid: 0,
      admissionFeeBalanced: 0,
      registrationFee: 0,
      annualChargesTotal: 0,
      annualChargesPaid: 0,
      annualChargesBalanced: 0,
      prevBal: 0,
      feePaid: 0,
      curBalance: 0,
      allTotal: 0,
    }
  });

  // Calculate totals when fee values change
  useEffect(() => {
    const calculateTotals = () => {
      const {
        tutionFee = 0,
        labsFee = 0,
        lateFeeFine = 0,
        extraFee = 0,
        others = 0,
        examFeeTotal = 0,
        examFeeCurrentPaid = 0,
        karateFeeTotal = 0,
        karateFeeCurrentPaid = 0,
        admissionFeeTotal = 0,
        admissionFeeCurrentPaid = 0,
        registrationFee = 0,
        annualChargesTotal = 0,
        annualChargesPaid = 0,
        prevBal = 0,
        feePaid = 0
      } = formData.fee;

      // Calculate balanced amounts
      const examFeeBalanced = Math.max(0, examFeeTotal - examFeeCurrentPaid);
      const karateFeeBalanced = Math.max(0, karateFeeTotal - karateFeeCurrentPaid);
      const admissionFeeBalanced = Math.max(0, admissionFeeTotal - admissionFeeCurrentPaid);
      const annualChargesBalanced = Math.max(0, annualChargesTotal - annualChargesPaid);

      // Calculate current balance
      const currentTotal = tutionFee + labsFee + lateFeeFine + extraFee + others + 
                          examFeeTotal + karateFeeTotal + admissionFeeTotal + 
                          registrationFee + annualChargesTotal + prevBal;
      
      const totalPaid = examFeeCurrentPaid + karateFeeCurrentPaid + 
                       admissionFeeCurrentPaid + annualChargesPaid + feePaid;
      
      const curBalance = Math.max(0, currentTotal - totalPaid);
      const allTotal = currentTotal;

      // Update form data with calculated values
      setFormData(prev => ({
        ...prev,
        fee: {
          ...prev.fee,
          examFeeBalanced,
          karateFeeBalanced,
          admissionFeeBalanced,
          annualChargesBalanced,
          curBalance,
          allTotal
        }
      }));
    };

    calculateTotals();
  }, [
    formData.fee.tutionFee,
    formData.fee.labsFee,
    formData.fee.lateFeeFine,
    formData.fee.extraFee,
    formData.fee.others,
    formData.fee.examFeeTotal,
    formData.fee.examFeeCurrentPaid,
    formData.fee.karateFeeTotal,
    formData.fee.karateFeeCurrentPaid,
    formData.fee.admissionFeeTotal,
    formData.fee.admissionFeeCurrentPaid,
    formData.fee.registrationFee,
    formData.fee.annualChargesTotal,
    formData.fee.annualChargesPaid,
    formData.fee.prevBal,
    formData.fee.feePaid
  ]);

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
        campusId: "",
        section: "A"
      },
      fee: {
        ts: 0,
        cs: 0,
        feeMonth: "",
        tutionFee: 0,
        labsFee: 0,
        lateFeeFine: 0,
        extraFee: 0,
        others: 0,
        examFeeTotal: 0,
        examFeeCurrentPaid: 0,
        examFeeBalanced: 0,
        karateFeeTotal: 0,
        karateFeeCurrentPaid: 0,
        karateFeeBalanced: 0,
        admissionFeeTotal: 0,
        admissionFeeCurrentPaid: 0,
        admissionFeeBalanced: 0,
        registrationFee: 0,
        annualChargesTotal: 0,
        annualChargesPaid: 0,
        annualChargesBalanced: 0,
        prevBal: 0,
        feePaid: 0,
        curBalance: 0,
        allTotal: 0,
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
            const campusId = user.campus?._id || 
                            user.campus_id || 
                            user.profile?.campus?._id;
            
            const campusName = user.campus?.name || 
                             user.campus_name || 
                             user.profile?.campus?.name;
            
            if (!campusId) {
              toast.error("No campus assigned to your account. Please contact administrator.");
              return;
            }
            
            setFormData(prev => ({
              ...prev,
              student: {
                ...prev.student,
                campusId: campusId
              }
            }));
            
            setSelectedCampusName(campusName || "Assigned Campus");
            toast.success(`Campus set to: ${campusName || "Your assigned campus"}`);
            
          } else if (user.role === 'admin') {
            const response = await getCampusesAPI();
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
        'ts', 'cs', 'tutionFee', 'labsFee', 'lateFeeFine', 'extraFee', 
        'others', 'examFeeTotal', 'examFeeCurrentPaid', 'karateFeeTotal',
        'karateFeeCurrentPaid', 'admissionFeeTotal', 'admissionFeeCurrentPaid',
        'registrationFee', 'annualChargesTotal', 'annualChargesPaid',
        'prevBal', 'feePaid'
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
          campusId: formData.student.campusId,
          section: formData.student.section
        },
        fee: {
          ts: formData.fee.ts,
          cs: formData.fee.cs,
          feeMonth: formData.fee.feeMonth,
          tutionFee: formData.fee.tutionFee,
          labsFee: formData.fee.labsFee,
          lateFeeFine: formData.fee.lateFeeFine,
          extraFee: formData.fee.extraFee,
          others: formData.fee.others,
          examFeeTotal: formData.fee.examFeeTotal,
          examFeeCurrentPaid: formData.fee.examFeeCurrentPaid,
          examFeeBalanced: formData.fee.examFeeBalanced,
          karateFeeTotal: formData.fee.karateFeeTotal,
          karateFeeCurrentPaid: formData.fee.karateFeeCurrentPaid,
          karateFeeBalanced: formData.fee.karateFeeBalanced,
          admissionFeeTotal: formData.fee.admissionFeeTotal,
          admissionFeeCurrentPaid: formData.fee.admissionFeeCurrentPaid,
          admissionFeeBalanced: formData.fee.admissionFeeBalanced,
          registrationFee: formData.fee.registrationFee,
          annualChargesTotal: formData.fee.annualChargesTotal,
          annualChargesPaid: formData.fee.annualChargesPaid,
          annualChargesBalanced: formData.fee.annualChargesBalanced,
          prevBal: formData.fee.prevBal,
          feePaid: formData.fee.feePaid,
          curBalance: formData.fee.curBalance,
          allTotal: formData.fee.allTotal,
        }
      };
      
      console.log("Submitting student data:", apiData);
      
      await onCreateStudent(apiData);
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
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

                  <div className="grid grid-cols-2 gap-4">
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
                        <option value="Play Group">Play Group</option>
                        <option value="Nursery">Nursery</option>
                        <option value="prep">Prep</option>
                        <option value="1">Class 1</option>
                        <option value="2">Class 2</option>
                        <option value="3">Class 3</option>
                        <option value="4">Class 4</option>
                        <option value="5">Class 5</option>
                        <option value="6">Class 6</option>
                        <option value="7">Class 7</option>
                        <option value="8">Class 8</option>
                        <option value="9">Class 9</option>
                        <option value="10">Class 10</option>
                        <option value="11">Class 11</option>
                        <option value="12">Class 12</option>

                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Section
                      </label>
                      <select
                        name="student.section"
                        value={formData.student.section}
                        onChange={handleChange}
                        disabled={submitting}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50"
                      >
                        {['A', 'B', 'C', 'D'].map(section => (
                          <option key={section} value={section}>
                            Section {section}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

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
                      <option value="Jan">January</option>
                      <option value="Feb">February</option>
                      <option value="Mar">March</option>
                      <option value="Apr">April</option>
                      <option value="May">May</option>
                      <option value="Jun">June</option>
                      <option value="Jul">July</option>
                      <option value="Aug">August</option>
                      <option value="Sep">September</option>
                      <option value="Oct">October</option>
                      <option value="Nov">November</option>
                      <option value="Dec">December</option>
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
                      <div>
                        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 font-bold">
                              {selectedCampusName?.charAt(0) || 'C'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-blue-800">
                              {selectedCampusName || "Your Assigned Campus"}
                            </p>
                          </div>
                        </div>
                        <input
                          type="hidden"
                          name="student.campusId"
                          value={formData.student.campusId}
                        />
                      </div>
                    ) : user?.role === 'admin' ? (
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
                    ) : (
                      <div className="text-sm text-gray-500">
                        Campus selection not available for your role
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column - Basic Fees */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Fees (Rs.)</h3>
                
                <div className="space-y-4">
                  {[
                    { key: 'tutionFee', label: 'Tuition Fee' },
                    { key: 'labsFee', label: 'Labs Fee' },
                    { key: 'lateFeeFine', label: 'Late Fee Fine' },
                    { key: 'extraFee', label: 'Extra Fee' },
                    { key: 'others', label: 'Others' },
                    { key: 'registrationFee', label: 'Registration Fee' },
                    { key: 'prevBal', label: 'Previous Balance' },
                    { key: 'feePaid', label: 'Fee Paid' },
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
              </div>

              {/* Total Summary */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Total Summary (Rs.)</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-green-200">
                    <span className="text-sm font-medium text-gray-700">Current Balance:</span>
                    <span className="text-lg font-bold text-green-700">
                      Rs. {formData.fee.curBalance.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium text-gray-700">All Total:</span>
                    <span className="text-xl font-bold text-blue-700">
                      Rs. {formData.fee.allTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Special Fees */}
            <div className="space-y-6">
              {/* Exam Fee Section */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Exam Fee (Rs.)</h3>
                
                <div className="space-y-3">
                  {[
                    { key: 'examFeeTotal', label: 'Total' },
                    { key: 'examFeeCurrentPaid', label: 'Current Paid' },
                    { key: 'examFeeBalanced', label: 'Balanced', readOnly: true }
                  ].map(({ key, label, readOnly }) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-sm text-gray-600">{label}:</label>
                      <input
                        type="number"
                        name={`fee.${key}`}
                        value={formData.fee[key]}
                        onChange={handleChange}
                        min="0"
                        disabled={submitting || readOnly}
                        readOnly={readOnly}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-right disabled:opacity-50 bg-gray-50"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Karate Fee Section */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Karate Fee (Rs.)</h3>
                
                <div className="space-y-3">
                  {[
                    { key: 'karateFeeTotal', label: 'Total' },
                    { key: 'karateFeeCurrentPaid', label: 'Current Paid' },
                    { key: 'karateFeeBalanced', label: 'Balanced', readOnly: true }
                  ].map(({ key, label, readOnly }) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-sm text-gray-600">{label}:</label>
                      <input
                        type="number"
                        name={`fee.${key}`}
                        value={formData.fee[key]}
                        onChange={handleChange}
                        min="0"
                        disabled={submitting || readOnly}
                        readOnly={readOnly}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-right disabled:opacity-50 bg-gray-50"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Admission Fee Section */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Admission Fee (Rs.)</h3>
                
                <div className="space-y-3">
                  {[
                    { key: 'admissionFeeTotal', label: 'Total' },
                    { key: 'admissionFeeCurrentPaid', label: 'Current Paid' },
                    { key: 'admissionFeeBalanced', label: 'Balanced', readOnly: true }
                  ].map(({ key, label, readOnly }) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-sm text-gray-600">{label}:</label>
                      <input
                        type="number"
                        name={`fee.${key}`}
                        value={formData.fee[key]}
                        onChange={handleChange}
                        min="0"
                        disabled={submitting || readOnly}
                        readOnly={readOnly}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-right disabled:opacity-50 bg-gray-50"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Annual Charges Section */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Annual Charges (Rs.)</h3>
                
                <div className="space-y-3">
                  {[
                    { key: 'annualChargesTotal', label: 'Total' },
                    { key: 'annualChargesPaid', label: 'Paid' },
                    { key: 'annualChargesBalanced', label: 'Balanced', readOnly: true }
                  ].map(({ key, label, readOnly }) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-sm text-gray-600">{label}:</label>
                      <input
                        type="number"
                        name={`fee.${key}`}
                        value={formData.fee[key]}
                        onChange={handleChange}
                        min="0"
                        disabled={submitting || readOnly}
                        readOnly={readOnly}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-right disabled:opacity-50 bg-gray-50"
                      />
                    </div>
                  ))}
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