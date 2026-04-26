const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('weight');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/', auth, async (req, res) => {
  try {
    const { weight } = req.body;

    if (weight === undefined) {
      return res.status(400).json({ message: 'Please provide weight' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { weight },
      { new: true }
    ).select('weight');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
