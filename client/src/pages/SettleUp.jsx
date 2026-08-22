import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

function SettleUp() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [nameToId, setNameToId] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(null);

  useEffect(() => {
    fetchData();
  }, [groupId]);

  const fetchData = async () => {
    try {
      const [settleRes, balancesRes] = await Promise.all([
        api.get(`/groups/${groupId}/settle-up`),
        api.get(`/groups/${groupId}/balances`)
      ]);
      setTransactions(settleRes.data);
      const map = {};
      balancesRes.data.forEach((b) => { map[b.name] = b.userId; });
      setNameToId(map);
    } catch (err) {
      setError('Could not load settle-up data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (t) => {
    setPaying(t.from + t.to);
    setError('');
    try {
      await api.post(`/groups/${groupId}/settlements`, {
        to: nameToId[t.to],
        amount: t.amount
      });
      navigate(`/groups/${groupId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not record payment');
      setPaying(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <p className="font-mono text-text-muted text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink px-4 py-10">
      <div className="max-w-md mx-auto">
        <Link to={`/groups/${groupId}`} className="font-mono text-xs text-text-muted hover:text-accent uppercase tracking-wide">
          ← Back to group
        </Link>

        <h1 className="font-display text-2xl font-semibold text-text mt-3 mb-6">Settle Up</h1>

        {error && <p className="font-mono text-xs text-danger mb-4">! {error}</p>}

        {transactions.length === 0 ? (
          <p className="text-sm text-text-muted font-mono">Everyone's settled up — nothing owed.</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((t, i) => (
              <div key={i} className="bg-surface border border-line rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-text">{t.from} → {t.to}</p>
                  <p className="font-mono text-xs text-text-muted mt-1">{t.amount}</p>
                </div>
                <button
                  onClick={() => handleMarkPaid(t)}
                  disabled={paying === t.from + t.to}
                  className="bg-accent hover:bg-accent-soft text-ink font-mono text-xs uppercase tracking-wide px-3 py-2 rounded-md transition-colors disabled:opacity-50"
                >
                  {paying === t.from + t.to ? '...' : 'Mark Paid'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SettleUp;