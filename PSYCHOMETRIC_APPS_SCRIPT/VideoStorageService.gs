/**
 * TRUSTGRID.AI - PSYCHOMETRIC & VIDEO ASSESSMENT PLATFORM
 * VideoStorageService.gs - Google Drive Multi-Tenant Hierarchy & Secure Object Storage
 */

var VideoStorageService = {
  /**
   * Get or create Root Folder for TRUSTGRID.AI
   */
  getRootFolder: function() {
    var rootId = getConfigValue(CONFIG.PROPERTY_KEYS.ROOT_DRIVE_FOLDER_ID);
    if (rootId) {
      try {
        return DriveApp.getFolderById(rootId);
      } catch (e) {
        Logger.log('Configured Root Folder not accessible: ' + e.message);
      }
    }
    // Search or create
    var folders = DriveApp.getFoldersByName(CONFIG.DEFAULT_DRIVE_FOLDER_NAME);
    if (folders.hasNext()) {
      var f = folders.next();
      setConfigValue(CONFIG.PROPERTY_KEYS.ROOT_DRIVE_FOLDER_ID, f.getId());
      return f;
    }
    var newRoot = DriveApp.createFolder(CONFIG.DEFAULT_DRIVE_FOLDER_NAME);
    setConfigValue(CONFIG.PROPERTY_KEYS.ROOT_DRIVE_FOLDER_ID, newRoot.getId());
    return newRoot;
  },

  /**
   * Get or create candidate specific folder inside organization directory
   * Structure: ROOT / ORGANIZATIONS / {ORG_ID} / CANDIDATES / {CAN_ID} / {SUBFOLDER}
   */
  getCandidateSubfolder: function(orgId, candidateId, subfolderName) {
    var root = this.getRootFolder();

    // 1. Organizations Folder
    var orgsRoot = this._getOrCreateSubfolder(root, 'ORGANIZATIONS');
    // 2. Specific Org Folder
    var targetOrg = this._getOrCreateSubfolder(orgsRoot, orgId || 'ORG_GENERAL');
    // 3. Candidates Folder
    var candidatesRoot = this._getOrCreateSubfolder(targetOrg, 'CANDIDATES');
    // 4. Specific Candidate Folder
    var candidateFolder = this._getOrCreateSubfolder(candidatesRoot, candidateId);
    // 5. Category Subfolder (e.g., RESUME, VIDEO_PROFILE, VIDEO_CV, VIDEO_INTERVIEWS)
    return this._getOrCreateSubfolder(candidateFolder, subfolderName || 'GENERAL');
  },

  _getOrCreateSubfolder: function(parentFolder, name) {
    var iter = parentFolder.getFoldersByName(name);
    if (iter.hasNext()) {
      return iter.next();
    }
    return parentFolder.createFolder(name);
  },

  /**
   * Upload file from base64 string
   */
  saveBase64File: function(orgId, candidateId, categoryFolder, base64Data, filename, mimeType) {
    var targetFolder = this.getCandidateSubfolder(orgId, candidateId, categoryFolder);
    var decoded = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(decoded, mimeType || 'video/webm', filename);
    var file = targetFolder.createFile(blob);

    // Default to Restricted access (not public link)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return {
      fileId: file.getId(),
      filename: file.getName(),
      size: file.getSize(),
      mimeType: file.getMimeType(),
      url: file.getUrl(),
      downloadUrl: file.getDownloadUrl()
    };
  }
};
