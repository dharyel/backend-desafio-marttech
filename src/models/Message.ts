import { chatRooms } from "../controllers/DataController";
import { SocketController } from "../controllers/SocketController";
import { ChatRoom, ChatRoomInterface } from "./ChatRoom";
import { User } from "./User";

export interface MessageInterface {
    id: number;
    messageText: string;
    messageViewed: boolean;
}

export enum MessageTypeEnum {
    //mensagens de status são mensagens do servidor, que normalmente avisa se o usuário se desconectou, reconectou, entrou no chat, etc..
    status,
    //mensagens de user são as mensagens enviadas pelos usuários
    user
}

export const ChatMessage = {
    AddMessage: (type: MessageTypeEnum, chatRoomId: number, msg: string, userSocketId: string | null = null) => {
        const message: MessageInterface = {
            id: chatRooms[chatRoomId].users.length,
            messageText: msg,
            messageViewed: false
        }

        chatRooms[chatRoomId].messages.push(message);
        
        const chatRoomUsers = ChatRoom.getSocketUsersFromRoom(chatRoomId);

        let data = {};

        switch (type) {
            case MessageTypeEnum.status:
                data = {
                    type: type.toString(),//pode ser 'status' ou 'user'
                    message,
                };

                chatRoomUsers?.forEach(user => {
                    user?.emit('add-message', data);
                })
               
                break;

            case MessageTypeEnum.user:
                data = {
                    type: type.toString(),//pode ser 'status' ou 'user'
                    message,
                    //será enviado o userSocketId
                    //no frontend, será possível verificar se é o mesmo cliente que enviou a mensagem, 
                    //podendo estilizar a mensagem dependendo se o cliente é quem mandou ela ou é apenas outro cliente
                    userSocketId
                };

                chatRoomUsers?.forEach(user => {
                    user?.emit('add-message', data);
                })

                break;
            default:
                console.log('AddMessage: caiu no default do switch!');
                break
        }
    },
    sendEntryOrExitMsg: (chatRoomId: number, msg: string, isEntryMsg: boolean) => {
        const message: MessageInterface = {
            id: chatRooms[chatRoomId].users.length,
            messageText: msg,
            messageViewed: false
        }
        
        chatRooms[chatRoomId].messages.push(message);

        let data = {
            type: MessageTypeEnum.status.toString(),
            msg,
            //isEntryMsg deverá ser true se for mensagem de entrada e false Caso seja de saída
            isEntryMsg
        };

        const chatRoomUsers = ChatRoom.getSocketUsersFromRoom(chatRoomId);

        chatRoomUsers?.forEach(user => {
            user?.emit('entry-exit-message', data);
        })
    },
    setViwedMessage: (socketId: string, messageId: number) => {
        const user = User.findUserBySocketId(socketId);
        const roomId = user?.roomId;
        const chatRoomUsers = ChatRoom.getSocketUsersFromRoom(roomId as number);

        let chatRoom: ChatRoomInterface | null = null;
        let message: MessageInterface | null = null;

        if (roomId) 
            chatRoom = chatRooms[roomId]; 

        if (chatRoom) {
            message = chatRoom.messages.find(msg => msg.id == messageId) as MessageInterface;

            if (message)
                message.messageViewed = true;
        }
        
        if (chatRoomUsers){
            chatRoomUsers.forEach(user => {
                user?.emit('viwed-message', {
                    roomId,
                    messageId
                })      
            });
        }

        return message;
    }
}