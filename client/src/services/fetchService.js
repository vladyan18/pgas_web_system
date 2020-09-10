import React from 'react';
import {BASE_API_URL} from '../common/constants';

function FetchError(message, body) {
  this.body = body;
  this.message = message || 'Error while fetching';
  this.stack = (new Error()).stack;
}
FetchError.prototype = Object.create(Error.prototype);
FetchError.prototype.constructor = FetchError;

async function sendObject(url, obj) {
  if (url.startsWith('/api/')) {
    url = url.replace('/api/', '/');
  }
  const response = await fetch(BASE_API_URL + url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(obj),
  });
  if (response.ok) {
    return response.json();
  } else if (response.status === 401) {
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/login';
  }
}

async function sendWithoutRes(url, obj) {
  if (url.startsWith('/api/')) {
    url = url.replace('/api/', '/');
  }
  const response = await fetch(BASE_API_URL + url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(obj),
  });
  if (response.ok) {
    return response.ok;
  } else if (response.status === 401) {
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/login';
    return response.ok;
  }
}

async function get(url, obj) {
  if (url.startsWith('/api/')) {
    url = url.replace('/api/', '/');
  }
  const query = Object.keys(obj)
      .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]))
      .join('&');
  url = url + '?' + query;
  const response = await fetch(BASE_API_URL + url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });
  if (response.ok) {
    return response.json();
  } else if (response.status === 401) {
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/login';
  }
  // else throw new FetchError('Error while fetching', await response.json())
}


export {sendObject as fetchSendObj, get as fetchGet, sendWithoutRes as fetchSendWithoutRes};
