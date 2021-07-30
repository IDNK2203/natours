/* eslint-disable */
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const res = await fetch('http://localhost:3000/api/v1/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.status !== 'success') {
      console.log(data);
      throw new Error(data.message);
    }
    showAlert('success', 'Logged in successfully!');
    window.setTimeout(() => {
      location.assign('/');
    }, 1500);
  } catch (error) {
    showAlert('error', error);
  }
};

export const logout = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/v1/users/logout', {
      method: 'POST'
    });
    const data = await res.json();
    if (data.status !== 'success') {
      throw new Error(data.message);
    }
    showAlert('success', 'Logged out successfully!');
    window.setTimeout(() => {
      location.reload();
    }, 1500);
  } catch (error) {
    showAlert('error', error);
  }
};
