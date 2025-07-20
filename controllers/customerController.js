const Customer = require('../models/Customer');

exports.createCustomer = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const agency_id = req.user.agencyId;

    const customer = await Customer.create({ name, email, phone, agency_id });
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ message: 'Error creating customer', error: err.message });
  }
};


exports.getCustomers = async (req, res) => {
  const { sort_by = 'createdAt', sort_order = 'desc', limit, page } = req.query;

  try {
    const agency_id = req.user.agencyId;
    
    // Build base query options
    const queryOptions = {
      where: { agency_id },
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
      const { rows: customers, count: total } = await Customer.findAndCountAll(queryOptions);
      
      res.json({
        customers,
        total,
        page: parsedPage,
        totalPages: Math.ceil(total / parsedLimit),
        isPaginated: true
      });
    } else {
      // Get all customers without pagination
      const customers = await Customer.findAll(queryOptions);
      
      res.json({
        customers,
        total: customers.length,
        isPaginated: false
      });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error fetching customers', error: err.message });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const agency_id = req.user.agencyId;

    const customer = await Customer.findOne({ where: { id, agency_id } });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching customer', error: err.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const agency_id = req.user.agencyId;

    const customer = await Customer.findOne({ where: { id, agency_id } });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    await customer.update(req.body);
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: 'Error updating customer', error: err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const agency_id = req.user.agencyId;

    const customer = await Customer.findOne({ where: { id, agency_id } });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    await customer.destroy();
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting customer', error: err.message });
  }
};
