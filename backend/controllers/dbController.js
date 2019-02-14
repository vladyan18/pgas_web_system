const UserModel = require('../models/user.js')
const NoteModel = require('../models/note.js')


exports.findUserById = function (id) {
    return UserModel.findById(id)
}

exports.findNoteById = function(id){
    return NoteModel.findById(id)
}

exports.isUser = function(token){
    return UserModel.findOne({Token: token},function(err, user){
        if(!user){
            return false
        }
        return true
    })
}

exports.createUser = function(User){
    return UserModel.create(User)
}

exports.createNote = function(Note){
    return NoteModel.create(Note)
}

exports.addNote = function(userToken, noteId){
    return UserModel.findOneAndUpdate({ Token: userToken }, { $push: { Notes : noteId } })
}

exports.findNotes = function(header,importante,kind){
    if(header != ''){
        if(kind){
            if(importante){
                return NoteModel.find({Title: header,Important: importante, Kind: kind})
            }
            return NoteModel.find({Title: header, Kind: kind})
        }
        if(importante){
            return NoteModel.find({Title: header, Important: importante})
        }
        return NoteModel.find({Title: header})
    }else{
        if(kind){
            if(importante){
                return NoteModel.find({Important: importante,Kind: kind})
            }
            return NoteModel.find({ Kind: kind})
        }
        if(importante){
            return NoteModel.find({Important: importante})
        }
        return NoteModel.find({})
    }
}

exports.findUserByToken = function(token){
    return UserModel.findOne({Token:token})
}

exports.deleteNote = function(id){
    return NoteModel.findOneAndDelete({_id: id})
}

exports.setNewNotes= function(userToken,notes){
    return UserModel.findOneAndUpdate({ Token: userToken }, { $set: { Notes : notes }})
}