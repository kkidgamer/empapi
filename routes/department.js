const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { Department, Employee } = require('../models/model');
const auth = require('../middleware/auth');

// Create a new department
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, managerId } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Department name is required' });
    }

    // Validate managerId if provided
    if (managerId && !mongoose.Types.ObjectId.isValid(managerId)) {
      return res.status(400).json({ message: 'Invalid managerId format' });
    }
    if (managerId) {
      const managerExist = await Employee.findById(managerId);
      if (!managerExist) {
        return res.status(404).json({ message: 'Manager not found' });
      }
    }

    const department = new Department({ name, description, managerId });
    await department.save();
    res.status(201).json({ message: 'Department created successfully', department });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Department name already exists' });
    }
    res.status(500).json({ message: error.message });
  }
});

// View all departments
router.get('/', auth, async (req, res) => {
  try {
    const departments = await Department.find().populate('managerId', 'firstName lastName');
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// View single department
router.get('/:name', auth, async (req, res) => {
  try {
    const { name } = req.params; // Changed to URL parameter for consistency
    if (!name) {
      return res.status(400).json({ message: 'Department name is required' });
    }
    const department = await Department.findOne({ name }).populate('managerId', 'firstName lastName');
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.status(200).json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update department
router.put('/:name', auth, async (req, res) => {
  try {
    const { name } = req.params;
    const { description, managerId } = req.body;

    // Validate managerId if provided
    if (managerId && !mongoose.Types.ObjectId.isValid(managerId)) {
      return res.status(400).json({ message: 'Invalid managerId format' });
    }
    if (managerId) {
      const managerExist = await Employee.findById(managerId);
      if (!managerExist) {
        return res.status(404).json({ message: 'Manager not found' });
      }
    }

    const department = await Department.findOneAndUpdate(
      { name }, // Find by department name
      { $set: { description, managerId, updatedAt: Date.now() } }, // Update fields
      { new: true, runValidators: true } // Return updated document, run schema validators
    );

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.status(200).json({ message: 'Department updated successfully', department });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid managerId format' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Delete a department
router.delete('/:name', auth, async (req, res) => {
  try {
    const { name } = req.params;
    if (!name) {
      return res.status(400).json({ message: 'Department name is required' });
    }
    const department = await Department.findOneAndDelete({ name });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.status(200).json({ message: 'Department deleted successfully', department });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;