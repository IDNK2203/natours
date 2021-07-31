/* eslint-disable */
import { showAlert } from './alerts';

export const updateUserData = async (name, email) => {
  try {
    const res = await fetch('http://localhost:3000/api/v1/users/updateme', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email })
    });

    const data = await res.json();
    if (data.status !== 'success') {
      throw new Error(data.message);
    }
    showAlert('success', 'Your settings have been updated!');
    window.setTimeout(() => {
      location.assign('/me');
    }, 1500);
  } catch (error) {
    console.log(error);
    showAlert('error', error);
  }
};

export const updatePassword = async (
  password,
  newPasswordConfirm,
  newPassword
) => {
  try {
    const res = await fetch(
      'http://localhost:3000/api/v1/users/updatepassword',
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password, newPasswordConfirm, newPassword })
      }
    );

    const data = await res.json();
    if (data.status !== 'success') {
      throw new Error(data.message);
    }
    showAlert('success', 'Your password has been updated');
    window.setTimeout(() => {
      location.assign('/me');
    }, 1500);
  } catch (error) {
    console.log(error);
    showAlert('error', error);
  }
};
