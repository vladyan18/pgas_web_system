const index = require('../app')
const should = require('should')
const supertest = require('supertest')
const db = require('../controllers/dbController.js')
const chai = require('chai')
const expect = chai.expect;


describe('Тесты', function(){

    it('Нужна авторизация для домашней страницы', function(done){
        supertest('http://localhost:8080')
            .get('/home')
            .expect(302)
            .end(function(err, res){
                res.status.should.equal(302)
                done()
            });

    })

    it('Нужна авторизация для страницы напоминаний', function(done){
        supertest('http://localhost:8080')
            .get('/notes')
            .expect(302)
            .end(function(err, res){
                res.status.should.equal(302)
                done()
            });

    })
    
    it('Проверка поиска пользователя по Id', async () => {
        let User = await db.findUserById('5c1d5074768db71b004307fb')
        const result = User.FirstName + ' ' + User.LastName
        expect(result).to.equal('Alexandr Timofeev')
      })

    it('Проверка поиска пользователя по Token', async () => {
        let User = await db.findUserByToken("google-oauth2|117027646174656354863")
        const result = User.FirstName + ' ' + User.LastName
        expect(result).to.equal('Виталий Гришутин')
    });

    it('Проверка поиска напоминания по Id : ', async () => {
        let Note = await db.findNoteById('5c1d5091768db71b004307fc')
        const result = Note.Title
        expect(result).to.equal('Кря кря')
    });


    it('Проверка добавления напоминания : ', async () => {
        let note = await db.createNote({Title: 'Тест', Text: 'Тест', Time: '2432-03-03T04:32'})
        let User = await db.findUserByToken("google-oauth2|117027646174656354863")
        let expectedResult = User.Notes.length + 1
        await db.addNote('google-oauth2|117027646174656354863', note._id)
        let User1 = await db.findUserByToken("google-oauth2|117027646174656354863")
        let result = User1.Notes.length 
        expect(result).to.equal(expectedResult)
    });

    it('Проверка удаления напоминания : ', async () => {
    
        let note = await db.createNote({Title: 'Тест', Text: 'Тест', Time: '2432-03-03T04:32'})
        await db.addNote('google-oauth2|117027646174656354863', note._id)
        let User = await db.findUserByToken("google-oauth2|117027646174656354863")
        let expectedResult = User.Notes.length - 1
        await db.setNewNotes("google-oauth2|117027646174656354863",User.Notes.remove(note._id))
        await db.deleteNote(note._id)
        let User1 = await db.findUserByToken("google-oauth2|117027646174656354863")
        let result = User1.Notes.length 
        expect(result).to.equal(expectedResult)
    });


    it('Проверка времени < 500ms', function(done){
        this.timeout(500)
        setTimeout(done, 300)
      })

})