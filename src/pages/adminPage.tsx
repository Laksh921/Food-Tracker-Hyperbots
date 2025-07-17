import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import './adminPage.css';

interface MealRecord {
  id: string;
  name: string;
  meal_type: 'veg' | 'non-veg';
  email: string;
  created_at: string;
  created_date: string;
}

const AdminPanel: React.FC = () => {
  const [data, setData] = useState<MealRecord[]>([]);
  const [filterName, setFilterName] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Admin auth check
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

  // ✅ Fetch and filter data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      let query = supabase
        .from('meal_preferences')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: rawData, error } = await query;

      if (error) {
        alert('Failed to load data: ' + error.message);
        setData([]);
        setLoading(false);
        return;
      }

      const patchedData = (rawData || []).map((item: any) => ({
        ...item,
        created_date: item.created_at?.split('T')[0] || '',
      }));

      let filtered = patchedData;

      if (filterDate) {
        filtered = filtered.filter((record) => record.created_date === filterDate);
      }

      if (filterMonth) {
        filtered = filtered.filter((record) =>
          record.created_at?.startsWith(filterMonth)
        );
      }

      setData(filtered);
      setLoading(false);
    };

    fetchData();
  }, [filterDate, filterMonth]);

  // ✅ Delete record
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    const { error } = await supabase
      .from('meal_preferences')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Failed to delete from Supabase: ' + error.message);
    } else {
      setData((prev) => prev.filter((entry) => entry.id !== id));
    }
  };

  // ✅ Filter by name (client-side)
  const filtered = useMemo(() => {
    return filterName
      ? data.filter((record) =>
          record.name.toLowerCase().includes(filterName.toLowerCase())
        )
      : data;
  }, [filterName, data]);

  const vegCount = filtered.filter((r) => r.meal_type === 'veg').length;
  const nonVegCount = filtered.filter((r) => r.meal_type === 'non-veg').length;

  // ✅ Monthly summary by user
  const monthlyStats = useMemo(() => {
    if (!filterMonth) return null;

    const summary: { [name: string]: number } = {};
    filtered.forEach((record) => {
      summary[record.name] = (summary[record.name] || 0) + 1;
    });

    return summary;
  }, [filtered, filterMonth]);

  return (
    <div className="admin-panel">
      <div className="header">
        <h2>Admin Panel</h2>
        <button className="btn nav-btn" onClick={() => navigate('/')}>Go to User Panel</button>
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
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="input-box"
        />
      </div>

      {(filtered.length > 0 || filterName || filterDate || filterMonth) && (
        <div className="stats">
          <p><strong>Total Orders:</strong> {filtered.length}</p>
          <p><span className="veg-tag">Veg:</span> {vegCount}</p>
          <p><span className="non-veg-tag">Non-Veg:</span> {nonVegCount}</p>
        </div>
      )}

      {filterMonth && monthlyStats && (
        <div className="stats">
          <h3>📊 Orders Summary for {filterMonth}</h3>
          <ul>
            {Object.entries(monthlyStats).map(([name, count]) => (
              <li key={name}><strong>{name}:</strong> {count} orders</li>
            ))}
          </ul>
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
              <th>Date</th>
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
                <td>{record.created_date}</td>
                <td>
                  <button className="btn delete-btn" onClick={() => handleDelete(record.id)}>
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
