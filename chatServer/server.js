var app = require('express')();
var server = require('http').Server(app);
var keys = Object.keys || require('object-keys');
var fs = require('fs');
var models = require("./models/models");

var io = require('socket.io')(server, {
    //serveClient: false,
    // below are engine.IO options
    pingInterval: 4000,
    pingTimeout: 2000,
    cookie: true,

});

var io = io.of('/chat');

//Connection
io.on('connection', function(socket) {
    socket.on('newUser', function(userId) {

        socket.userId = userId;

        models.User.findOne({where: {id: userId}})
            .then(user => {
                user.online = true;
                user.save();
            });

        socket.broadcast.emit('newUserOnline', userId);

    });
});

//Disconnection
io.on('connection', function(socket) {
    socket.on('disconnect', function() {

        models.User.findOne({where: {id: socket.userId}})
            .then(user => {
                user.online = false;
                user.save();
            });

        socket.broadcast.emit('newUserOffline', socket.userId);

    });
});

//Selecting new chats
io.on('connection', function(socket) {

    socket.on('room', function(room) {
        socket.join(room);

        console.log("Now in room: " + room);

        let chat = models.selectChatTable(room);

        models.sequelize.sync()
            .then(() => {
                console.log("New table (chat) has been created");
            })
            .catch((err) => {
                console.log("Error while creating table/chat: ", err);
            });

        chat.findAll()
            .then((msgs) => {
                socket.emit('getHistory', msgs);
            });

    });

});

//Sending msgs to receivers
io.on('connection', function(socket) {

    socket.on('message', function(msg) {

        var room = "" + msg.chatId;

        let chat = models.selectChatTable(room);

        let newMsg = chat.build({
            author: msg.author,
            date: msg.date,
            message: msg.message,
            read: false,
            thread: msg.thread,
        });

        newMsg.save();

        let pendingMsgs = null;

        models.UnreadMessages.findOne({
            where: {
                chat: room,
                authorId: {
                    $not: msg.author,
                },
            },
        }).then(row => {
            pendingMsgs = row;
        });

        if (pendingMsgs) {
            pendingMsgs.nMessages++;
        } else {
            pendingMsgs = models.UnreadMessages.build({
                authorId: msg.author,
                chat: room,
                nMessages: 1,
            });
        }
        pendingMsgs.save();



        socket.broadcast.to(room).emit('chat message', msg);

    });
});

//Typing function
io.on('connection', function(socket) {

    socket.on('typing', function(details) {

        var room = "" + details.chat;

        socket.broadcast.to(room).emit('typing', details);

    });
});

//Server listening
server.listen(4000, function() {
    console.log('listening on *:4000');
});
