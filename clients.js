const args = process.argv.splice(2);
const host = args[0] ? args[0] : 'localhost';
const port = args[1] ? args[1] : 5000;
const socket = require('socket.io-client')('http://'+host+':'+port);
const readline = require('readline');
const chalk = require('chalk');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
});

let name, peer, newRl;

rl.question("Enter a username : ", username => {
    name = username;
    socket.emit('login', username);
    socket.on('login', reply => {
        console.log(reply)
        userSelector();
    })
});

const userSelector = () => {
    rl.question("Enter the username to chat with :", peer => {
        socket.emit('find', {peer : peer.trim(), name});
    })
}

socket.on('unavailable', response => {
    console.log('User not found...')
    userSelector();
});

socket.on('user-found', response => {
    initChatWindow(response)
});

socket.on('start-chat', response => {
    initChatWindow(response)
});

socket.on('receivedMessage', message => {
    readline.moveCursor(process.stdout, 0, -1);
    console.log('\n'+chalk.cyan(`${peer} : `)+message);
    chat(newRl);
})

const initChatWindow = (response) => {
    peer = response;
    rl.close();
    newRl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true
    });
    startNewChat(newRl)
}

const startNewChat = (interface) => {
    interface.question(`${name} : `, message => {
        socket.emit('message', {
            to: peer,
            message: message
        });
        readline.moveCursor(process.stdout, 0,-1);
        chat();
    })
}

chat = () => {
    newRl.question(`${name} : `, message => {
        socket.emit('message', {
            to: peer,
            message: message
        });
        readline.moveCursor(process.stdout, 0,-1);
        chat();
    })
} 
