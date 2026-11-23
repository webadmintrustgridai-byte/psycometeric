/**
 * TRUSTGRID.AI - PSYCHOMETRIC & VIDEO ASSESSMENT PLATFORM
 * DatabaseService.gs - High Performance Google Sheets Database Abstraction Layer
 */

var DatabaseService = {
  _sheetCache: {},

  /**
   * Get sheet instance by name with caching
   */
  getSheet: function(sheetName) {
    if (this._sheetCache[sheetName]) {
      return this._sheetCache[sheetName];
    }
    var ss = getMasterSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      throw new Error('Database table not found: ' + sheetName + '. Run setupMasterDatabase() first.');
    }
    this._sheetCache[sheetName] = sheet;
    return sheet;
  },

  /**
   * Reads all headers from row 1 of a sheet
   */
  getHeaders: function(sheetName) {
    var sheet = this.getSheet(sheetName);
    var lastCol = sheet.getLastColumn();
    if (lastCol === 0) return [];
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    return headers.map(function(h) { return (h || '').toString().trim(); });
  },

  /**
   * Reads all rows from a sheet and returns an array of plain JavaScript objects
   */
  findAll: function(sheetName, filterFn) {
    var sheet = this.getSheet(sheetName);
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    if (lastRow <= 1 || lastCol === 0) return [];

    var headers = this.getHeaders(sheetName);
    var data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    var results = [];

    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var item = { _rowIndex: i + 2 };
      for (var j = 0; j < headers.length; j++) {
        var h = headers[j];
        if (h) {
          item[h] = row[j];
        }
      }
      if (!filterFn || filterFn(item)) {
        results.push(item);
      }
    }
    return results;
  },

  /**
   * Find a single record by column name and value
   */
  findOne: function(sheetName, columnName, value) {
    var results = this.findAll(sheetName, function(item) {
      return item[columnName] == value;
    });
    return results.length > 0 ? results[0] : null;
  },

  /**
   * Find all records by column name and value
   */
  findBy: function(sheetName, columnName, value) {
    return this.findAll(sheetName, function(item) {
      return item[columnName] == value;
    });
  },

  /**
   * Insert a new record into a sheet with LockService protection
   */
  insert: function(sheetName, recordData) {
    var lock = LockService.getScriptLock();
    try {
      lock.waitLock(15000); // Wait up to 15 seconds for lock
      var sheet = this.getSheet(sheetName);
      var headers = this.getHeaders(sheetName);
      var lastRow = sheet.getLastRow();

      // Ensure timestamps and status
      if (!recordData.Created_At) recordData.Created_At = Utils.getIsoTimestamp();
      if (!recordData.Updated_At) recordData.Updated_At = Utils.getIsoTimestamp();
      if (!recordData.Record_Status) recordData.Record_Status = 'ACTIVE';

      var rowValues = [];
      for (var i = 0; i < headers.length; i++) {
        var header = headers[i];
        var val = recordData[header];
        if (val === undefined || val === null) {
          val = '';
        } else if (typeof val === 'object') {
          val = JSON.stringify(val);
        }
        rowValues.push(val);
      }

      sheet.appendRow(rowValues);
      return recordData;
    } catch (e) {
      Logger.log('Error inserting into ' + sheetName + ': ' + e.message);
      throw e;
    } finally {
      lock.releaseLock();
    }
  },

  /**
   * Batch insert records for maximum performance
   */
  batchInsert: function(sheetName, records) {
    if (!records || records.length === 0) return;
    var lock = LockService.getScriptLock();
    try {
      lock.waitLock(20000);
      var sheet = this.getSheet(sheetName);
      var headers = this.getHeaders(sheetName);
      var rows = [];

      for (var r = 0; r < records.length; r++) {
        var rec = records[r];
        if (!rec.Created_At) rec.Created_At = Utils.getIsoTimestamp();
        if (!rec.Updated_At) rec.Updated_At = Utils.getIsoTimestamp();
        if (!rec.Record_Status) rec.Record_Status = 'ACTIVE';

        var rowValues = [];
        for (var i = 0; i < headers.length; i++) {
          var header = headers[i];
          var val = rec[header];
          if (val === undefined || val === null) val = '';
          else if (typeof val === 'object') val = JSON.stringify(val);
          rowValues.push(val);
        }
        rows.push(rowValues);
      }

      var startRow = sheet.getLastRow() + 1;
      sheet.getRange(startRow, 1, rows.length, headers.length).setValues(rows);
    } finally {
      lock.releaseLock();
    }
  },

  /**
   * Update an existing record matching primary key column and value
   */
  update: function(sheetName, idColumnName, idValue, updateData) {
    var lock = LockService.getScriptLock();
    try {
      lock.waitLock(15000);
      var sheet = this.getSheet(sheetName);
      var headers = this.getHeaders(sheetName);
      var all = this.findAll(sheetName);

      var targetRow = null;
      for (var i = 0; i < all.length; i++) {
        if (all[i][idColumnName] == idValue) {
          targetRow = all[i];
          break;
        }
      }

      if (!targetRow) {
        throw new Error('Record not found in ' + sheetName + ' with ' + idColumnName + ' = ' + idValue);
      }

      updateData.Updated_At = Utils.getIsoTimestamp();

      var rowIndex = targetRow._rowIndex;
      var newRowValues = [];

      for (var j = 0; j < headers.length; j++) {
        var h = headers[j];
        var val = (updateData[h] !== undefined) ? updateData[h] : targetRow[h];
        if (val === undefined || val === null) val = '';
        else if (typeof val === 'object') val = JSON.stringify(val);
        newRowValues.push(val);
      }

      sheet.getRange(rowIndex, 1, 1, headers.length).setValues([newRowValues]);
      return Object.assign({}, targetRow, updateData);
    } finally {
      lock.releaseLock();
    }
  },

  /**
   * Soft-delete a record by marking Record_Status = 'DELETED'
   */
  softDelete: function(sheetName, idColumnName, idValue) {
    return this.update(sheetName, idColumnName, idValue, {
      Record_Status: 'DELETED',
      Updated_At: Utils.getIsoTimestamp()
    });
  }
};
