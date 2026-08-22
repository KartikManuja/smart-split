const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  originalCurrency: { type: String, default: 'USD' },
  originalAmount: { type: Number },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  splitBetween: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  isRecurring: { type: Boolean, default: false },
  recurrenceInterval: { 
    type: String, 
    enum: ['daily', 'weekly', 'monthly'],
    required: function() { return this.isRecurring; }
  },
  nextRecurrenceDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', expenseSchema);