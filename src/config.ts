/**
 * TRUSTGRID.AI - MASTER APPLICATION CONFIGURATION
 * 
 * Google Apps Script Web App URL & Master Spreadsheet ID
 * Reads from Vercel environment variables if set (VITE_GOOGLE_APPS_SCRIPT_URL, VITE_GOOGLE_SPREADSHEET_ID),
 * with reliable hardcoded fallbacks to the active TrustGrid.ai backend.
 */
export const GOOGLE_APPS_SCRIPT_URL: string = 
  (import.meta as any).env?.VITE_GOOGLE_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycby09Y3Ym1I5jwIU3dqQCMwFdijG3QhKfCmQ-De8vvcEDaYqvhRIrhmIDxvejc5Za0Ni/exec';

export const GOOGLE_SPREADSHEET_ID: string = 
  (import.meta as any).env?.VITE_GOOGLE_SPREADSHEET_ID ||
  '16F6thCNBYdceto8Sxvf0t3Ldi9ao4lBokUGoOf8D0sI';
