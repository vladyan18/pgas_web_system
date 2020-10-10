import React, {useEffect, useState} from 'react';
import {css, jsx} from '@emotion/core';

import { useToasts } from 'react-toast-notifications'
/** @jsx jsx */

function DeleteButton({disabled, onClick}) {
    const { addToast } = useToasts();
    const handleClick = (e) => {
        onClick(e).then((ok) => {
            if (ok) {
                addToast('Достижение удалено', {
                    appearance: 'success',
                    autoDismiss: true,
                });
            } else {
                addToast('Не удалось удалить достижение', {
                    appearance: 'error',
                    autoDismiss: true,
                });
            }
        })
    };

    return <button id="DeleteButton" className="btn btn-danger"
                   value="Удалить" onClick={handleClick} disabled={disabled}>Удалить
    </button>
}

export default DeleteButton;


