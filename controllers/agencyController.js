
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

// exports.getAgencyUsers = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { sort_by = 'createdAt', sort_order = 'desc', limit, page } = req.query;

//     const agency = await Agency.findByPk(id);
//     if (!agency) return res.status(404).json({ message: 'Agency not found' });

//     const users = await User.findAll({ 
//       where: { agency_id: id },
//       attributes: { exclude: ['password_hash'] }
//     });

//     res.json({
//       agency: {
//         id: agency.id,
//         name: agency.name,
//         slug: agency.slug
//       },
//       users
//     });
//   } catch (err) {
//     res.status(500).json({ message: 'Error fetching agency users', error: err.message });
//   }
// };

exports.getAgencyUsers = async (req, res) => {
  try {
    const agency_id = req.user.agencyId;
    const { sort_by = 'createdAt', sort_order = 'desc', limit, page } = req.query;

    const agency = await Agency.findByPk(agency_id);
    if (!agency) return res.status(404).json({ message: 'Agency not found' });

    // Build base query options
    const queryOptions = {
      where: { agency_id },
      attributes: { exclude: ['password_hash'] },
      order: [[sort_by, sort_order]]
    };

    // Only add pagination if both limit and page are provided
    if (limit && page) {
      const parsedLimit = parseInt(limit);
      const parsedPage = parseInt(page);
      const offset = (parsedPage - 1) * parsedLimit;
      
      queryOptions.limit = parsedLimit;
      queryOptions.offset = offset;
      
      // Get paginated results with count
      const { rows: users, count: total } = await User.findAndCountAll(queryOptions);
      
      res.json({
        agency: {
          id: agency.id,
          name: agency.name,
          slug: agency.slug
        },
        users,
        total,
        page: parsedPage,
        totalPages: Math.ceil(total / parsedLimit),
        isPaginated: true
      });
    } else {
      // Get all users without pagination
      const users = await User.findAll(queryOptions);
      
      res.json({
        agency: {
          id: agency.id,
          name: agency.name,
          slug: agency.slug
        },
        users,
        total: users.length,
        isPaginated: false
      });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error fetching agency users', error: err.message });
  }
};

exports.updateAgencyUser = async (req, res) => {
  try {
    const { id, user_id } = req.params;
    const { name, email, role } = req.body;
    
    // Check if admin is updating user for their agency
    if (req.user.role === 'admin' && req.user.agencyId !== Number(id)) {
      return res.status(403).json({ message: 'You can only update users for your own agency' });
    }

    const user = await User.findByPk(user_id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if email already exists for another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    await user.update({ name, email, role });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error updating user', error: err.message });
  }
}

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
