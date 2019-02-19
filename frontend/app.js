var express = require('express')
var bodyParser = require('body-parser')
var app = express()
app.use(bodyParser.json())
app.use(express.static(__dirname + '/build/public'))

let port = 88
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/build/login.html')
})
app.get('/crit', (req, res) => {
    res.sendFile(__dirname + '/build/criterion.html')
})
app.get('/add', (req, res) => {
    res.sendFile(__dirname + '/build/add.html')
})
app.get('/404', (req, res) => {
    res.sendFile(__dirname + '/build/404.html')
})
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/build/login.html')
})
app.get('/home', (req, res) => {
    res.sendFile(__dirname + '/build/user_main.html')
})
app.get('/rating', (req, res) => {
    res.sendFile(__dirname + '/build/rating.html')
})
