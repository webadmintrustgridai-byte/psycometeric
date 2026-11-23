/**
 * TRUSTGRID.AI - PSYCHOMETRIC & VIDEO ASSESSMENT PLATFORM
 * EmailService.gs - Transactional Email Templates & Notifications
 */

var EmailService = {
  /**
   * Send assessment invitation email
   */
  sendAssessmentInvitation: function(candidate, template, token, invitationId) {
    if (!candidate || !candidate.Email) return;

    var subject = 'Invitation: ' + (template ? template.Title : 'Psychometric Assessment') + ' - TRUSTGRID.AI';
    var webAppUrl = getConfigValue('WEB_APP_URL', 'https://trustgrid.ai');
    var testLink = webAppUrl + '?token=' + token + '&view=assessment';

    var htmlBody = '' +
      '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">' +
      '  <div style="background-color: #001A9C; padding: 16px; border-radius: 6px; text-align: center; color: white;">' +
      '    <h2 style="margin: 0; letter-spacing: 1px;">TRUSTGRID.AI</h2>' +
      '    <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Talent Assessment & Video Intelligence</p>' +
      '  </div>' +
      '  <div style="padding: 24px 0;">' +
      '    <p>Dear <strong>' + candidate.Full_Name + '</strong>,</p>' +
      '    <p>You have been invited to complete the <strong>' + (template ? template.Title : 'Online Talent Assessment') + '</strong>.</p>' +
      '    <p>This assessment is designed to measure your cognitive problem-solving, situational reasoning, and workplace preferences in an objective, bias-free environment.</p>' +
      '    <div style="background: #f8fafc; padding: 16px; border-left: 4px solid #001A9C; margin: 20px 0;">' +
      '      <p style="margin: 0;"><strong>Estimated Duration:</strong> ' + (template ? template.Time_Limit_Minutes : 45) + ' Minutes</p>' +
      '      <p style="margin: 4px 0 0;"><strong>System Check:</strong> Please ensure a stable internet connection.</p>' +
      '    </div>' +
      '    <div style="text-align: center; margin: 30px 0;">' +
      '      <a href="' + testLink + '" style="background: #001A9C; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Start Assessment Now</a>' +
      '    </div>' +
      '    <p style="font-size: 12px; color: #64748b;">If the button does not work, copy and paste this link in your browser:<br>' + testLink + '</p>' +
      '  </div>' +
      '  <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #94a3b8; text-align: center;">' +
      '    &copy; 2026 TRUSTGRID.AI. All rights reserved. Follows Indian DPDP Act & international privacy standards.' +
      '  </div>' +
      '</div>';

    try {
      MailApp.sendEmail({
        to: candidate.Email,
        subject: subject,
        htmlBody: htmlBody
      });
      this.logNotification(candidate.Email, 'CANDIDATE', subject, 'EMAIL', 'DELIVERED');
    } catch (e) {
      Logger.log('Email delivery failed: ' + e.message);
      this.logNotification(candidate.Email, 'CANDIDATE', subject, 'EMAIL', 'FAILED: ' + e.message);
    }
  },

  /**
   * Log notification to DB_19_Notifications
   */
  logNotification: function(recipient, type, subject, channel, status) {
    try {
      var all = DatabaseService.findAll(CONFIG.SHEETS.NOTIFICATIONS);
      var record = {
        Notification_ID: Utils.generateId(CONFIG.PREFIXES.NOTIFICATION, all.length + 1),
        Recipient_Email: recipient,
        Recipient_Type: type,
        Subject: subject,
        Message_Body: 'Email notification dispatched via Google Apps Script MailApp.',
        Channel: channel || 'EMAIL',
        Delivery_Status: status || 'SENT',
        Sent_At: Utils.getIsoTimestamp(),
        Created_At: Utils.getIsoTimestamp()
      };
      DatabaseService.insert(CONFIG.SHEETS.NOTIFICATIONS, record);
    } catch (e) {
      // Ignore
    }
  }
};
