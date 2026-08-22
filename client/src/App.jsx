import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GroupDetail from './pages/GroupDetail';
import AddExpense from './pages/AddExpense';
import SettleUp from './pages/SettleUp';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<h1>Home placeholder</h1>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/groups/:groupId" element={<ProtectedRoute><GroupDetail /></ProtectedRoute>} />
      <Route path="/groups/:groupId/add-expense" element={<ProtectedRoute><AddExpense /></ProtectedRoute>} />
      <Route path="/groups/:groupId/settle-up" element={<ProtectedRoute><SettleUp /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;