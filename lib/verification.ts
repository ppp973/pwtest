'use client';

import { v4 as uuidv4 } from 'uuid';

const VERIFICATION_KEY = 'vip_study_verified_at';
const USER_ID_KEY = 'vip_study_user_id';
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export function getUserId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

export function isVerified(): boolean {
  if (typeof window === 'undefined') return false;
  const verifiedAt = localStorage.getItem(VERIFICATION_KEY);
  if (!verifiedAt) return false;
  
  const timestamp = parseInt(verifiedAt, 10);
  if (isNaN(timestamp)) return false;
  
  const now = Date.now();
  return now - timestamp < EXPIRY_MS;
}

export function setVerified() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VERIFICATION_KEY, Date.now().toString());
}

export function generateToken(userId: string): string {
  // Simple token generation based on userId and current date (24h window)
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const str = `${userId}-${date}-secret-salt`;
  // Using a simple hash-like function for the token
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

export function validateToken(userId: string, token: string): boolean {
  return generateToken(userId) === token;
}
