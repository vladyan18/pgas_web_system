import React from 'react';
import UserAchievesContainer from './achieves/userAchievesContainer';
import UserCommonInfoContainer from './commonInfo/UserCommonInfoContainer';
import UserProfileContainer from './profile/userProfileContainer';
const UserAddAchievementContainer = React.lazy(() => import('./addAchievement/userAddAchievementContainer'));
const UserStudentsContainer  = React.lazy(() => import('./userStudentsRatingContainer'));
const UserDocumentsContainer = React.lazy(() => import('./documents/UserDocumentsContainer'));
const EditAchievementContainer = React.lazy(() => import('./editAchievement/editAchievementContainer'));

function addRoute(path, component, title) {
    return {path, component, title};
}

const routes = [
    ['/home', UserAchievesContainer, 'Мои достижения'],
    ['/achievement/:id', EditAchievementContainer, 'Достижение'],
    ["/rating", UserStudentsContainer, 'Рейтинг на ПГАС'],
    ["/upload", UserAddAchievementContainer, 'Добавление достижения'],
    ["/documents", UserCommonInfoContainer, 'Информация'],
    ["/profile", UserProfileContainer, 'Мой профиль'],
    ["/confirmations", UserDocumentsContainer, 'Мои документы'],
    ["/", UserAchievesContainer, 'Мои достижения']
    
].map((args) => addRoute(...args));

export default routes;
