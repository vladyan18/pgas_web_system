import userPersonalStore from '../../../stores/userPersonalStore';

function HideIfForMyself({userId, children}) {
    if (userPersonalStore.personal.id === userId) return null;

    else return children;
}

export default HideIfForMyself;
