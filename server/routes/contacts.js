const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const authMiddleware = require('../middleware/auth');

// POST /api/contacts — public, submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const contact = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      ipAddress: req.ip || req.connection.remoteAddress || ''
    });

    await contact.save();

    res.status(201).json({
      message: 'Message sent successfully! I\'ll get back to you soon.',
      id: contact._id
    });

  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    console.error('Contact save error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// GET /api/contacts — protected, get all contacts with filters
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const query = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [contacts, total] = await Promise.all([
      Contact.find(query).sort(sort).skip(skip).limit(parseInt(limit)),
      Contact.countDocuments(query)
    ]);

    // Stats
    const [newCount, readCount, repliedCount, archivedCount] = await Promise.all([
      Contact.countDocuments({ status: 'new' }),
      Contact.countDocuments({ status: 'read' }),
      Contact.countDocuments({ status: 'replied' }),
      Contact.countDocuments({ status: 'archived' })
    ]);

    res.json({
      contacts,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
      stats: { new: newCount, read: readCount, replied: repliedCount, archived: archivedCount, total: newCount + readCount + repliedCount + archivedCount }
    });

  } catch (err) {
    console.error('Get contacts error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/contacts/:id — protected
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found.' });

    // Auto-mark as read when opened
    if (contact.status === 'new') {
      contact.status = 'read';
      await contact.save();
    }

    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PATCH /api/contacts/:id — protected, update status or notes
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const update = {};
    if (status) update.status = status;
    if (notes !== undefined) update.notes = notes;

    const contact = await Contact.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!contact) return res.status(404).json({ message: 'Contact not found.' });

    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/contacts/:id — protected
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found.' });
    res.json({ message: 'Contact deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/contacts — protected, bulk delete
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ message: 'ids array required.' });
    await Contact.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${ids.length} contact(s) deleted.` });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
