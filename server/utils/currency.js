async function convertCurrency(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return amount;
  
  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);
    if (!response.ok) throw new Error('Failed to fetch exchange rates');
    
    const data = await response.json();
    const rate = data.rates[toCurrency];
    
    if (!rate) throw new Error(`Currency ${toCurrency} not found`);
    
    return Number((amount * rate).toFixed(2));
  } catch (error) {
    console.error('Currency conversion error:', error);
    // Fallback: return the original amount if the API fails
    return amount;
  }
}

module.exports = { convertCurrency };
