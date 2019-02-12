const args = process.argv.splice(2);
const _ = require('lodash')
const port = args[0] ? args[0] : 5000

const Server = require('socket.io');
const io = new Server(port);


const readline = require('readline');
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});
let usersList = {};
io.on('connection', (socket)=> {
    socket.on('login', username => {
        usersList[username.trim()] = socket;
        socket.emit('login', `Logged in as ${username}`);
    });
    socket.on('message', data => {
        usersList[data.to.trim()].emit('receivedMessage', data.message);
    });
    socket.on('find', data => {
        usersList[data.peer] == undefined 
        ? socket.emit('unavailable') 
        : (() => {
            usersList[data.peer].emit('start-chat', data.name);
            socket.emit('user-found', data.peer)
        })()
    })
})


console.log('Server Started!')
