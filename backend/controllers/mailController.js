const sendMail = require("../config/mailer");
const Email = require("../models/emailModel");

async function sendEmail(req, res) {
  try {
    const { to, cc = [], from, type, subject, text, senderId, recipientId, recipientIds = [], ccIds = [] } = req.body;
    
    // Handle multiple recipients
    const recipients = Array.isArray(to) ? to : [to];
    const ccRecipients = Array.isArray(cc) ? cc : [];
    
    // Send single email with all recipients and CC
    await sendMail({
      from: from,
      to: recipients,
      cc: ccRecipients.length > 0 ? ccRecipients : undefined,
      type: type,
      subject: subject || "Notification from OneAim Organisation",
      text: text ||
        `You have a new notification from ${from} under OneAim Organisation, Kindly check your dashboard for more details.`,
    });

    // Store email data in DB
    const emailDoc = new Email({
      type: type,
      sender: from,
      recipient: recipients[0], // Primary recipient for backward compatibility
      recipients: recipients,
      senderId: senderId,
      recipientId: recipientId || recipientIds[0], // Primary recipient ID for backward compatibility
      recipientIds: recipientIds,
      cc: ccRecipients,
      ccIds: ccIds,
      subject: subject || "Notification from OneAim Organisation",
      message: text ||
        `You have a new notification from ${from} under OneAim Organisation, Kindly check your dashboard for more details.`,
      status: "sent",
    });
    await emailDoc.save();
 
    res.json({ success: true, message: "Email sent to all recipients" });
  } catch (err) {
    await Email.create({
      type: req.body.type,
      sender: req.body.from,
      recipient: Array.isArray(req.body.to) ? req.body.to[0] : req.body.to,
      recipients: Array.isArray(req.body.to) ? req.body.to : [req.body.to],
      senderId: req.body.senderId,
      recipientId: req.body.recipientId || req.body.recipientIds?.[0],
      recipientIds: req.body.recipientIds || [],
      cc: req.body.cc || [],
      ccIds: req.body.ccIds || [],
      subject: req.body.subject || "Notification from OneAim Organisation",
      message: req.body.text ||
        `You have a new notification from ${req.body.from} under OneAim Organisation, Kindly check your dashboard for more details.`,
      status: "failed",
    });

    res
      .status(500)
      .json({ success: false, message: "Email failed", error: err.message });
  }
}

async function sendEmailToMultipleRecipients(req, res) {
  const { recipients, cc = [], subject, text } = req.body;
  if (!Array.isArray(recipients) || recipients.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No recipients provided" });
  }
  
  try {
    const ccRecipients = Array.isArray(cc) ? cc : [];
    
    // Send single email with all recipients and CC
    await sendMail({
      from: req.body.from,
      to: recipients,
      cc: ccRecipients.length > 0 ? ccRecipients : undefined,
      subject: subject || "Notification from OneAim Organisation",
      text:
        text ||
        `You have a new notification from ${req.body.from} under OneAim Organisation, Kindly check your dashboard for more details.`,
    });

    // Store email in DB (single record for the multi-recipient email)
    const emailDoc = new Email({
      type: req.body.type,
      sender: req.body.from,
      recipient: recipients[0], // Primary recipient for backward compatibility
      recipients: recipients,
      cc: ccRecipients,
      subject: subject || "Notification from OneAim Organisation",
      message:
        text ||
        `You have a new notification from ${req.body.from} under OneAim Organisation, Kindly check your dashboard for more details.`,
      status: "sent",
    });
    await emailDoc.save();

    res.json({ success: true, message: "Email sent to all recipients" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Email failed", error: err.message });
  }
}

// Handle email queries with optional filters: sender, recipient, type, status, subject
async function getAllEmails(req, res) {
  try {
    const query = {};
    if (req.query.senderId) query.senderId = req.query.senderId;
    if (req.query.recipientId) {
      query.$or = [
        { recipientId: req.query.recipientId },
        { recipientIds: req.query.recipientId },
        { ccIds: req.query.recipientId }
      ];
    }
    if (req.query.type) query.type = req.query.type;
    if (req.query.status) query.status = req.query.status;
    if (req.query.subject) query.subject = { $regex: req.query.subject, $options: "i" };

    console.log('Mail query:', query);
    console.log('Request query params:', req.query);

    const emails = await Email.find(query).sort({ sentAt: -1 });
    console.log('Found emails count:', emails.length);
    
    if (emails.length === 0) {
      // Do a broader search to check if emails exist at all
      const totalEmails = await Email.countDocuments({});
      console.log('Total emails in database:', totalEmails);
      
      // Check one email to verify schema
      if (totalEmails > 0) {
        const sampleEmail = await Email.findOne({});
        console.log('Sample email structure:', {
          id: sampleEmail._id,
          senderId: sampleEmail.senderId,
          recipientId: sampleEmail.recipientId,
          subject: sampleEmail.subject
        });
      }
    }
    
    res.json({ success: true, emails });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch emails",
        error: err.message,
      });
  }
}

async function getById(req, res) {
  try {
    const email = await Email.findById(req.params.id);
    if (!email) {
      return res
        .status(404)
        .json({ success: false, message: "Email not found" });
    }
    res.json({ success: true, email });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch email",
        error: err.message,
      });
  }
}

async function getSentEmailsByEmployeeId(req, res) {
  const empId = req.params.empId;
  try {
    const emails = await Email.find({ sender: empId }).sort({ sentAt: -1 });
    res.json({ success: true, emails });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch emails",
        error: err.message,
      });
  }
}

async function getReceivedEmailsByEmployeeId(req, res) {
  const empId = req.params.empId;
  try {
    const emails = await Email.find({ recipient: empId }).sort({ sentAt: -1 });
    res.json({ success: true, emails });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch emails",
        error: err.message,
      });
  }
}

module.exports = {
  sendEmail,
  sendEmailToMultipleRecipients,
  getAllEmails,
  getById,
  getSentEmailsByEmployeeId,
  getReceivedEmailsByEmployeeId,
};
