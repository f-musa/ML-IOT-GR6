import { socket } from "./Utils";

export const etablish_socket_connection = () =>{
    console.log("try to connect");
    socket.connect();
    socket.emit('whoiam', 'WEB_CLIENT')
}