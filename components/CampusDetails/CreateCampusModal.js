'use client';
import { X, Loader2 } from 'lucide-react';

const CreateCampusModal = ({ 
  isOpen, 
  onClose, 
  form, 
  setForm, 
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Campus</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Campus Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
            required
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={form.city}
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
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Creating Campus...
              </>
            ) : 'Create Campus'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCampusModal;