import { socket } from "./Utils";

export const etablish_socket_connection = () =>{
    socket.connect();
    socket.emit('whoiam', 'WEB_CLIENT')
}