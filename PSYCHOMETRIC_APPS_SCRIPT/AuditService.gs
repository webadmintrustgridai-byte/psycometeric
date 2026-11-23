/**
 * TRUSTGRID.AI - PSYCHOMETRIC & VIDEO ASSESSMENT PLATFORM
 * AuditService.gs - Regulatory & Compliance Audit Trails
 */

var AuditService = {
  /**
   * Log an audit event into DB_20_Audit_Logs
   */
  logEvent: function(orgId, userId, action, entityType, entityId, details, ipAddress) {
    try {
      var logRecord = {
        Log_ID: Utils.generateId(CONFIG.PREFIXES.AUDIT),
        Organization_ID: orgId || '',
        User_ID: userId || '',
        Action: action,
        Entity_Type: entityType || '',
        Entity_ID: entityId || '',
        Details_JSON: typeof details === 'object' ? JSON.stringify(details) : (details || ''),
        IP_Address: ipAddress || '0.0.0.0',
        Created_At: Utils.getIsoTimestamp()
      };
      DatabaseService.insert(CONFIG.SHEETS.AUDIT_LOGS, logRecord);
    } catch (e) {
      Logger.log('Audit logging failed: ' + e.message);
    }
  },

  /**
   * Log Video Access for Privacy / Compliance into DB_24_Video_Access_Logs
   */
  logVideoAccess: function(videoProfileId, videoResponseId, accessedByUserId, candidateId, accessType, ip) {
    try {
      var record = {
        Access_Log_ID: Utils.generateId(CONFIG.PREFIXES.ACCESS_LOG),
        Video_Profile_ID: videoProfileId || '',
        Video_Response_ID: videoResponseId || '',
        Accessed_By_User_ID: accessedByUserId || 'ANONYMOUS',
        Candidate_ID: candidateId || '',
        Access_Type: accessType || 'VIEW',
        Access_Timestamp: Utils.getIsoTimestamp(),
        IP_Address: ip || '0.0.0.0'
      };
      DatabaseService.insert(CONFIG.SHEETS.VIDEO_ACCESS_LOGS, record);
    } catch (e) {
      Logger.log('Video access logging failed: ' + e.message);
    }
  },

  /**
   * Log API Call telemetry into DB_22_API_Logs
   */
  logApiCall: function(endpoint, method, statusCode, executionTimeMs, requestSnippet, responseSnippet) {
    try {
      var log = {
        API_Log_ID: Utils.generateId('API_'),
        Endpoint: endpoint,
        Method: method,
        Status_Code: statusCode,
        Execution_Time_Ms: executionTimeMs,
        Request_Snippet: (requestSnippet || '').substring(0, 500),
        Response_Snippet: (responseSnippet || '').substring(0, 500),
        Created_At: Utils.getIsoTimestamp()
      };
      DatabaseService.insert(CONFIG.SHEETS.API_LOGS, log);
    } catch (e) {
      // Avoid failing main thread on telemetry error
    }
  }
};
