const cron = require('node-cron');
const Expense = require('../models/Expense');

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily recurring expense check...');
  try {
    const today = new Date();
    
    // Find expenses that are recurring and need to be processed today or earlier
    const expensesToProcess = await Expense.find({
      isRecurring: true,
      nextRecurrenceDate: { $lte: today }
    });

    for (const exp of expensesToProcess) {
      // Calculate next recurrence date based on the *current* nextRecurrenceDate
      const nextDate = new Date(exp.nextRecurrenceDate);
      if (exp.recurrenceInterval === 'daily') nextDate.setDate(nextDate.getDate() + 1);
      else if (exp.recurrenceInterval === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
      else if (exp.recurrenceInterval === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
      
      // Create a new expense instance that carries the recurring flag forward
      const newExpense = new Expense({
        description: exp.description,
        amount: exp.amount,
        paidBy: exp.paidBy,
        splitBetween: exp.splitBetween,
        group: exp.group,
        isRecurring: true,
        recurrenceInterval: exp.recurrenceInterval,
        nextRecurrenceDate: nextDate
      });
      await newExpense.save();

      // Remove the recurring flag from the old expense so it becomes a normal past expense
      exp.isRecurring = false;
      exp.nextRecurrenceDate = null;
      await exp.save();
    }
    console.log(`Processed ${expensesToProcess.length} recurring expenses.`);
  } catch (error) {
    console.error('Error processing recurring expenses:', error);
  }
});
