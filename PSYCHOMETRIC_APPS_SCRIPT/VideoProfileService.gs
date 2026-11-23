/**
 * TRUSTGRID.AI - PSYCHOMETRIC & VIDEO ASSESSMENT PLATFORM
 * VideoProfileService.gs - Candidate Video Identity, Portfolios & CV Management
 */

var VideoProfileService = {
  /**
   * Create a Video Profile entry (Upload, URL, or WebCam Record)
   */
  createVideoProfile: function(data, candidateId, orgId) {
    if (!data.Video_Title || !data.Category) {
      throw new Error('Video Title and Category are required.');
    }

    var all = DatabaseService.findAll(CONFIG.SHEETS.CANDIDATE_VIDEO_PROFILES);
    var profileId = Utils.generateId(CONFIG.PREFIXES.VID_PROFILE, all.length + 1);

    var videoUrl = data.Video_URL || '';
    var thumbnailUrl = data.Thumbnail_URL || '';
    var source = data.Source_Type || 'UPLOAD';

    // If external URL, validate and extract embed
    if (source === 'URL') {
      var parsed = ValidationService.validateVideoUrl(videoUrl);
      if (!parsed.isValid) {
        throw new Error(parsed.error);
      }
      videoUrl = parsed.embedUrl;
      thumbnailUrl = parsed.thumbnailUrl || thumbnailUrl;
    }

    var record = {
      Video_Profile_ID: profileId,
      Candidate_ID: candidateId,
      Organization_ID: orgId,
      Video_Title: data.Video_Title.trim(),
      Category: data.Category, // PROFESSIONAL_INTRO, VIDEO_CV, SKILLS_DEMO, PORTFOLIO, PROJECT_DEMO
      Source_Type: source, // UPLOAD, URL, RECORD
      Video_URL: videoUrl,
      Thumbnail_URL: thumbnailUrl,
      Duration_Seconds: data.Duration_Seconds || 0,
      Visibility: data.Visibility || 'ASSIGNED_RECRUITERS', // PRIVATE, ASSIGNED_RECRUITERS, ORG_USERS
      Processing_Status: 'READY',
      Consent_Granted: data.Consent_Granted !== false ? 'TRUE' : 'FALSE',
      Created_At: Utils.getIsoTimestamp()
    };

    DatabaseService.insert(CONFIG.SHEETS.CANDIDATE_VIDEO_PROFILES, record);

    AuditService.logEvent(orgId, candidateId, 'VIDEO_PROFILE_CREATED', 'VIDEO_PROFILE', profileId, {
      title: data.Video_Title,
      category: data.Category,
      source: source
    });

    return record;
  },

  /**
   * Get all video profiles for a candidate
   */
  getCandidateVideos: function(candidateId, viewerUserId) {
    var videos = DatabaseService.findBy(CONFIG.SHEETS.CANDIDATE_VIDEO_PROFILES, 'Candidate_ID', candidateId);
    return videos.filter(function(v) { return v.Record_Status !== 'DELETED'; });
  },

  /**
   * Update video visibility / privacy
   */
  updateVisibility: function(profileId, newVisibility, userId) {
    var updated = DatabaseService.update(CONFIG.SHEETS.CANDIDATE_VIDEO_PROFILES, 'Video_Profile_ID', profileId, {
      Visibility: newVisibility
    });
    AuditService.logEvent(updated.Organization_ID, userId, 'VIDEO_VISIBILITY_UPDATED', 'VIDEO_PROFILE', profileId, { visibility: newVisibility });
    return updated;
  },

  /**
   * Delete video profile
   */
  deleteVideo: function(profileId, userId) {
    var video = DatabaseService.findOne(CONFIG.SHEETS.CANDIDATE_VIDEO_PROFILES, 'Video_Profile_ID', profileId);
    if (!video) throw new Error('Video profile not found.');

    var updated = DatabaseService.softDelete(CONFIG.SHEETS.CANDIDATE_VIDEO_PROFILES, 'Video_Profile_ID', profileId);
    AuditService.logEvent(video.Organization_ID, userId, 'VIDEO_PROFILE_DELETED', 'VIDEO_PROFILE', profileId, {});
    return updated;
  }
};
