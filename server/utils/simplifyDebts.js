function simplifyDebts(balances) {
  let entries = Object.entries(balances).filter(([id, amt]) => Math.round(amt * 100) !== 0);
  const transactions = [];

  while (entries.length > 0) {
    entries.sort((a, b) => a[1] - b[1]);

    const debtor = entries[0];
    const creditor = entries[entries.length - 1];

    const amount = Math.min(-debtor[1], creditor[1]);

    transactions.push({
      from: debtor[0],
      to: creditor[0],
      amount: Math.round(amount * 100) / 100
    });

    debtor[1] += amount;
    creditor[1] -= amount;

    entries = entries.filter(([id, amt]) => Math.round(amt * 100) !== 0);
  }

  return transactions;
}

module.exports = simplifyDebts;