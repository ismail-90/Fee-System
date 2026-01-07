'use client';
import { X, Loader2 } from 'lucide-react';

const EditAccountantModal = ({ 
  isOpen, 
  onClose, 
  form, 
  setForm, 
  campuses, 
  onSubmit, 
  loading 
}) => {
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Accountant</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
            required
          />
          <input
            type="text"
            name="phone_no"
            placeholder="Phone No"
            value={form.phone_no}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
            required
          />
          <select
            name="campus_id"
            value={form.campus_id}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
            required
          >
            <option value="">Select Campus</option>
            {campuses.map(campus => (
              <option key={campus._id} value={campus._id}>
                {campus.name}
              </option>
            ))}
          </select>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
            required
          >
            <option value="">Select Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Updating Accountant...
              </>
            ) : 'Update Accountant'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditAccountantModal;