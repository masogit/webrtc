# webrtc

4个部分：

1. const { RTCPeerConnection, RTCSessionDescription } = window;
2. 传递信号通过WebSocket等方式将offer和answer传递
    1. Call: create offer ⇒ setLocal ⇒ send
    2. Answer: receive offer ⇒ setRemote, then create answer ⇒ setLocal ⇒ send back
    3. Call: receive answer ⇒ setRemote
3. stream = await navigator.getUserMedia({ video: true, audio: true)
    1. localVideo.srcObject = stream
    2. stream.getTracks().forEach(track ⇒ peerConn.addTrack(track, stream))
    3. peerConn.ontrack = e ⇒ remoteVideo.srcObject = e.streams[0];
4. 传递信号的后端部分
