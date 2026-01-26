'use client';
import { useState, useEffect } from "react";
import { X, PlusCircle, User, Loader2, DollarSign, BookOpen, Calculator, Calendar } from "lucide-react";
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
      feeMonth: "",
      tutionFee: "",
      booksCharges: "",
      registrationFee: "",
      examFee: "",
      session: "",
      labFee: "",
      artCraftFee: "",
      karateFee: "",
      lateFeeFine: "",
      others: "",
      admissionFee: "",
      annualCharges: "",
      absentFine: "",
      miscellaneousFee: "",
      arrears: ""
    }
  });

  // Calculate total fee when values change
  useEffect(() => {
    const calculateTotal = () => {
      const {
        tutionFee = 0,
        booksCharges = 0,
        registrationFee = 0,
        examFee = 0,
        labFee = 0,
        artCraftFee = 0,
        karateFee = 0,
        lateFeeFine = 0,
        others = 0,
        admissionFee = 0,
        annualCharges = 0,
        absentFine = 0,
        miscellaneousFee = 0,
        arrears = 0
      } = formData.fee;

      // Convert all to numbers
      const numericValues = [
        Number(tutionFee) || 0,
        Number(booksCharges) || 0,
        Number(registrationFee) || 0,
        Number(examFee) || 0,
        Number(labFee) || 0,
        Number(artCraftFee) || 0,
        Number(karateFee) || 0,
        Number(lateFeeFine) || 0,
        Number(others) || 0,
        Number(admissionFee) || 0,
        Number(annualCharges) || 0,
        Number(absentFine) || 0,
        Number(miscellaneousFee) || 0,
        Number(arrears) || 0
      ];

      const total = numericValues.reduce((sum, value) => sum + value, 0);
      
      // Update totals in form
      setFormData(prev => ({
        ...prev,
        
      }));
    };

    calculateTotal();
  }, [
    formData.fee.tutionFee,
    formData.fee.booksCharges,
    formData.fee.registrationFee,
    formData.fee.examFee,
    formData.fee.labFee,
    formData.fee.artCraftFee,
    formData.fee.karateFee,
    formData.fee.lateFeeFine,
    formData.fee.others,
    formData.fee.admissionFee,
    formData.fee.annualCharges,
    formData.fee.absentFine,
    formData.fee.miscellaneousFee,
    formData.fee.arrears
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
         
        feeMonth: "",
        session: "",
        tutionFee: "",
        booksCharges: "",
        registrationFee: "",
        examFee: "",
        labFee: "",
        artCraftFee: "",
        karateFee: "",
        lateFeeFine: "",
        others: "",
        admissionFee: "",
        annualCharges: "",
        absentFine: "",
        miscellaneousFee: "",
        arrears: ""
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
      
      // Parse number fields (exclude feeMonth)
      const numericFields = [
          'tutionFee', 'booksCharges', 'registrationFee', 
        'examFee', 'labFee', 'artCraftFee', 'karateFee', 'lateFeeFine',
        'others', 'admissionFee', 'annualCharges', 'absentFine', 
        'miscellaneousFee', 'arrears'
      ];
      
      const newValue = numericFields.includes(fieldName) 
        ? (value === "" ? "" : parseFloat(value) || 0)
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
    if (!formData.fee.session) {
      toast.error("Please select session");
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
           feeMonth: formData.fee.feeMonth,
           session: formData.fee.session,
          tutionFee: formData.fee.tutionFee || 0,
          booksCharges: formData.fee.booksCharges || 0,
          registrationFee: formData.fee.registrationFee || 0,
          examFee: formData.fee.examFee || 0,
          labFee: formData.fee.labFee || 0,
          artCraftFee: formData.fee.artCraftFee || 0,
          karateFee: formData.fee.karateFee || 0,
          lateFeeFine: formData.fee.lateFeeFine || 0,
          others: formData.fee.others || 0,
          admissionFee: formData.fee.admissionFee || 0,
          annualCharges: formData.fee.annualCharges || 0,
          absentFine: formData.fee.absentFine || 0,
          miscellaneousFee: formData.fee.miscellaneousFee || 0,
          arrears: formData.fee.arrears || 0
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
        <div className="sticky top-0 bg-linear-to-r from-blue-600 to-purple-700 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <PlusCircle className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">Add New Student</h2>
              <p className="text-blue-100">Fill in the student and fee details below</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50"
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50"
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
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50"
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
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50"
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

              {/* Fee Month Selection */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Fee Period
                </h3>
                
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50"
                    >
                      <option value="">Select Month</option>
                      <option value="January">January</option>
                      <option value="February">February</option>
                      <option value="March">March</option>
                      <option value="April">April</option>
                      <option value="May">May</option>
                      <option value="June">June</option>
                      <option value="July">July</option>
                      <option value="August">August</option>
                      <option value="September">September</option>
                      <option value="October">October</option>
                      <option value="November">November</option>
                      <option value="December">December</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Session *
                    </label>
                    <select
                      name="fee.session"
                      value={formData.fee.session}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50"
                    >
                      <option value="">Select Session</option>
                      <option value="2024-2025">2024-2025</option>
                      <option value="2025-2026">2025-2026</option>
                      <option value="2026-2027">2026-2027</option>
                      <option value="2027-2028">2027-2028</option>

                    </select>
                  </div>

               
                </div>
              </div>
            </div>

            {/* Middle Column - Basic Fees */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Basic Fees
                </h3>
                
                <div className="space-y-4">
                  {[
                    { key: 'tutionFee', label: 'Tuition Fee', placeholder: 'Enter tuition fee' },
                    { key: 'booksCharges', label: 'Books & Stationery', placeholder: 'Enter books charges' },
                    { key: 'registrationFee', label: 'Registration Fee', placeholder: 'Enter registration fee' },
                    { key: 'examFee', label: 'Exam Fee', placeholder: 'Enter exam fee' },
                    { key: 'labFee', label: 'Lab Fee', placeholder: 'Enter lab fee' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rs.</span>
                        <input
                          type="number"
                          name={`fee.${key}`}
                          value={formData.fee[key]}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          disabled={submitting}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50"
                          placeholder={placeholder}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Activity & Other Fees
                </h3>
                
                <div className="space-y-4">
                  {[
                    { key: 'artCraftFee', label: 'Art & Craft Fee', placeholder: 'Enter art & craft fee' },
                    { key: 'karateFee', label: 'Karate Fee', placeholder: 'Enter karate fee' },
                    { key: 'lateFeeFine', label: 'Late Fee Fine', placeholder: 'Enter late fee fine' },
                    { key: 'others', label: 'Other Charges', placeholder: 'Enter other charges' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rs.</span>
                        <input
                          type="number"
                          name={`fee.${key}`}
                          value={formData.fee[key]}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          disabled={submitting}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50"
                          placeholder={placeholder}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Special Fees */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Additional Fees
                </h3>
                
                <div className="space-y-4">
                  {[
                    { key: 'admissionFee', label: 'Admission Fee', placeholder: 'Enter admission fee' },
                    { key: 'annualCharges', label: 'Annual Charges', placeholder: 'Enter annual charges' },
                    { key: 'absentFine', label: 'Absent Fine', placeholder: 'Enter absent fine' },
                    { key: 'miscellaneousFee', label: 'Miscellaneous Fee', placeholder: 'Enter miscellaneous fee' },
                    { key: 'arrears', label: 'Arrears', placeholder: 'Enter arrears amount' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rs.</span>
                        <input
                          type="number"
                          name={`fee.${key}`}
                          value={formData.fee[key]}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          disabled={submitting}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50"
                          placeholder={placeholder}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Card */}
          
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-linear-to-r from-blue-600 to-purple-700 text-white rounded-lg hover:from-blue-700 hover:to-purple-800 transition-all font-medium shadow-md disabled:opacity-50 flex items-center gap-2"
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