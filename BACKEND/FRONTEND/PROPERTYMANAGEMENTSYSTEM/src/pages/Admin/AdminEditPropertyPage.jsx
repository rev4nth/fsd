import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNavbar from '../../components/AdminNavbar';
import { useParams, useNavigate } from 'react-router-dom';

const AdminEditPropertyPage = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperty = async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://fsd-jz2r.onrender.com/api/properties/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData(response.data);
    };
    fetchProperty();
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    await axios.put(`https://fsd-jz2r.onrender.com/api/properties/${id}`, formData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    navigate('/admin/properties');
  };

  if (!formData) return <div>Loading...</div>;

  return (
    <div>
      <AdminNavbar />
      <div className="max-w-xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Edit Property</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="title" value={formData.title} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Title" />
          <input name="location" value={formData.location} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Location" />
          <input name="price" value={formData.price} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Price" />
          <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Description" />
          {/* Add more fields as needed */}
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
        </form>
      </div>
    </div>
  );
};

export default AdminEditPropertyPage;
