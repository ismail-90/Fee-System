export const dummyData = {
  dashboard: {
    totalCampuses: 5,
    totalStudents: 1250,
    totalFee: 2500000,
    expenses: 850000,
    totalReceived: 1850000,
    totalPending: 650000,
    totalDefaulters: 45
  },
  campuses: [
    { id: 1, name: "Main Campus", location: "City Center", students: 500, phone: "123-456-7890" },
    { id: 2, name: "North Campus", location: "North Area", students: 300, phone: "123-456-7891" },
    { id: 3, name: "South Campus", location: "South Area", students: 250, phone: "123-456-7892" },
    { id: 4, name: "East Campus", location: "East Area", students: 200, phone: "123-456-7893" }
  ],
  students: [
    { id: 1, name: "Ali Ahmed", campus: "Main Campus", grade: "10th", feeStatus: "Paid", pendingAmount: 0 },
    { id: 2, name: "Sara Khan", campus: "North Campus", grade: "9th", feeStatus: "Pending", pendingAmount: 5000 },
    { id: 3, name: "Ahmed Raza", campus: "South Campus", grade: "11th", feeStatus: "Paid", pendingAmount: 0 },
    { id: 4, name: "Fatima Noor", campus: "Main Campus", grade: "10th", feeStatus: "Defaulter", pendingAmount: 15000 }
  ],
  invoices: [
    { id: 1, student: "Ali Ahmed", amount: 15000, dueDate: "2024-01-15", status: "Paid" },
    { id: 2, student: "Sara Khan", amount: 15000, dueDate: "2024-01-10", status: "Overdue" },
    { id: 3, student: "Ahmed Raza", amount: 15000, dueDate: "2024-01-20", status: "Pending" }
  ],
  expenses: [
    { id: 1, category: "Salaries", amount: 500000, date: "2024-01-01", description: "Staff salaries" },
    { id: 2, category: "Utilities", amount: 150000, date: "2024-01-05", description: "Electricity and water" },
    { id: 3, category: "Maintenance", amount: 200000, date: "2024-01-10", description: "Building maintenance" }
  ]
};