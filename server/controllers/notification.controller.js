const Notification = require('../models/Notification');

// @desc   Get my notifications
// @route  GET /api/notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ recipient: req.user.id })
        .populate('sender', 'name avatar')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments({ recipient: req.user.id, isRead: false }),
    ]);
    res.json({ success: true, notifications, unreadCount });
  } catch (err) { next(err); }
};

// @desc   Mark notification as read
// @route  PUT /api/notifications/:id/read
exports.markRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true, readAt: new Date() },
    );
    res.json({ success: true, message: 'Marked as read' });
  } catch (err) { next(err); }
};

// @desc   Mark all notifications as read
// @route  PUT /api/notifications/read-all
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() },
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
};

// @desc   Delete notification
// @route  DELETE /api/notifications/:id
exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user.id });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) { next(err); }
};
