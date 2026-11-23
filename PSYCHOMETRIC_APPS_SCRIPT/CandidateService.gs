/**
 * TRUSTGRID.AI - PSYCHOMETRIC & VIDEO ASSESSMENT PLATFORM
 * CandidateService.gs - Complete Candidate Lifecycle & GDPR/DPDP Compliant Record Management
 */

var CandidateService = {
  /**
   * Register or Create a new Candidate
   */
  createCandidate: function(candidateData, creatorUserId) {
    var val = ValidationService.validateCandidate(candidateData);
    if (!val.isValid) {
      throw new Error(val.errors.join(' '));
    }

    var cleanEmail = candidateData.Email.trim().toLowerCase();

    // Duplicate Check
    var existing = DatabaseService.findAll(CONFIG.SHEETS.CANDIDATES, function(c) {
      return c.Email && c.Email.trim().toLowerCase() === cleanEmail && c.Record_Status !== 'DELETED';
    });

    if (existing.length > 0) {
      throw new Error('A candidate with email ' + cleanEmail + ' already exists (Candidate ID: ' + existing[0].Candidate_ID + ').');
    }

    var allCandidates = DatabaseService.findAll(CONFIG.SHEETS.CANDIDATES);
    var candidateId = Utils.generateId(CONFIG.PREFIXES.CAN, allCandidates.length + 1);

    var newCandidate = {
      Candidate_ID: candidateId,
      Organization_ID: candidateData.Organization_ID,
      Full_Name: candidateData.Full_Name.trim(),
      Email: cleanEmail,
      Phone_Number: candidateData.Phone_Number || '',
      Location: candidateData.Location || '',
      Qualification: candidateData.Qualification || '',
      University: candidateData.University || '',
      Graduation_Year: candidateData.Graduation_Year || '',
      Total_Experience: candidateData.Total_Experience || '',
      Current_Organization: candidateData.Current_Organization || '',
      Current_Designation: candidateData.Current_Designation || '',
      Industry: candidateData.Industry || '',
      Skills: candidateData.Skills || '',
      LinkedIn_URL: candidateData.LinkedIn_URL || '',
      Portfolio_URL: candidateData.Portfolio_URL || '',
      Resume_File_ID: candidateData.Resume_File_ID || '',
      Resume_URL: candidateData.Resume_URL || '',
      Profile_Photo: candidateData.Profile_Photo || '',
      Registration_Date: Utils.getIsoTimestamp(),
      Verification_Status: candidateData.Verification_Status || 'PENDING',
      Consent_Status: candidateData.Consent_Status || 'GRANTED',
      Record_Status: 'ACTIVE',
      Created_At: Utils.getIsoTimestamp(),
      Updated_At: Utils.getIsoTimestamp()
    };

    DatabaseService.insert(CONFIG.SHEETS.CANDIDATES, newCandidate);

    AuditService.logEvent(
      candidateData.Organization_ID,
      creatorUserId || candidateId,
      'CANDIDATE_REGISTERED',
      'CANDIDATE',
      candidateId,
      { email: cleanEmail, name: candidateData.Full_Name }
    );

    return newCandidate;
  },

  /**
   * Get Candidate by ID with aggregated history
   */
  getCandidateById: function(candidateId) {
    var candidate = DatabaseService.findOne(CONFIG.SHEETS.CANDIDATES, 'Candidate_ID', candidateId);
    if (!candidate || candidate.Record_Status === 'DELETED') {
      throw new Error('Candidate not found.');
    }

    // Attach related assessments, video profiles, and reports
    var attempts = DatabaseService.findBy(CONFIG.SHEETS.ASSESSMENT_ATTEMPTS, 'Candidate_ID', candidateId);
    var videos = DatabaseService.findBy(CONFIG.SHEETS.CANDIDATE_VIDEO_PROFILES, 'Candidate_ID', candidateId);
    var interviewResponses = DatabaseService.findBy(CONFIG.SHEETS.VIDEO_RESPONSES, 'Candidate_ID', candidateId);
    var reports = DatabaseService.findBy(CONFIG.SHEETS.FINAL_REPORTS, 'Candidate_ID', candidateId);

    return {
      profile: candidate,
      assessmentAttempts: attempts,
      videoProfiles: videos,
      interviewResponses: interviewResponses,
      reports: reports
    };
  },

  /**
   * Search / Filter Candidates
   */
  searchCandidates: function(orgId, query, statusFilter) {
    return DatabaseService.findAll(CONFIG.SHEETS.CANDIDATES, function(c) {
      if (c.Record_Status === 'DELETED') return false;
      if (orgId && c.Organization_ID !== orgId) return false;
      if (statusFilter && c.Verification_Status !== statusFilter) return false;

      if (!query) return true;
      var q = query.toLowerCase();
      var name = (c.Full_Name || '').toLowerCase();
      var email = (c.Email || '').toLowerCase();
      var skills = (c.Skills || '').toLowerCase();
      var desig = (c.Current_Designation || '').toLowerCase();

      return name.indexOf(q) !== -1 || email.indexOf(q) !== -1 || skills.indexOf(q) !== -1 || desig.indexOf(q) !== -1;
    });
  },

  /**
   * Update Candidate Profile
   */
  updateCandidate: function(candidateId, updates, userId) {
    var updated = DatabaseService.update(CONFIG.SHEETS.CANDIDATES, 'Candidate_ID', candidateId, updates);
    AuditService.logEvent(updated.Organization_ID, userId || candidateId, 'CANDIDATE_UPDATED', 'CANDIDATE', candidateId, updates);
    return updated;
  },

  /**
   * Check for duplicate candidate before creating
   */
  checkDuplicate: function(email, phone) {
    var matches = [];
    if (email) {
      var emailMatch = DatabaseService.findOne(CONFIG.SHEETS.CANDIDATES, 'Email', email.trim().toLowerCase());
      if (emailMatch && emailMatch.Record_Status !== 'DELETED') matches.push(emailMatch);
    }
    if (phone && matches.length === 0) {
      var phoneMatch = DatabaseService.findOne(CONFIG.SHEETS.CANDIDATES, 'Phone_Number', phone.trim());
      if (phoneMatch && phoneMatch.Record_Status !== 'DELETED') matches.push(phoneMatch);
    }
    return {
      isDuplicate: matches.length > 0,
      existingCandidate: matches.length > 0 ? matches[0] : null
    };
  }
};
