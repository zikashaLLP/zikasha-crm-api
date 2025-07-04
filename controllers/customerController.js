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
  try {
    const agency_id = req.user.agencyId;
    const customers = await Customer.findAll({ where: { agency_id } });
    res.json(customers);
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
