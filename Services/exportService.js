import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { getStudentsByClassAPI } from './feeService';

export const exportStudentsToExcel = async (selectedClass = "all") => {
  try {
    // Fetch all students for export
    const response = await getStudentsByClassAPI(selectedClass);
    
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('No student data available');
    }

    const students = response.data;
    
    // Prepare data for Excel
    const excelData = students.map(student => ({
      'Student ID': student.studentId || '',
      'Student Name': student.studentName || '',
      'Father Name': student.fatherName || '',
      'Class': student.className || '',
      'Section': student.section || '',
      'Session': student.session || '',
      'Fee Month': student.feeMonth || '',
      'Tution Fee': student.tutionFee || 0,
      'Labs Fee': student.labsFee || 0,
      'Late Fee': student.lateFeeFine || 0,
      'Extra Fee': student.extraFee || 0,
      'Others': student.others || 0,
      'Exam Fee Total': student.examFeeTotal || 0,
      'Exam Fee Paid': student.examFeeCurrentPaid || 0,
      'Exam Fee Balance': student.examFeeBalanced || 0,
      'Karate Fee Total': student.karateFeeTotal || 0,
      'Karate Fee Paid': student.karateFeeCurrentPaid || 0,
      'Karate Fee Balance': student.karateFeeBalanced || 0,
      'Admission Fee Total': student.admissionFeeTotal || 0,
      'Admission Fee Paid': student.admissionFeeCurrentPaid || 0,
      'Admission Fee Balance': student.admissionFeeBalanced || 0,
      'Registration Fee': student.registrationFee || 0,
      'Annual Charges Total': student.annualChargesTotal || 0,
      'Annual Charges Paid': student.annualChargesPaid || 0,
      'Annual Charges Balance': student.annualChargesBalanced || 0,
      'Previous Balance': student.prevBal || 0,
      'Fee Paid': student.feePaid || 0,
      'Current Balance': student.curBalance || 0,
      'Total Amount': student.allTotal || 0,
      'Status': student.status || 'active',
      'Campus ID': student.campusId || '',
      'Created Date': student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '',
      'Updated Date': student.updatedAt ? new Date(student.updatedAt).toLocaleDateString() : ''
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Auto-size columns
    const maxWidth = excelData.reduce((w, r) => Math.max(w, Object.keys(r).length), 10);
    worksheet['!cols'] = Array.from({ length: maxWidth }, () => ({ width: 20 }));
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students Data');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Save file with timestamp
    const date = new Date().toISOString().split('T')[0];
    const fileName = `students_export_${date}_${selectedClass}_${excelData.length}_students.xlsx`;
    
    saveAs(blob, fileName);
    
    return { success: true, fileName, count: excelData.length };
    
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

// For exporting filtered data
export const exportFilteredStudentsToExcel = (students) => {
  try {
    if (!students || !Array.isArray(students) || students.length === 0) {
      throw new Error('No student data available for export');
    }

    const excelData = students.map(student => ({
      'Student ID': student.studentId || '',
      'Student Name': student.studentName || '',
      'Father Name': student.fatherName || '',
      'Class': student.className || '',
      'Section': student.section || '',
      'Session': student.session || '',
      'Fee Month': student.feeMonth || '',
      'Tution Fee': student.tutionFee || 0,
      'Labs Fee': student.labsFee || 0,
      'Late Fee': student.lateFeeFine || 0,
      'Extra Fee': student.extraFee || 0,
      'Others': student.others || 0,
      'Exam Fee Total': student.examFeeTotal || 0,
      'Exam Fee Paid': student.examFeeCurrentPaid || 0,
      'Exam Fee Balance': student.examFeeBalanced || 0,
      'Karate Fee Total': student.karateFeeTotal || 0,
      'Karate Fee Paid': student.karateFeeCurrentPaid || 0,
      'Karate Fee Balance': student.karateFeeBalanced || 0,
      'Admission Fee Total': student.admissionFeeTotal || 0,
      'Admission Fee Paid': student.admissionFeeCurrentPaid || 0,
      'Admission Fee Balance': student.admissionFeeBalanced || 0,
      'Registration Fee': student.registrationFee || 0,
      'Annual Charges Total': student.annualChargesTotal || 0,
      'Annual Charges Paid': student.annualChargesPaid || 0,
      'Annual Charges Balance': student.annualChargesBalanced || 0,
      'Previous Balance': student.prevBal || 0,
      'Fee Paid': student.feePaid || 0,
      'Current Balance': student.curBalance || 0,
      'Total Amount': student.allTotal || 0,
      'Status': student.status || 'active',
      'Campus ID': student.campusId || '',
      'Created Date': student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '',
      'Updated Date': student.updatedAt ? new Date(student.updatedAt).toLocaleDateString() : ''
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Auto-size columns
    const maxWidth = excelData.reduce((w, r) => Math.max(w, Object.keys(r).length), 10);
    worksheet['!cols'] = Array.from({ length: maxWidth }, () => ({ width: 20 }));
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students Data');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Save file with timestamp
    const date = new Date().toISOString().split('T')[0];
    const fileName = `students_export_${date}_${excelData.length}_students.xlsx`;
    
    saveAs(blob, fileName);
    
    return { success: true, fileName, count: excelData.length };
    
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};