import { User, UserInterface, UserSocketInterface } from './User';
import { ChatMessage, MessageInterface, MessageTypeEnum } from './Message';
import { chatRooms, Data } from '../controllers/DataController';
import { SocketController } from '../controllers/SocketController';

export interface ChatRoomInterface {
    id?: number;
    users: UserInterface[];
    roomName: string;
    messages: MessageInterface[];
}

export const ChatRoom = {
    createChatRoom: (chatRoom: ChatRoomInterface, userSocketId: string) => {
        if (!chatRoom) {
            console.log(`createChatRoom: chatRoom is null`);
            return null;
        }

        chatRoom.id = chatRooms.length;

        const user = User.findUserBySocketId(userSocketId) as UserInterface;

        chatRooms.push(chatRoom);

        Data.AddUserOnRoom(user, chatRoom.id)
        
        return chatRoom;
    },
    getRooms: () => {
        return chatRooms;
    },
    getRoomById: (id: number) => {
        const room = chatRooms[id];

        if (!room) {
            return null;
        } else {
            return room;
        }
    },
    changeRoomName: (chatRoom: ChatRoomInterface, newName: string, userSocketId: string) => {
        if (!chatRoom){
            console.log(`changeRoomName: chatRoom is null`);
            return null;
        }

        const userSocket = SocketController.findSocketBySocketId(userSocketId) ;

        if (!userSocket){
            console.log(`changeRoomName: não foi encontrado o usuário com o socketId '${userSocketId}'`);
            return null;
        } else {
            if (!userSocket.isAdmin){
                console.log(`changeRoomName: o usuário não é admin`);
                return null;
            } else {
                chatRoom.roomName = newName;

                let chatRoomUsers: UserSocketInterface[] = ChatRoom.getSocketUsersFromRoom(chatRoom.id as number) as UserSocketInterface[];

                if (!chatRoomUsers) {
                    console.log(`changeRoomName: não foram encontrados usuários do chatRoom com o id '${chatRoom.id}'`);
                    return null;
                } else {
                    chatRoomUsers.forEach(userSocketTmp => {
                        userSocketTmp?.emit('update-chatroom-name', { newRoomName: newName });
                    })
                }

                ChatMessage.AddMessage(
                    MessageTypeEnum.status, 
                    Number(chatRoom.id), 
                    `O administrador '${userSocket.name}' alterou o nome da sala para '${newName}'`
                );

                return chatRoom;
            }
        }
    },
    getSocketUsersFromRoom: (roomId: number) => {
        const chatRoom = chatRooms[roomId];

        if (!chatRoom) {
            console.log(`getUsersFromRoom: não foi encontrado o chatRoom com o id '${roomId}'`);
            return null;
        } else {
            let chatRoomUsers = chatRooms[roomId].users.map(chatRoomUser => SocketController.findSocketBySocketId(chatRoomUser.socketId as string));

            if (!chatRoomUsers) {
                console.log(`getUsersFromRoom: não foram encontrados usuários do chatRoom com o id '${roomId}'`);
                return null;
            } else {
                return chatRoomUsers;
            }
            return 
        }
    },
    joinRoom: (roomId: number, user: UserInterface) => {
        const chatRoom = chatRooms[roomId];

        if (!chatRoom) {
            console.log(`joinRoom: não foi encontrado o chatRoom com o id '${roomId}'`);
            return null;
        } 

        if (!user) {
            console.log(`joinRoom: user is null`);
            return null;
        }

        Data.AddUserOnRoom(user, roomId);
    },
    updateChatRoomUsers: (roomId: number) => {
        const chatRoom = chatRooms[roomId];

        if (!chatRoom) {
            console.log(`updateChatRoomUsers: não foi encontrado o chatRoom com o id '${roomId}'`);
            return null;
        } else {
            let chatRoomUsers = ChatRoom.getSocketUsersFromRoom(roomId);

            if (!chatRoomUsers) {
                console.log(`updateChatRoomUsers: não foram encontrados usuários do chatRoom com o id '${roomId}'`);
                return null;
            } else {
                chatRoomUsers.forEach(userSocket => {
                    userSocket?.emit('update-chatroom-users', { users: chatRoom.users });
                })
            }
            return 
        }
    }
}