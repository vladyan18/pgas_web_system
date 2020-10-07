const models = {
    UserModel: require('./user.js'),
    AchieveModel: require('./achieve'),
    FacultyModel: require('./faculty'),
    CriteriasModel: require('./criterias'),
    ConfirmationModel: require('./confirmation'),
    HistoryNoteModel: require('./historyNote'),
    AnnotationsModel: require('./annotation'),
    NotificationsSettingsModel: require('./notificationsSettings'),
    SessionsModel: require('./sessions'),
};

module.exports = models;
