import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

function AddExpense() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitBetween, setSplitBetween] = useState([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState('monthly');
  const [currency, setCurrency] = useState('USD');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [receiptFile, setReceiptFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState(null);

  useEffect(() => {
    fetchGroup();
  }, [groupId]);

  const fetchGroup = async () => {
    try {
      const response = await api.get('/groups');
      const group = response.data.find((g) => g._id === groupId);
      setMembers(group.members);
    } catch (err) {
      setError('Could not load group members');
    } finally {
      setLoading(false);
    }
  };

  const toggleSplitMember = (memberId) => {
    setSplitBetween((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleScanReceipt = async () => {
    if (!receiptFile) return;
    setScanning(true);
    setError('');
    setScannedItems(null);
    try {
      const formData = new FormData();
      formData.append('receipt', receiptFile);

      const uploadRes = await api.post('/expenses/test-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const receiptRes = await api.post('/expenses/test-receipt', {
        imageUrl: uploadRes.data.url
      });

      setScannedItems(receiptRes.data.items);
      setAmount(receiptRes.data.total.toString());
      if (!description) setDescription('Receipt');
    } catch (err) {
      setError('Could not read the receipt — try again or enter the expense manually');
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!description || !amount || !paidBy || splitBetween.length === 0) {
      setError('Please fill in all fields and select at least one person to split with');
      return;
    }
    try {
      await api.post('/expenses', {
        description,
        amount: Number(amount),
        paidBy,
        splitBetween,
        groupId,
        isRecurring,
        recurrenceInterval: isRecurring ? recurrenceInterval : undefined,
        currency
      });
      navigate(`/groups/${groupId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create expense');
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

        <h1 className="font-display text-2xl font-semibold text-text mt-3 mb-6">Add Expense</h1>

        <div className="bg-surface border border-line rounded-lg p-4 mb-6">
          <label className="block font-mono text-xs uppercase tracking-wide text-text-muted mb-2">
            Scan a receipt (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setReceiptFile(e.target.files[0])}
            className="text-sm text-text-muted mb-3 block w-full"
          />
          <button
            type="button"
            onClick={handleScanReceipt}
            disabled={!receiptFile || scanning}
            className="w-full bg-surface-2 border border-line hover:border-accent text-text font-mono text-xs uppercase tracking-wide py-2 rounded-md transition-colors disabled:opacity-50"
          >
            {scanning ? 'Reading receipt...' : 'Scan & Fill Amount'}
          </button>

          {scannedItems && (
            <div className="mt-3 space-y-1 border-t border-dashed border-line pt-3">
              <p className="font-mono text-xs text-text-muted mb-1">Items found:</p>
              {scannedItems.map((item, i) => (
                <p key={i} className="font-mono text-xs text-text flex justify-between">
                  <span>{item.name}</span>
                  <span>{item.price}</span>
                </p>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-text-muted mb-1">Description</label>
            <input
              type="text"
              placeholder="Beach shack lunch"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-2 border border-line rounded-md px-3 py-2 text-text placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-text-muted mb-1">Amount & Currency</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="40"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-surface-2 border border-line rounded-md px-3 py-2 text-text placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-1/3 bg-surface-2 border border-line rounded-md px-3 py-2 text-text focus:outline-none focus:border-accent transition-colors"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
                <option value="JPY">JPY</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-text-muted mb-1">Paid by</label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full bg-surface-2 border border-line rounded-md px-3 py-2 text-text focus:outline-none focus:border-accent transition-colors"
            >
              <option value="">Select who paid</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-text-muted mb-2">Split between</label>
            <div className="space-y-2">
              {members.map((m) => (
                <label key={m._id} className="flex items-center gap-2 bg-surface-2 border border-line rounded-md px-3 py-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={splitBetween.includes(m._id)}
                    onChange={() => toggleSplitMember(m._id)}
                  />
                  <span className="text-text">{m.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-line rounded-lg p-4 mt-2 mb-2">
            <label className="flex items-center gap-2 font-mono text-xs text-text cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
              />
              Make this a recurring expense
            </label>
            {isRecurring && (
              <div className="mt-3">
                <label className="block font-mono text-xs uppercase tracking-wide text-text-muted mb-1">Recurrence Interval</label>
                <select
                  value={recurrenceInterval}
                  onChange={(e) => setRecurrenceInterval(e.target.value)}
                  className="w-full bg-surface-2 border border-line rounded-md px-3 py-2 text-text focus:outline-none focus:border-accent transition-colors text-sm"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}
          </div>

          {error && <p className="font-mono text-xs text-danger">! {error}</p>}

          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent-soft text-ink font-display font-semibold py-2.5 rounded-md transition-colors mt-2"
          >
            Save Expense
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddExpense;