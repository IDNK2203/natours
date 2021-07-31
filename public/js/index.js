/* eslint-disable */

import '@babel/polyfill';
import { login, logout } from './login';
import { updateUserData, updatePassword } from './updateSettings';

const loginForm = document.querySelector('.form.form--login');
const UserDataForm = document.querySelector('.form.form-user-data');
const passwordForm = document.querySelector('.form.form-user-settings');
const logoutBtn = document.querySelector('.nav__el.nav__el--logout');

if (loginForm)
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = loginForm.querySelector('#email').value;
    const password = loginForm.querySelector('#password').value;
    login(email, password);
  });

if (UserDataForm)
  UserDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = UserDataForm.querySelector('#name').value;
    const email = UserDataForm.querySelector('#email').value;
    updateUserData(name, email);
  });

console.log(passwordForm);
if (passwordForm)
  passwordForm.addEventListener('submit', async e => {
    e.preventDefault();
    const passwordBtn = (passwordForm.querySelector('.btn').textContent =
      'UPDATING PASSWORD');
    const newPassword = passwordForm.querySelector('#password').value;
    const password = passwordForm.querySelector('#password-current').value;
    const newPasswordConfirm = passwordForm.querySelector('#password-confirm')
      .value;
    console.log(password, newPasswordConfirm, newPassword);
    await updatePassword(password, newPasswordConfirm, newPassword);

    passwordBtn.textContent = 'SAVE PASSWORD';
    newPassword.value = '';
    password.value = '';
    newPasswordConfirm.value = '';
  });

if (logoutBtn)
  logoutBtn.addEventListener('click', e => {
    logout();
  });
