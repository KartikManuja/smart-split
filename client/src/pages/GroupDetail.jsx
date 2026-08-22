import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

function GroupDetail() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [groupId]);

  const fetchData = async () => {
    try {
      const [groupRes, expensesRes, balancesRes] = await Promise.all([
        api.get(`/groups/${groupId}`),
        api.get(`/expenses/${groupId}`),
        api.get(`/groups/${groupId}/balances`)
      ]);
      setGroup(groupRes.data);
      setExpenses(expensesRes.data);
      setBalances(balancesRes.data);
    } catch (err) {
      setError('Could not load group details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.delete(`/expenses/${expenseId}`);
      fetchData();
    } catch (err) {
      setError('Failed to delete expense');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <p className="font-mono text-text-muted text-sm">Loading group...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink px-4 py-10">
      <div className="max-w-md mx-auto">
        <Link to="/dashboard" className="font-mono text-xs text-text-muted hover:text-accent uppercase tracking-wide">
          ← Back to groups
        </Link>

        <h1 className="font-display text-2xl font-semibold text-text mt-3 mb-6">{group?.name || 'Group Detail'}</h1>

        <Link
  to={`/groups/${groupId}/add-expense`}
  className="inline-block bg-accent hover:bg-accent-soft text-ink font-display font-semibold px-4 py-2 rounded-md transition-colors mb-6"
>
  + Add Expense
</Link>

<Link
  to={`/groups/${groupId}/settle-up`}
  className="inline-block bg-surface-2 border border-line hover:border-accent text-text font-mono text-xs uppercase tracking-wide px-4 py-2 rounded-md transition-colors mb-6 ml-2"
>
  Settle Up
</Link>

        {error && <p className="font-mono text-xs text-danger mb-4">! {error}</p>}

        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-wide text-text-muted mb-3">Balances</p>
          <div className="space-y-2">
            {balances.map((b) => (
              <div key={b.userId} className="bg-surface border border-line rounded-lg p-3 flex justify-between items-center">
                <span className="text-text">{b.name}</span>
                <span className={`font-mono text-sm ${b.balance > 0 ? 'text-accent' : b.balance < 0 ? 'text-danger' : 'text-text-muted'}`}>
                  {b.balance > 0 ? `+${b.balance}` : b.balance} {group?.baseCurrency || 'USD'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-text-muted mb-3">Expenses</p>
          {expenses.length === 0 ? (
            <p className="text-sm text-text-muted font-mono">No expenses yet.</p>
          ) : (
            <div className="space-y-2">
              {expenses.map((exp) => (
                <div key={exp._id} className="bg-surface border border-line rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <p className="text-text">{exp.description}</p>
                    {exp.isRecurring && (
                      <span className="font-mono text-[10px] uppercase tracking-wide bg-accent/20 text-accent px-2 py-0.5 rounded">
                        🔁 {exp.recurrenceInterval}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-end mt-1">
                    <p className="font-mono text-xs text-text-muted">
                      {exp.amount} {group?.baseCurrency || 'USD'} {exp.originalCurrency && exp.originalCurrency !== (group?.baseCurrency || 'USD') && `(originally ${exp.originalAmount} ${exp.originalCurrency})`} — paid by {exp.paidBy?.name || 'Unknown'}
                    </p>
                    <button 
                      onClick={() => handleDeleteExpense(exp._id)}
                      className="font-mono text-xs text-danger hover:text-red-400 transition-colors uppercase tracking-wide ml-2"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GroupDetail;