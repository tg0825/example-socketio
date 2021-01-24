const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

server.listen(3000, () => {
    console.log('conneted at 3000');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// namespace1
// 채팅방을 만든다고 생각하면 된다.
const ns1 = io.of('/namespace1');
// 방에 진입시 news라는 이벤트를 발생한다.
// news는 클라이언트에 정의되어 있다.
ns1.on('connection', (socket) => {
    ns1.emit('news', {
        hello: 'someone connected at namespace1'
    })
});

// namespace2
const ns2 = io.of('/namespace2');
ns2.on('connection', (socket) => {
    ns2.emit('news', {
        hello: 'someone connected at namespace2'
    })
});
