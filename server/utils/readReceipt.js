const genAI = require('../config/gemini');

async function readReceipt(imageUrl) {
 const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });

  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  const base64Image = Buffer.from(arrayBuffer).toString('base64');

  const prompt = `Look at this receipt image. Extract each line item with its price, and the total amount.
Return ONLY valid JSON in this exact shape, nothing else, no markdown formatting:
{
  "items": [{ "name": "string", "price": number }],
  "total": number
}`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: base64Image, mimeType: 'image/png' } }
  ]);

  const text = result.response.text();
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

module.exports = readReceipt;