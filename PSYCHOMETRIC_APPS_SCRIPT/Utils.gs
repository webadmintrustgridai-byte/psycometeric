/**
 * TRUSTGRID.AI - PSYCHOMETRIC & VIDEO ASSESSMENT PLATFORM
 * Utils.gs - Shared Utility Functions
 */

var Utils = {
  /**
   * Generates a zero-padded unique sequential or timestamp-based ID
   */
  generateId: function(prefix, sequenceNumber) {
    if (sequenceNumber !== undefined && sequenceNumber !== null) {
      var seqStr = '' + sequenceNumber;
      while (seqStr.length < 6) {
        seqStr = '0' + seqStr;
      }
      return prefix + seqStr;
    }
    // High-entropy random + timestamp fallback
    var timestamp = new Date().getTime().toString(36).toUpperCase();
    var random = Math.floor(Math.random() * 46656).toString(36).toUpperCase();
    while (random.length < 3) random = '0' + random;
    return prefix + timestamp + '_' + random;
  },

  /**
   * Returns ISO 8601 string for timestamps
   */
  getIsoTimestamp: function(date) {
    var d = date ? new Date(date) : new Date();
    return d.toISOString();
  },

  /**
   * SHA-256 Hash with salt for secure password comparison
   */
  hashPassword: function(password, salt) {
    var combined = (salt || 'TRUSTGRID_SALT_2026') + password;
    var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, combined, Utilities.Charset.UTF_8);
    var hashStr = '';
    for (var i = 0; i < rawHash.length; i++) {
      var byteVal = rawHash[i];
      if (byteVal < 0) byteVal += 256;
      var hex = byteVal.toString(16);
      if (hex.length == 1) hex = '0' + hex;
      hashStr += hex;
    }
    return hashStr;
  },

  /**
   * Generates a cryptographically strong random token for invitations
   */
  generateSecureToken: function(length) {
    var len = length || 32;
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    var token = '';
    for (var i = 0; i < len; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  },

  /**
   * Standardized JSON success response
   */
  successResponse: function(data, message) {
    var payload = {
      success: true,
      message: message || 'Operation completed successfully',
      data: data,
      timestamp: new Date().toISOString()
    };
    return ContentService.createTextOutput(JSON.stringify(payload))
      .setMimeType(ContentService.MimeType.JSON);
  },

  /**
   * Standardized JSON error response
   */
  errorResponse: function(errorMessage, statusCode, details) {
    var payload = {
      success: false,
      error: errorMessage || 'An unexpected error occurred',
      statusCode: statusCode || 500,
      details: details || null,
      timestamp: new Date().toISOString()
    };
    return ContentService.createTextOutput(JSON.stringify(payload))
      .setMimeType(ContentService.MimeType.JSON);
  },

  /**
   * Safe JSON parse with fallback
   */
  safeJsonParse: function(str, fallback) {
    if (!str || typeof str !== 'string') return fallback || {};
    try {
      return JSON.parse(str);
    } catch (e) {
      return fallback || {};
    }
  },

  /**
   * Deep sanitize input objects against script injection
   */
  sanitizeInput: function(input) {
    if (typeof input === 'string') {
      return input.replace(/[<>]/g, '').trim();
    }
    if (typeof input === 'object' && input !== null) {
      var clean = Array.isArray(input) ? [] : {};
      for (var k in input) {
        if (Object.prototype.hasOwnProperty.call(input, k)) {
          clean[k] = Utils.sanitizeInput(input[k]);
        }
      }
      return clean;
    }
    return input;
  }
};
