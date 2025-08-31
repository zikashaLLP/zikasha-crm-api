const cron = require('node-cron');
const { Op } = require('sequelize');
const Inquiry = require('../models/Inquiry');
const User = require('../models/User');
const Customer = require('../models/Customer');
const webpush = require('web-push');

// Configure web-push with your VAPID keys
webpush.setVapidDetails(
  'mailto:example@gmail.com', // Replace with your email
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Function to send push notification
async function sendPushNotification(subscription, payload) {
    try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
    } catch (error) {
         if (error.statusCode === 404 || error.statusCode === 410) {
          subscriptions.delete(sub.endpoint);
        }
        throw err;
        console.error('Error sending push notification:', error);
    }
}

// Function to check and send notifications
async function checkInquiryFollowups() {

  try {
    let currentTime = new Date();
    let tenMinutesFromNow = new Date(currentTime.getTime() + 10 * 60000);
    
    currentTime = currentTime.toUTCString();
    tenMinutesFromNow = tenMinutesFromNow.toUTCString();
    

    // Find inquiries with followup_date within the next 10 minutes
    const inquiries = await Inquiry.findAll({
      where: {
        followup_date: {
          [Op.between]: [currentTime, tenMinutesFromNow]
        },
        notified: {
          [Op.or]: [false, null] // Only send for non-notified inquiries
        }
      },
      include: [Customer, User]
    });
    

    // Send notifications for each inquiry
    for (const inquiry of inquiries) {

        if (inquiry.User && inquiry.User.notification_subscription) {

            const subscription = JSON.parse(inquiry.User.notification_subscription);
            let customerName = inquiry.Customer ? inquiry.Customer.name : 'the customer';
            const payload = {
                title: 'Inquiry Followup Reminder',
                body: `You have a follow-up scheduled with ${customerName} in the next 10 minutes`,
                data: {
                    inquiryId: inquiry.id,
                    url: `/inquiries/${inquiry.id}`
                }
            };

            try {
                await webpush.sendNotification(subscription, JSON.stringify(payload));
            } catch (error) {
                if (error.statusCode === 404 || error.statusCode === 410) {
                  // Remove invalid subscription from database.
                  await inquiry.User.update({ notification_subscription: null });
                }

                console.error('Error sending push notification:', error?.message);
            }
                    
            
            // Mark inquiry as notified
            await inquiry.update({ notified: true });
        }
    }
  } catch (error) {
    console.error('Error in checkInquiryFollowups:', error);
  }
}

// Schedule cron job to run every 1 minutes
const scheduleInquiryNotifications = () => {
  cron.schedule('*/1 * * * *', checkInquiryFollowups);
  console.log('Inquiry notification cron job scheduled');
};

module.exports = scheduleInquiryNotifications;