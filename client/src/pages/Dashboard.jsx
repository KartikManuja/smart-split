import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups');
      setGroups(response.data);
    } catch (err) {
      setError('Could not load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    try {
      await api.post('/groups', { name: newGroupName, memberIds: [] });
      setNewGroupName('');
      fetchGroups();
    } catch (err) {
      setError('Could not create group');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <p className="font-mono text-text-muted text-sm">Loading your groups...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink px-4 py-10">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-2xl font-semibold text-text">Smart Split</h1>
          <button onClick={handleLogout} className="font-mono text-xs text-text-muted hover:text-accent uppercase tracking-wide">
            Log out
          </button>
        </div>

        <form onSubmit={handleCreateGroup} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="New group name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="flex-1 bg-surface-2 border border-line rounded-md px-3 py-2 text-text placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
          />
          <button type="submit" className="bg-accent hover:bg-accent-soft text-ink font-display font-semibold px-4 rounded-md transition-colors">
            + Add
          </button>
        </form>

        {error && <p className="font-mono text-xs text-danger mb-4">! {error}</p>}

        {groups.length === 0 ? (
          <p className="text-sm text-text-muted font-mono">No groups yet — create one above.</p>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <Link
                key={group._id}
                to={`/groups/${group._id}`}
                className="block bg-surface border border-line rounded-lg p-4 hover:border-accent transition-colors"
              >
                <p className="font-display text-lg text-text">{group.name}</p>
                <p className="font-mono text-xs text-text-muted mt-1">
                  {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;