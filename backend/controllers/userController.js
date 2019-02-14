const db = require('./dbController')



module.exports.getUser = function(req,res){
    let username = req.user.name.givenName + ' ' + req.user.name.familyName
    res.send({Username : username})
}

module.exports.searchNote = async function(req,res){
    var Notes = await db.findNotes(req.body.header, req.body.important, req.body.kind)
    res.render('results',{obj: Notes})
}


module.exports.getSearchNotes = async function(req,res) {
    let user = await db.findUserByToken(req.user.id)
    let notes = []
    for(note of Notes){
        let Note  = await db.findNoteById(note)
        notes.push({Title: Note.Title, Text: Note.Text,Time: Note.Time, Id: Note._id, Kind: Note.Kind, Important: Note.Important})
    }
    res.send({Notes : notes})
}

module.exports.addNote = async function(req,res){
    let Note = await db.createNote({Title: req.body.header, Text: req.body.note, Time: req.body.time,Important : req.body.important,Kind: req.body.kind})
    await db.addNote(req.user.id, Note._id)
    res.redirect('/notes')
}

module.exports.getNotes = async function(req,res) {
    let user = await db.findUserByToken(req.user.id)
    let notes = []
    for(note of user.Notes){
        let Note  = await db.findNoteById(note)
        notes.push({Title: Note.Title, Text: Note.Text,Time: Note.Time, Id: Note._id, Kind: Note.Kind, Important: Note.Important})
    }
    res.send({Notes : notes})
}

module.exports.deleteNote = async function(req,res){
    let id = req.body.note
    let User = await db.findUserByToken(req.user.id)
    await db.setNewNotes(req.user.id,User.Notes.remove(id))
    await db.deleteNote(id)
}