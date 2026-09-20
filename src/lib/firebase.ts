'use client';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type Auth,
  type ConfirmationResult,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const TEST_PHONE = '+96200000000';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let recaptchaVerifier: RecaptchaVerifier | null = null;

export function getFirebaseAuth() {
  if (typeof window === 'undefined') return null;
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
    return null;
  }
  if (!app) {
    app = getApps()[0] || initializeApp(firebaseConfig);
    auth = getAuth(app);
  }
  return auth;
}

export function normalizeJordanPhone(raw: string) {
  const trimmed = raw.trim().replace(/\s+/g, '');
  const digits = trimmed.replace(/[^\d+]/g, '');
  if (!digits) return '';
  if (digits === '+96200000000' || digits === '96200000000') return TEST_PHONE;
  if (digits.startsWith('+962')) return digits;
  if (digits.startsWith('962')) return `+${digits}`;
  if (digits.startsWith('00')) return `+${digits.slice(2)}`;
  if (digits.startsWith('0')) return `+962${digits.slice(1)}`;
  if (digits.startsWith('+')) return digits;
  return `+962${digits}`;
}

export function isValidJordanPhone(phone: string) {
  return /^\+9627\d{8}$/.test(phone) || phone === TEST_PHONE;
}

function firebaseErrorMessage(error: unknown) {
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code?: string }).code)
      : '';
  const message =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message?: string }).message)
      : String(error || '');

  if (
    code === 'auth/configuration-not-found' ||
    message.includes('CONFIGURATION_NOT_FOUND')
  ) {
    return 'Firebase Phone Auth is not enabled. Enable Phone in Firebase Console → Authentication → Sign-in method, add localhost to Authorized domains.';
  }

  if (
    message.includes('App attestation failed') ||
    message.includes('PERMISSION_DENIED') ||
    code.includes('app-check')
  ) {
    return 'Firebase App Check blocked this request. In Firebase Console → App Check, turn enforcement Off for Authentication (or register a debug token for localhost), then retry.';
  }

  return message || 'SMS failed';
}

export async function sendPhoneOtp(
  phoneInput: string,
  recaptchaContainerId = 'phone-recaptcha',
): Promise<ConfirmationResult> {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    throw new Error(
      'Firebase is not configured. Check NEXT_PUBLIC_FIREBASE_* env vars and restart the app.',
    );
  }

  const phone = normalizeJordanPhone(phoneInput);
  if (!isValidJordanPhone(phone)) {
    throw new Error('Enter a valid Jordan mobile (+9627XXXXXXXX) or test +96200000000');
  }

  const container = document.getElementById(recaptchaContainerId);
  if (!container) {
    throw new Error('reCAPTCHA container missing');
  }
  container.innerHTML = '';

  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch {
      // ignore
    }
    recaptchaVerifier = null;
  }

  // Visible reCAPTCHA is more reliable than invisible for local/dev.
  recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, recaptchaContainerId, {
    size: 'normal',
  });

  await recaptchaVerifier.render();

  try {
    return await signInWithPhoneNumber(firebaseAuth, phone, recaptchaVerifier);
  } catch (error) {
    try {
      recaptchaVerifier.clear();
    } catch {
      // ignore
    }
    recaptchaVerifier = null;
    throw new Error(firebaseErrorMessage(error));
  }
}
