const path = require('path');
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// views 엔진 ejs로 설정
app.set('view engine', 'ejs');
// view경로
app.set('views', path.join(__dirname, 'views'));

// 채팅방 종류
let room = [];
let a = 0;

// / 일 경우 chat파일 호출
app.get('/', (req, res) => {
    res.render('chat');
}); 

// default에 접근시
io.on('connection', (socket) => {
    // 현재 방 가져오기
    function getRoomsKey(rooms) {
        const result = [];
        for (var entry of rooms.entries()) {
            var key = entry[0];
            if (entry[0].indexOf('room') < 0) {
                continue;
            }
            result.push(key);
        }
        return result;
    }

    console.log('유저가 접속했습니다.');

    // 전체에게 전송
    socket.broadcast.emit('hi');

    // 방 생성
    socket.on('create', function (room) {
        socket.join(room);
        const rooms = io.sockets.adapter.rooms;
        const result = getRoomsKey(rooms);
        io.emit('setRooms', result);
    });

    // 소켓 연동 종료 이벤트
    socket.on('disconnect', () => {
        console.log('유저가 접속을 종료 했습니다.');
    });

    // socket 참여 이벤트 핸들러 (이 이벤트 호출은 클라이언트에서 한다)
    socket.on('joinRoom', (num, name) => {
        a = num;
        console.log(`[SERVER] 참여 ${num}방 ${name}님`);
        socket.join(num);
        // 특정 룸의 이벤트를 호출한다. (클라이언트에 이벤트를 발송한다.)
        // io는 일종의 아파트의 관리사무실이라고 보면 된다.
        // 관리사무실에서 특정 방에 방송을 하는 것이다.
        // io.to(room[num]).emit('joinChatRoom', name, num);
        io.to(num).emit('joinChatRoom', name, num);
        
    });

    // socket 이탈 이벤트 핸들러 (이 이벤트 호출은 클라이언트에서 한다)
    socket.on('leaveRoom', (num, name) => {
        console.log(`[SERVER] 이탈 ${num}방 ${name}님`);
        // socket에 leave
        socket.leave(num);
        // 특정 룸의 이탈 이벤트 (leaveRoom)를 클라이언트로 송출한다.
        io.to(num).emit('leaveChatRoom', name, num);
    });

    // chat message 이벤트 핸들러
    socket.on('chat message', (num, name, msg) => {
        a = num;
        io.to(num).emit('chat message', name, msg);
    });
});

http.listen(8001, () => {
    console.log('connect at 8001');
});