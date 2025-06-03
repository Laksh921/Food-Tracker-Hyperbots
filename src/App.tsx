import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserPanel from './pages/userPanel';
import AdminPanel from './pages/adminPage';
import Login from './auth/login';
import Signup from './auth/singup';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} /> {/* Default route changed */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/user" element={<UserPanel />} /> {/* Moved UserPanel to /user */}
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
