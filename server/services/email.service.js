const createTransporter = require('../config/email');

// ── Base HTML Email Template ───────────────────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Opportunity Hub 2.0</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #F1F5F9; margin: 0; padding: 0; }
  .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #1D4ED8, #2563EB, #4F46E5); padding: 36px 40px; text-align: center; }
  .header-logo { font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -0.5px; margin-bottom: 4px; }
  .header-sub { color: rgba(255,255,255,0.8); font-size: 13px; margin: 0; }
  .body { padding: 40px; }
  .body p { color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
  .btn { display: inline-block; background: linear-gradient(135deg, #2563EB, #4F46E5); color: #fff !important; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; margin: 12px 0 28px; letter-spacing: 0.3px; }
  .divider { border: none; border-top: 1px solid #E5E7EB; margin: 28px 0; }
  .note { font-size: 13px !important; color: #6B7280 !important; }
  .footer { background: #F8FAFC; padding: 24px 40px; text-align: center; border-top: 1px solid #E5E7EB; }
  .footer p { color: #9CA3AF; font-size: 12px; margin: 4px 0; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="header-logo">⚡ OpportunityHub 2.0</div>
    <p class="header-sub">AI-Powered Career Opportunities Platform</p>
  </div>
  <div class="body">${content}</div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} OpportunityHub 2.0. All rights reserved.</p>
    <p>If you didn't request this email, you can safely ignore it.</p>
  </div>
</div>
</body>
</html>`;

// ── Core send function ─────────────────────────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"OpportunityHub 2.0" <${process.env.EMAIL_FROM || 'noreply@opportunityhub2.dev'}>`,
    to,
    subject,
    html,
  });
};

// ── Email functions ────────────────────────────────────────────────────────────
exports.sendVerificationEmail = async (email, name, verifyUrl) => {
  const html = baseTemplate(`
    <p>Hi <strong>${name}</strong>,</p>
    <p>Welcome to <strong>OpportunityHub 2.0</strong>! 🎉 You're one step away from accessing hundreds of verified career opportunities.</p>
    <p>Please click the button below to verify your email address:</p>
    <a href="${verifyUrl}" class="btn">✅ Verify Email Address</a>
    <hr class="divider" />
    <p class="note">⏱️ This link expires in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.</p>
  `);
  await sendEmail({ to: email, subject: '✅ Verify your OpportunityHub 2.0 account', html });
};

exports.sendWelcomeEmail = async (email, name) => {
  const html = baseTemplate(`
    <p>Hi <strong>${name}</strong>,</p>
    <p>🎉 Your email has been verified! You're now officially part of the <strong>OpportunityHub 2.0</strong> community.</p>
    <p>Here's what you can do next:</p>
    <ul style="color:#374151;line-height:2.2;padding-left:20px">
      <li>📝 Complete your profile and upload your resume</li>
      <li>🔍 Browse jobs, internships, hackathons & scholarships</li>
      <li>🤖 Use AI tools to analyze & enhance your profile</li>
      <li>💬 Connect with mentors, coaches, and career resources</li>
    </ul>
    <a href="${process.env.CLIENT_URL}/student/dashboard" class="btn">🚀 Go to Dashboard</a>
  `);
  await sendEmail({ to: email, subject: '🎉 Welcome to OpportunityHub 2.0!', html });
};

exports.sendPasswordResetEmail = async (email, name, resetUrl) => {
  const html = baseTemplate(`
    <p>Hi <strong>${name}</strong>,</p>
    <p>We received a request to reset your <strong>OpportunityHub 2.0</strong> password.</p>
    <p>Click the button below to set a new password:</p>
    <a href="${resetUrl}" class="btn">🔒 Reset My Password</a>
    <hr class="divider" />
    <p class="note">⏱️ This link expires in <strong>30 minutes</strong>. If you didn't request this, please ignore this email — your password will remain unchanged.</p>
  `);
  await sendEmail({ to: email, subject: '🔒 Reset your OpportunityHub 2.0 password', html });
};

exports.sendApplicationUpdateEmail = async (email, name, jobTitle, company, status) => {
  const messages = {
    under_review: '📋 Your application is now <strong>under review</strong>. We\'ll keep you updated!',
    interview:    '🎉 Great news! You\'ve been <strong>shortlisted for an interview</strong>. Check your dashboard for details.',
    selected:     '🏆 <strong>Congratulations!</strong> You have been <strong>SELECTED</strong>! Reach out to the company for next steps.',
    rejected:     '💪 Unfortunately, your application was not selected this time. Don\'t give up — keep applying!',
  };
  const html = baseTemplate(`
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been updated:</p>
    <p style="font-size:17px;font-weight:700;color:#2563EB;background:#EFF6FF;padding:16px;border-radius:8px;border-left:4px solid #2563EB">
      ${messages[status] || `Status: ${status}`}
    </p>
    <a href="${process.env.CLIENT_URL}/student/applications" class="btn">📋 View Application</a>
  `);
  await sendEmail({ to: email, subject: `Application Update — ${jobTitle} at ${company}`, html });
};

exports.sendCompanyApprovalEmail = async (email, companyName, approved, reason = '') => {
  const html = baseTemplate(approved
    ? `<p>Great news! Your company <strong>${companyName}</strong> has been <strong>approved</strong> on OpportunityHub 2.0.</p>
       <p>You can now post job opportunities and start hiring talented candidates.</p>
       <a href="${process.env.CLIENT_URL}/company/dashboard" class="btn">🏢 Go to Company Dashboard</a>`
    : `<p>Unfortunately, your company <strong>${companyName}</strong> was not approved at this time.</p>
       ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
       <p>Please contact our support team if you believe this is a mistake.</p>`
  );
  await sendEmail({
    to:      email,
    subject: approved ? `✅ ${companyName} approved on OpportunityHub 2.0` : `❌ Company registration update — ${companyName}`,
    html,
  });
};
