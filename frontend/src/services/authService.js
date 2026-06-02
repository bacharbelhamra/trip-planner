import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import apiClient from './apiClient';

export async function handleFirebaseLogin(firebaseUser) {
  const firebaseToken = await firebaseUser.getIdToken();
  const response = await apiClient.post('/auth/firebase-login', { firebase_token: firebaseToken });
  const { user, token, is_new } = response.data;
  localStorage.setItem('auth_token', token);
  localStorage.setItem('user', JSON.stringify(user));
  return { user, token, is_new };
}

export async function handleLogout() {
  try {
    await apiClient.post('/auth/logout');
  } catch (_) {}
  await signOut(auth);
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
}

export function getStoredUser() {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
}

export function isAuthenticated() {
  return !!localStorage.getItem('auth_token');
}
