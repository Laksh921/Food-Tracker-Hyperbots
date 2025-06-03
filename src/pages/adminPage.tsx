import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import './adminPage.css';

interface MealRecord {
  id: string;
  name: string;
  meal_type: 'veg' | 'non-veg';
  email: string;
  created_at: string;
}

const AdminPanel: React.FC = () => {
  const [data, setData] = useState<MealRecord[]>([]);
  const [filterName, setFilterName] = useState('');
  const [filterDate, setFilterDate] = useState(''); // YYYY-MM-DD
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if logged-in user is admin
  useEffect(() => {
    const verifyAdmin = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        alert('You must be logged in.');
        navigate('/login');
        return;
      }

      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('email')
        .eq('email', user.email)
        .single();

      if (adminError || !adminData) {
        alert('Access denied. Not an admin.');
        navigate('/');
      }
    };

    verifyAdmin();
  }, [navigate]);

  // Fetch data with filters
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      let query = supabase
  .from('meal_preferences')
  .select('*')
  .order('created_at', { ascending: false });


      // Filter by date range if filterDate is set
      if (filterDate) {
        const start = new Date(filterDate);
        const end = new Date(filterDate);
        end.setDate(end.getDate() + 1);

        query = query.gte('created_at', start.toISOString()).lt('created_at', end.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        alert('Failed to load data: ' + error.message);
        setData([]);
      } else {
        setData(data || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [filterDate]);

  // Delete entry
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    const { error } = await supabase.from('meal_preferences').delete().eq('id', id);
    if (error) {
      alert('Failed to delete: ' + error.message);
    } else {
      setData((prev) => prev.filter((entry) => entry.id !== id));
    }
  };

  // Filter by name (client-side)
  const filtered = filterName
    ? data.filter((record) => record.name.toLowerCase().includes(filterName.toLowerCase()))
    : data;

  const vegCount = filtered.filter((r) => r.meal_type === 'veg').length;
  const nonVegCount = filtered.filter((r) => r.meal_type === 'non-veg').length;

  return (
    <div className="admin-panel">
      <div className="header">
        <h2>Admin Panel</h2>
        <button className="nav-btn" onClick={() => navigate('/')}>Go to User Panel</button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Filter by user name"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="input-box"
        />

        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="input-box"
        />
      </div>

      {(filterName || filterDate) && (
        <div className="stats">
          <p><strong>Total Orders:</strong> {filtered.length}</p>
          <p><span className="veg-tag">Veg:</span> {vegCount}</p>
          <p><span className="non-veg-tag">Non-Veg:</span> {nonVegCount}</p>
        </div>
      )}

      {loading ? (
        <p>Loading data...</p>
      ) : filtered.length === 0 ? (
        <p>No records found.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Meal</th>
              <th>Email</th>
              <th>Submitted At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((record) => (
              <tr key={record.id}>
                <td>{record.name}</td>
                <td>
                  <span className={record.meal_type === 'veg' ? 'veg-tag' : 'non-veg-tag'}>
                    {record.meal_type}
                  </span>
                </td>
                <td>{record.email}</td>
                <td>{new Date(record.created_at).toLocaleString()}</td>
                <td>
                  <button className="delete-btn" onClick={() => handleDelete(record.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminPanel;
