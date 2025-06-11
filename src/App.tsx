import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserPanel from './pages/userPanel';
import AdminPanel from './pages/adminPage';
import Login from './auth/login';
import Signup from './auth/singup';
import LandingPage from './pages/LandingPage';
import ResetPassword from './auth/ResetPassword';
import UpdatePassword from './auth/UpdatePassword';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} /> {/* Default route changed */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/user" element={<UserPanel />} /> {/* Moved UserPanel to /user */}
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/reset-Password" element={<ResetPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
      </Routes>
    </Router>
  );
}

export default App;
