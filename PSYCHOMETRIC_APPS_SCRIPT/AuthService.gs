/**
 * TRUSTGRID.AI - PSYCHOMETRIC & VIDEO ASSESSMENT PLATFORM
 * AuthService.gs - Role-Based Access Control and Authentication
 */

var AuthService = {
  /**
   * Authenticate User with email and password
   */
  login: function(email, password, ipAddress) {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }
    var cleanEmail = email.trim().toLowerCase();
    var user = DatabaseService.findOne(CONFIG.SHEETS.USERS, 'Email', cleanEmail);
    if (!user) {
      throw new Error('Invalid email or password.');
    }
    if (user.Status !== 'ACTIVE' || user.Record_Status === 'DELETED') {
      throw new Error('This account has been deactivated. Please contact support.');
    }

    var hashed = Utils.hashPassword(password);
    if (user.Password_Hash !== hashed) {
      AuditService.logEvent(user.Organization_ID, user.User_ID, 'AUTH_FAILED_LOGIN', 'USER', user.User_ID, { email: cleanEmail }, ipAddress);
      throw new Error('Invalid email or password.');
    }

    // Generate session token
    var sessionToken = 'TGT_' + Utils.generateSecureToken(40);
    var now = Utils.getIsoTimestamp();

    // Update Last_Login
    DatabaseService.update(CONFIG.SHEETS.USERS, 'User_ID', user.User_ID, {
      Last_Login: now
    });

    AuditService.logEvent(user.Organization_ID, user.User_ID, 'AUTH_SUCCESS_LOGIN', 'USER', user.User_ID, { email: cleanEmail }, ipAddress);

    return {
      token: sessionToken,
      user: {
        userId: user.User_ID,
        orgId: user.Organization_ID,
        fullName: user.Full_Name,
        email: user.Email,
        role: user.Role,
        status: user.Status
      }
    };
  },

  /**
   * Verify Candidate Access Token for an invitation
   */
  verifyInvitationToken: function(token) {
    if (!token) throw new Error('Invitation token is required.');
    var invitation = DatabaseService.findOne(CONFIG.SHEETS.ASSESSMENT_INVITATIONS, 'Invitation_Token', token);
    if (!invitation) {
      throw new Error('Invalid or expired assessment invitation token.');
    }
    if (invitation.Status === 'EXPIRED' || (invitation.Expiry_Date && new Date(invitation.Expiry_Date) < new Date())) {
      throw new Error('This assessment invitation has expired.');
    }
    var candidate = DatabaseService.findOne(CONFIG.SHEETS.CANDIDATES, 'Candidate_ID', invitation.Candidate_ID);
    var template = DatabaseService.findOne(CONFIG.SHEETS.ASSESSMENT_TEMPLATES, 'Template_ID', invitation.Template_ID);

    return {
      invitation: invitation,
      candidate: candidate,
      template: template
    };
  },

  /**
   * Enforce Role Hierarchy
   */
  hasPermission: function(userRole, requiredRole) {
    var hierarchy = {
      'SUPER_ADMIN': 5,
      'ORG_ADMIN': 4,
      'RECRUITER': 3,
      'EVALUATOR': 2,
      'CANDIDATE': 1
    };
    var userLevel = hierarchy[userRole] || 0;
    var requiredLevel = hierarchy[requiredRole] || 0;
    return userLevel >= requiredLevel;
  }
};
