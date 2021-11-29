import { ChatRoom, ChatRoomInterface } from "../models/ChatRoom";
import { ChatMessage } from "../models/Message";
import { UserSocketInterface, UserInterface } from "../models/User";

export let connectedUsers: UserSocketInterface[] = []

export let chatRooms: ChatRoomInterface[] = [];

export const Data = {
    AddUserOnRoom: (user: UserInterface, newRoomId: number) => {
        console.log('user dataController:' + user.login);

        if (!user){
            console.log('AddUserOnRoom: user is null!');
            return;
        }
        
        const roomUserId = user.roomId as number;
        const currentChatRoom = (roomUserId >= 0) ? chatRooms[roomUserId]: null;

        //remove usuário da sala atual
        if (currentChatRoom) {
            currentChatRoom.users = currentChatRoom.users.filter(user => user.login != user.login);
            ChatRoom.updateChatRoomUsers(roomUserId)
            ChatMessage.sendEntryOrExitMsg(roomUserId, `Usuário de nome '${user.name}' acabou de se desconectar do chat..'`, false);
        }

        let chatRoom: ChatRoomInterface = {} as any;

        if (!chatRooms[newRoomId]){
            chatRoom = {
                id: newRoomId,
                users: [],
                roomName: 'globalRoom',
                messages: [],
            };
            chatRoom.users.push(user);
            chatRooms.push(chatRoom);
        } else {
            chatRoom = chatRooms[newRoomId];
            if (!chatRoom){
                console.log('AddUserOnRoom: chatRoom is null!');
                return 'AddUserOnRoom: chatRoom is null!';
            }
            chatRoom.users.push(user);
        }

        ChatMessage.sendEntryOrExitMsg(roomUserId, `Usuário de nome '${user.name}' acabou de se conectar no chat..'`, true);

        if (!chatRoom) {
            return null;
        } else {
            return chatRoom;
        }
    },
}