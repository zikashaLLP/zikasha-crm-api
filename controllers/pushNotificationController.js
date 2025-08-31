const User = require("../models/User");

exports.subscribe =  async (req, res) => {
  try {
    const { subscription } = req.body;
    
    const { userId } = req.user;
  
    // Save subscription in the database
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await user.update({ notification_subscription: JSON.stringify(subscription) });
    
    res.json({ success: true, message: 'Subscription added successfully' });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Failed to add subscription' });
  }
};

exports.unsubscribe = async (req, res) => {
  try {
    const { userId } = req.user;

    // Remove subscription from the database
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await user.update({ notification_subscription: null });

    res.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
};