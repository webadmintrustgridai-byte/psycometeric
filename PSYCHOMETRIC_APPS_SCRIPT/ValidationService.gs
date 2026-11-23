/**
 * TRUSTGRID.AI - PSYCHOMETRIC & VIDEO ASSESSMENT PLATFORM
 * ValidationService.gs - Robust Input Validation and Security Guardrails
 */

var ValidationService = {
  /**
   * Validate Email format
   */
  isValidEmail: function(email) {
    if (!email || typeof email !== 'string') return false;
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  },

  /**
   * Validate Phone number
   */
  isValidPhone: function(phone) {
    if (!phone) return true; // Optional
    var clean = ('' + phone).replace(/[\s\-\+\(\)]/g, '');
    return clean.length >= 7 && clean.length <= 15 && /^\d+$/.test(clean);
  },

  /**
   * Validate Candidate Registration Payload
   */
  validateCandidate: function(data) {
    var errors = [];
    if (!data.Full_Name || data.Full_Name.trim().length < 2) {
      errors.push('Full_Name is required and must be at least 2 characters.');
    }
    if (!this.isValidEmail(data.Email)) {
      errors.push('A valid Email address is required.');
    }
    if (!data.Organization_ID) {
      errors.push('Organization_ID is required.');
    }
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },

  /**
   * Validate External Video URL against provider allowlist
   */
  validateVideoUrl: function(url) {
    if (!url || typeof url !== 'string') {
      return { isValid: false, provider: null, error: 'URL cannot be empty' };
    }
    var cleanUrl = url.trim();

    // YouTube check
    var ytMatch = cleanUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      return {
        isValid: true,
        provider: 'YOUTUBE',
        videoId: ytMatch[1],
        embedUrl: 'https://www.youtube-nocookie.com/embed/' + ytMatch[1],
        thumbnailUrl: 'https://img.youtube.com/vi/' + ytMatch[1] + '/hqdefault.jpg'
      };
    }

    // Vimeo check
    var vimeoMatch = cleanUrl.match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+))/i);
    if (vimeoMatch && vimeoMatch[3]) {
      return {
        isValid: true,
        provider: 'VIMEO',
        videoId: vimeoMatch[3],
        embedUrl: 'https://player.vimeo.com/video/' + vimeoMatch[3],
        thumbnailUrl: 'https://vumbnail.com/' + vimeoMatch[3] + '.jpg'
      };
    }

    // Direct MP4 / WebM / Google Drive allowlist
    if (/^https?:\/\/.*(\.mp4|\.webm)(\?.*)?$/i.test(cleanUrl)) {
      return {
        isValid: true,
        provider: 'DIRECT_MEDIA',
        videoId: null,
        embedUrl: cleanUrl,
        thumbnailUrl: ''
      };
    }

    if (/drive\.google\.com/i.test(cleanUrl)) {
      return {
        isValid: true,
        provider: 'GOOGLE_DRIVE',
        videoId: null,
        embedUrl: cleanUrl,
        thumbnailUrl: ''
      };
    }

    return {
      isValid: false,
      provider: 'UNSUPPORTED',
      error: 'URL must be a valid YouTube, Vimeo, or approved direct media link.'
    };
  }
};
