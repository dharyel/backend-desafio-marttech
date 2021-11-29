import { Socket } from 'socket.io';
import { chatRooms } from '../controllers/DataController';
import { SocketController } from '../controllers/SocketController';
import { ChatRoom } from './ChatRoom';

export interface UserInterface {
    login?: string;
    name?: string;
    password?: string;
    isAdmin?: boolean;
    roomId: number;
    socketId: string | null;
}

export interface UserSocketInterface extends Socket {
    login?: string;
    name?: string;
    password?: string;
    isAdmin?: boolean;
    roomId?: number;
}

export const User = {
    createUser: (userData: UserInterface) => {
        console.log('user data:' + userData.login);

        let userSocket = SocketController.findSocketBySocketId(userData.socketId as string);
        
        if (!userSocket){
            console.log(`createUser: não foi encontrado o userSocket do socketId de login '${userData.login}'`);
            return null;
        } else {
            userSocket.login = userData.login;
            userSocket.name = userData.name;
            userSocket.password = userData.password;
            userSocket.isAdmin = userData.isAdmin;
            userSocket.roomId = userData.roomId;
        }
    },
    findUserByLogin:(userLogin: string) => {
        let user: any;

        chatRooms.forEach( room => {
            if (room && room.users) {
                room.users.find( roomUser => {
                    if ((roomUser.login as string).toLowerCase().trim() === userLogin.toLowerCase().trim()){
                        user = roomUser;
                        return true;
                    };
                    return user;
                })
            }
        })
        
        if (!user)
            return null;

        return user;

        
    },
    findUserBySocketId:(socketId: string) => {
        let user: UserInterface | undefined;

        chatRooms.forEach( room => {
            if (room && room.users) {
                user = room.users.find( roomUser => socketId === roomUser.socketId);
            }
        })
        
        if (!user) {
            return null;
        } else {
            return user;
        }
    },
    setUserAsAdmin: (userSocketId: string) => {
        const userSocket: UserSocketInterface | null = SocketController.findSocketBySocketId(userSocketId);
        const user: UserInterface | null = User.findUserBySocketId(userSocketId);
        
        if (userSocket) 
            userSocket.isAdmin = true;

        if (user) {
            user.isAdmin = true;
            ChatRoom.updateChatRoomUsers(user.roomId);
        }

    }

}