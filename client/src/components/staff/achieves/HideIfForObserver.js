import userPersonalStore from '../../../stores/userPersonalStore';

function HideForObserver({children}) {
    if (userPersonalStore.Role === 'Observer') return null;

    else return children;
}

export default HideForObserver;
