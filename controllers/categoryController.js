const Category = require('../models/Category');

exports.createCategory = async (req, res) => {
  try {
    const { name, slug } = req.body;
    const agency_id = req.user.agencyId;

    const category = await Category.create({ name, slug, agency_id });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: 'Error creating category', error: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const agency_id = req.user.agencyId;
    const categories = await Category.findAll({ where: { agency_id } });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching categories', error: err.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const agency_id = req.user.agencyId;

    const category = await Category.findOne({ where: { id, agency_id } });
    if (!category) return res.status(404).json({ message: 'Category not found' });

    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching category', error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const agency_id = req.user.agencyId;

    const category = await Category.findOne({ where: { id, agency_id } });
    if (!category) return res.status(404).json({ message: 'Category not found' });

    await category.update(req.body);
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Error updating category', error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const agency_id = req.user.agencyId;

    const category = await Category.findOne({ where: { id, agency_id } });
    if (!category) return res.status(404).json({ message: 'Category not found' });

    await category.destroy();
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting category', error: err.message });
  }
};
