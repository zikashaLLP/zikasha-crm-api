const { Op } = require('sequelize');
const Inquiry = require('../models/Inquiry');
const Customer = require('../models/Customer');
const Category = require('../models/Category');

exports.createInquiry = async (req, res) => {
  try {
    const { category_id, customer_id, followup_date, location } = req.body;
    const agency_id = req.user.agencyId;

    const inquiry = await Inquiry.create({
      category_id,
      customer_id,
      followup_date,
      location,
      agency_id
    });

    res.status(201).json(inquiry);
  } catch (err) {
    res.status(500).json({ message: 'Error creating inquiry', error: err.message });
  }
};

exports.getInquiries = async (req, res) => {
  try {
    const agency_id = req.user.agencyId;
    const { category_id, customer_id, followup_date_start, followup_date_end, exclude_categories } = req.query;

    const where = { agency_id };

    if (category_id) where.category_id = category_id;
    if (customer_id) where.customer_id = customer_id;

    // Handle followup_date filters
    if (followup_date_start || followup_date_end) {
      // Filter for date range
      where.followup_date = {};
      
      if (followup_date_start) {
        where.followup_date[Op.gte] = followup_date_start;
      }
      
      if (followup_date_end) {
        where.followup_date[Op.lte] = followup_date_end;
      }
    }

    if (exclude_categories) {
      // Exclude specific categories
      where.category_id = { [Op.notIn]: exclude_categories.split(',').map(Number) };
    }

    // Pagination and sorting
    const { sort_by = 'createdAt', sort_order = 'desc', limit = 20, page = 1 } = req.query;
    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const offset = (parsedPage - 1) * parsedLimit;

    const inquiries = await Inquiry.findAll({
      where,
      include: [Customer, Category],
      order: [[sort_by, sort_order]],
      limit: parsedLimit,
      offset
    });

    res.json(inquiries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching inquiries', error: err.message });
  }
};

exports.getInquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    const agency_id = req.user.agencyId;

    const inquiry = await Inquiry.findOne({
      where: { id, agency_id },
      include: [Customer, Category]
    });

    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

    res.json(inquiry);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching inquiry', error: err.message });
  }
};

exports.updateInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const agency_id = req.user.agencyId;

    const inquiry = await Inquiry.findOne({ where: { id, agency_id } });
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

    await inquiry.update(req.body);
    res.json(inquiry);
  } catch (err) {
    res.status(500).json({ message: 'Error updating inquiry', error: err.message });
  }
};

exports.deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const agency_id = req.user.agencyId;

    const inquiry = await Inquiry.findOne({ where: { id, agency_id } });
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

    await inquiry.destroy();
    res.json({ message: 'Inquiry deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting inquiry', error: err.message });
  }
};
