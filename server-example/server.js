
console.log('HELLO NODE');

const io = require("socket.io");
const server = io.listen(1111);


var fileTreeOutput = [
  { name: 'scene1', files: ["media1-1.mp4","media1-2.mp4","media1-3.mp4","media1-4.mp4","media1-5.mp4","media1-6.mp4","media1-7.mp4","media1-8.mp4","media1-9normal.mp4"] },
  { name: 'scene2', files: ["media2-1.mp4","media2-2.mp4","media2-3.mp4","media2-4.mp4","media2-5.mp4","media2-6.mp4","media2-7.mp4","media2-8.mp4","media2-9.mp4"] },
  { name: 'scene3', files: ["media3-1.mp4","media3-2.mp4","media3-3.mp4","media3-4.mp4","media3-5.mp4","media3-6.mp4","media3-7.mp4","media3-8.mp4","media3-9.mp4"] },
  { name: 'scene4', files: ["media4-1.mp4","media4-2.mp4","media4-3.mp4","media4-4.mp4","media4-5.mp4","media4-6.mp4","media4-7.mp4","media4-8.mp4","media4-9.mp4"] },
  { name: 'scene5', files: ["media5-1.mp4","media5-2.mp4","media5-3.mp4","media5-4.mp4","media5-5.mp4","media5-6.mp4","media5-7.mp4","media5-8.mp4","media5-9.mp4"] },
  { name: 'scene6', files: ["media6-1.mp4","media6-2.mp4","media6-3.mp4","media6-4.mp4","media6-5.mp4","media6-6.mp4","media6-7.mp4","media6-8.mp4","media6-9.mp4"] },
  { name: 'scene7', files: ["media7-1.mp4","media7-2.mp4","media7-3.mp4","media7-4.mp4","media7-5.mp4","media7-6.mp4","media7-7.mp4","media7-8.mp4","media7-9.mp4"] },
  { name: 'scene8', files: ["media8-1.mp4","media8-2.mp4","media8-3.mp4","media8-4.mp4","media8-5.mp4","media8-6.mp4","media8-7.mp4","media8-8.mp4","media8-9.mp4"] },
  { name: 'scene9', files: ["media9-1.mp4","media9-2.mp4","media9-3.mp4","media9-4.mp4","media9-5.mp4","media9-6.mp4","media9-7.mp4","media9-8.mp4","media9-9.mp4"] }
]
var disposInfosOutput = [
  { name: 'RPi1', isConnected: true, isPaused: true, isLooping: false, isMuted: true, playing:'media1-1.mp4' },
  { name: 'RPi2', isConnected: true, isPaused: true, isLooping: true, isMuted: true, playing:'stop' },
  { name: 'RPi3', isConnected: false, isPaused: true, isLooping: false, isMuted: true, playing:'stop' },
  { name: 'RPi4', isConnected: true, isPaused: true, isLooping: false, isMuted: true, playing:'stop' },
  { name: 'Bus', isConnected: true, isPaused: true, isLooping: false, isMuted: true, playing:'stop' },
  { name: 'Camion', isConnected: true, isPaused: true, isLooping: false, isMuted: true, playing:'media1-4.mp4' },
  { name: 'Panneau', isConnected: true, isPaused: true, isLooping: false, isMuted: true, playing:'media1-4.mp4' },
  { name: 'Charrette', isConnected: true, isPaused: true, isLooping: false, isMuted: true, playing:'media1-4.mp4' },
  { name: 'Poubelle', isConnected: true, isPaused: true, isLooping: false, isMuted: true, playing:'media1-4.mp4' }
];

server.on("connection", (socket) => {

    console.log("Client connected");

    socket.on("disconnect", () => {
        console.log("Client gone [id=${socket.id}]");
    });

    socket.emit("fileTree",fileTreeOutput);

    socket.on("PLAY", function(msg){
      console.log("PLAY "+msg);
    });
    socket.on("PLAYSEQ", function(msg){
      console.log("PLAYSEQ "+msg);
    });

    socket.on("MUTE", function(msg){
      console.log("MUTE "+msg);
    });
    socket.on("LOOP", function(msg){
      console.log("LOOP "+msg);
    });
    socket.on("PAUSE", function(msg){
      console.log("PAUSE "+msg);
    });
    socket.on("STOP", function(msg){
      console.log("STOP "+msg);
    });

    setInterval(() => {
      socket.emit("disposInfos", disposInfosOutput);
      socket.emit("fileTree", fileTreeOutput);
    }, 5000);
});
