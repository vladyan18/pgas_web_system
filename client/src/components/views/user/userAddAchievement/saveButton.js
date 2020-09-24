import React, {useEffect, useState} from 'react';
import {css, jsx} from '@emotion/core';

import { useToasts } from 'react-toast-notifications'
/** @jsx jsx */

function SaveButton({sendKrit, chars, charsInvalid, descrInvalid, isDateValid, crits, type}) {
    const { addToast } = useToasts();
    const handleClick = (e) => {
        sendKrit(e).then((ok) => {
            if (ok) {
                addToast(type === 'save' ? 'Достижение сохранено' : 'Достижение добавлено', {
                    appearance: 'success',
                    autoDismiss: true,
                });
            } else {
                addToast(type === 'save' ? 'Не удалось сохранить достижение' : 'Не удалось добавить достижение', {
                    appearance: 'error',
                    autoDismiss: true,
                });
            }
        });
    };

    return <div style={{width: '100%'}}>
        <button type="button" id="SubmitButton"
                className={"btn btn-" + (type === 'save' ? 'success' : "primary") + " btn-md button_send" }
                data-target="#exampleModal" value="отправить" onClick={handleClick}
                disabled={
                    !chars ||
                    (charsInvalid !== false || descrInvalid !== false || !isDateValid) && chars[0] !== crits[0]
                }>
            {type === 'save' ? 'Сохранить' : 'Добавить достижение'}
        </button>
    </div>
}

export default SaveButton;


