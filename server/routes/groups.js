
const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const protect = require('../middleware/auth');
const Expense = require('../models/Expense');
const simplifyDebts = require('../utils/simplifyDebts');
const Settlement = require('../models/Settlement');

// Add a member to a group by email
router.post('/:groupId/members', protect, async (req, res) => {
  try {
    const { email } = req.body;
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const isMember = group.members.some((m) => m.toString() === req.userId);
    if (!isMember) return res.status(403).json({ error: 'You are not a member of this group' });

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ error: 'No user found with that email' });

    if (group.members.some((m) => m.toString() === userToAdd._id.toString())) {
      return res.status(400).json({ error: 'Already a member' });
    }

    group.members.push(userToAdd._id);
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a group
router.post('/', protect, async (req, res) => {
  try {
    const { name, memberIds = [] } = req.body;
 
    const group = await Group.create({
      name,
      members: [req.userId, ...memberIds],
      createdBy: req.userId
    });
 
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// Get all groups the logged-in user belongs to
router.get('/', protect, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.userId }).populate('members', 'name email');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single group
router.get('/:groupId', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate('members', 'name email');
    if (!group) return res.status(404).json({ error: 'Group not found' });
    const isMember = group.members.some(m => m._id.toString() === req.userId);
    if (!isMember) return res.status(403).json({ error: 'Not a member' });
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
router.get('/:groupId/balances', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate('members', 'name email');
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
 
    const isMember = group.members.some(m => m._id.toString() === req.userId);
    if (!isMember) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }
 
    const expenses = await Expense.find({ group: req.params.groupId });
 
    const balances = {};
    group.members.forEach(member => {
      balances[member._id.toString()] = 0;
    });
 
    expenses.forEach(exp => {
      const share = exp.amount / exp.splitBetween.length;
      balances[exp.paidBy.toString()] += exp.amount;
      exp.splitBetween.forEach(personId => {
        balances[personId.toString()] -= share;
      });
    });
 
    const settlements = await Settlement.find({ group: req.params.groupId });
    settlements.forEach(s => {
      balances[s.from.toString()] += s.amount;
      balances[s.to.toString()] -= s.amount;
    });
 
    const result = group.members.map(member => ({
      userId: member._id,
      name: member.name,
      balance: Math.round(balances[member._id.toString()] * 100) / 100
    }));
 
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
router.get('/:groupId/settle-up', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate('members', 'name email');
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
 
    const isMember = group.members.some(m => m._id.toString() === req.userId);
    if (!isMember) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }
 
    const expenses = await Expense.find({ group: req.params.groupId });
 
    const balances = {};
    group.members.forEach(member => {
      balances[member._id.toString()] = 0;
    });
 
    expenses.forEach(exp => {
      const share = exp.amount / exp.splitBetween.length;
      balances[exp.paidBy.toString()] += exp.amount;
      exp.splitBetween.forEach(personId => {
        balances[personId.toString()] -= share;
      });
    });
 
    const settlements = await Settlement.find({ group: req.params.groupId });
    settlements.forEach(s => {
      balances[s.from.toString()] += s.amount;
      balances[s.to.toString()] -= s.amount;
    });
 
    const transactions = simplifyDebts(balances);
 
    const nameById = {};
    group.members.forEach(member => {
      nameById[member._id.toString()] = member.name;
    });
 
    const result = transactions.map(t => ({
      from: nameById[t.from],
      to: nameById[t.to],
      amount: t.amount
    }));
 
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
router.post('/:groupId/settlements', protect, async (req, res) => {
  try {
    const { to, amount } = req.body;
 
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
 
    const isMember = group.members.some(m => m.toString() === req.userId);
    if (!isMember) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }
 
    const settlement = await Settlement.create({
      group: req.params.groupId,
      from: req.userId,
      to,
      amount
    });
 
    res.status(201).json(settlement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
module.exports = router;