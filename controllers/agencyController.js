
const Agency = require('../models/Agency');
const User = require('../models/User');

exports.createAgency = async (req, res) => {
  try {
    const { name, slug } = req.body;

    // Check if agency with same slug already exists
    const existingAgency = await Agency.findOne({ where: { slug } });
    if (existingAgency) {
      return res.status(400).json({ message: 'Agency with this slug already exists' });
    }

    const agency = await Agency.create({ name, slug });
    res.status(201).json(agency);
  } catch (err) {
    res.status(500).json({ message: 'Error creating agency', error: err.message });
  }
};

exports.getAgencies = async (req, res) => {
  try {
    const agencies = await Agency.findAll({
      include: [{
        model: User,
        attributes: ['id', 'name', 'email', 'role', 'createdAt']
      }]
    });
    res.json(agencies);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching agencies', error: err.message });
  }
};

exports.getAgencyById = async (req, res) => {
  try {
    const { id } = req.params;

    const agency = await Agency.findByPk(id, {
      include: [{
        model: User,
        attributes: ['id', 'name', 'email', 'role', 'createdAt']
      }]
    });
    
    if (!agency) return res.status(404).json({ message: 'Agency not found' });

    res.json(agency);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching agency', error: err.message });
  }
};

exports.getAgencyUsers = async (req, res) => {
  try {
    const { id } = req.params;

    const agency = await Agency.findByPk(id);
    if (!agency) return res.status(404).json({ message: 'Agency not found' });

    const users = await User.findAll({ 
      where: { agency_id: id },
      attributes: { exclude: ['password_hash'] }
    });

    res.json({
      agency: {
        id: agency.id,
        name: agency.name,
        slug: agency.slug
      },
      users
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching agency users', error: err.message });
  }
};

exports.updateAgency = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;

    const agency = await Agency.findByPk(id);
    if (!agency) return res.status(404).json({ message: 'Agency not found' });

    // Check if new slug conflicts with existing agency
    if (slug && slug !== agency.slug) {
      const existingAgency = await Agency.findOne({ where: { slug } });
      if (existingAgency) {
        return res.status(400).json({ message: 'Agency with this slug already exists' });
      }
    }

    await agency.update({ name, slug });
    res.json(agency);
  } catch (err) {
    res.status(500).json({ message: 'Error updating agency', error: err.message });
  }
};

exports.deleteAgency = async (req, res) => {
  try {
    const { id } = req.params;

    const agency = await Agency.findByPk(id);
    if (!agency) return res.status(404).json({ message: 'Agency not found' });

    // Check if agency has users
    const userCount = await User.count({ where: { agency_id: id } });
    if (userCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete agency with existing users. Please remove all users first.' 
      });
    }

    await agency.destroy();
    res.json({ message: 'Agency deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting agency', error: err.message });
  }
};
