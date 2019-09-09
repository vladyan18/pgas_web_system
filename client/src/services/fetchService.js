import React from 'react';

async function sendObject(url, obj) {
    let response = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(obj),
    });
    if (!response.ok) return 'error';
    return response.json()
}

async function sendWithoutRes(url, obj) {
    let response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(obj),
    });
    return response.ok
}

async function get(url, obj) {
    let query = Object.keys(obj)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]))
        .join('&');
    url = url + '?' + query;
    let response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        }
    });
    if (response.ok)
        return response.json();
    else return undefined
}


export {sendObject as fetchSendObj, get as fetchGet, sendWithoutRes as fetchSendWithoutRes}