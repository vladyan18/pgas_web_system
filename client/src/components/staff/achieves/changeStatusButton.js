import {useToasts} from 'react-toast-notifications';
import React from 'react';

function ChangeStatusButton({cb, id, iconClass, ...props}) {
    const {addToast} = useToasts();

    async function onclick(e) {
        const res = await cb(e, id);
        if (!res) {
            addToast('Не удалось изменить статус достижения', {
                appearance: 'error',
                autoDismiss: true,
            });
        }
    }

    return <button type="button" className="custom_button centered_hor"
                   onClick={onclick}>
        <i className={iconClass}/>
    </button>;
}

export default ChangeStatusButton;
