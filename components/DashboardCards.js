import { 
  School, 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Download 
} from 'lucide-react';

const Card = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-full bg-blue-400`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

export default function DashboardCards({ data }) {
  const cards = [
    {
      title: 'Total Campuses',
      value: data.totalCampuses,
      icon: School,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Students',
      value: data.totalStudents,
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'Total Fee',
      value: `₹${data.totalFee.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500'
    },
    {
      title: 'Expenses',
      value: `₹${data.expenses.toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-orange-500'
    },
    {
      title: 'Total Received',
      value: `₹${data.totalReceived.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-teal-500'
    },
    {
      title: 'Total Pending',
      value: `₹${data.totalPending.toLocaleString()}`,
      icon: AlertCircle,
      color: 'bg-red-500'
    },
    {
      title: 'Total Defaulters',
      value: data.totalDefaulters,
      icon: Users,
      color: 'bg-yellow-500'
    },
    {
      title: 'Import CSV',
      value: 'Upload',
      icon: Download,
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <Card
          key={index}
          title={card.title}
          value={card.value}
          icon={card.icon}
          color={card.color}
        />
      ))}
    </div>
  );
}