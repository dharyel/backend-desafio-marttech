import { ChatRoomInterface } from "../models/ChatRoom";
import { chatRooms, connectedUsers } from '../controllers/DataController';

export const SocketController = {
    findSocketBySocketId: (socketId: string) => {
        const userSocket = connectedUsers.find(connectedUser => connectedUser.id === socketId);

        if (!userSocket) {
            console.log(`findSocketBySocketId: não encontrou o socket do usuário com socketId: ${socketId}`);
            return null;
        } else {
            return userSocket;
        }
    },
}