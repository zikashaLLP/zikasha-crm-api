const Log = require('../models/Log');
const Inquiry = require('../models/Inquiry');

// exports.createLog = async (req, res) => {
//   try {
//     const { inquiry_id, content, hint, category, followup_date } = req.body;
//     const agency_id = req.user.agencyId;

//     const inquiry = await Inquiry.findOne({ where: { id: inquiry_id, agency_id } });
//     if (!inquiry) return res.status(404).json({ message: 'Inquiry not found or unauthorized' });

//     const log = await Log.create({ inquiry_id, content, hint });
//     res.status(201).json(log);
//   } catch (err) {
//     res.status(500).json({ message: 'Error creating log', error: err.message });
//   }
// };

exports.createLog = async (req, res) => {
  try {
    const { inquiry_id, content, hint, category_id, followup_date } = req.body;
    const agency_id = req.user.agencyId;

    // Check if inquiry exists and belongs to the same agency
    const inquiry = await Inquiry.findOne({ where: { id: inquiry_id, agency_id } });
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found or unauthorized' });

    // Update inquiry with new category_id and followup_date if provided
    await inquiry.update({
      ...(category_id && { category_id }),
      ...(followup_date && { followup_date }),
      latest_log: content,
    });

    // Create the log entry
    const log = await Log.create({ inquiry_id, content, hint, followup_date });

    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: 'Error creating log', error: err.message });
  }
};


exports.getLogsByInquiry = async (req, res) => {
  try {
    const { inquiryId } = req.params;
    const agency_id = req.user.agencyId;

    const inquiry = await Inquiry.findOne({ where: { id: inquiryId, agency_id } });
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found or unauthorized' });

    const logs = await Log.findAll({ where: { inquiry_id: inquiryId } });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching logs', error: err.message });
  }
};

exports.deleteLog = async (req, res) => {
  try {
    const { id } = req.params;
    const agency_id = req.user.agencyId;

    const log = await Log.findOne({
      where: { id },
      include: {
        model: Inquiry,
        where: { agency_id }
      }
    });

    if (!log) return res.status(404).json({ message: 'Log not found or unauthorized' });

    await log.destroy();
    res.json({ message: 'Log deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting log', error: err.message });
  }
};
