const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Group = require('../models/Group');
const protect = require('../middleware/auth');
const upload = require('../middleware/upload');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const readReceipt = require('../utils/readReceipt');

// Create a new expense inside a group
router.post('/', protect, async (req, res) => {
  try {
    const { description, amount, paidBy, splitBetween, groupId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const isMember = group.members.some(memberId => memberId.toString() === req.userId);
    if (!isMember) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    const newExpense = await Expense.create({
      description, amount, paidBy, splitBetween, group: groupId
    });

    res.status(201).json(newExpense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all expenses for one specific group
router.get('/:groupId', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const isMember = group.members.some(memberId => memberId.toString() === req.userId);
    if (!isMember) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    const expenses = await Expense.find({ group: req.params.groupId })
      .populate('paidBy', 'name')
      .populate('splitBetween', 'name');

    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test route: upload a receipt image to Cloudinary
router.post('/test-upload', protect, upload.single('receipt'), async (req, res) => {
  try {
    const result = await uploadToCloudinary(req.file.buffer);
    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test route: read a receipt image using AI
router.post('/test-receipt', protect, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const data = await readReceipt(imageUrl);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;