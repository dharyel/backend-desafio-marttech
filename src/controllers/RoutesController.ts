import { Request, Response } from 'express';
import { ChatRoom, ChatRoomInterface } from '../models/ChatRoom';
import { User, UserInterface } from '../models/User';
import { SocketController } from './SocketController';

export const home = (req: Request, res: Response) => {
    res.send('Home');
}

export const createUser = (req: Request, res: Response) => {
    const user: UserInterface = {
        login: req.body.login as string,
        name: req.body.name as string,
        password: req.body.password as string,
        isAdmin: false,
        roomId: -1, //nenhuma sala
        socketId: req.body.socketId as string
    };

    if (User.findUserByLogin(user.login as string) != null) {
        res.json({ error: `Já existe usuário com o login '${user.login}'. Escolha outro! `});
    } else {
        const chatRoom = User.createUser(user);
        if (!chatRoom) {
            res.json({ error: `createUser: houve um erro, não tendo sido retornado o chatRoom do usuário criado`});
            return;
        } else {
            //envia para o frontend o chatRoom atualizado
            res.json({ chatRoom });
            return;
        }

    }
}

export const joinRoom = (req: Request, res: Response) => {
    const id = req.params.roomId as string;
    const room = ChatRoom.getRoomById(Number(id));
    const userSocketId = req.body.socketId as string;
    const reqLogin = req.body.login as string;
    const reqPassword = req.body.password as string;


    const userSocket = SocketController.findSocketBySocketId(userSocketId);
    const user = User.findUserByLogin(reqLogin);

    if (!userSocket) {
        res.json({ error: `joinRoom: não foi encontrado o user de login ${reqLogin} pelo socketId ${userSocketId}`});
        return;
    } else {
        if (userSocket.login == reqLogin) {
            if (userSocket.password == reqPassword) {
                if (!room) {
                    res.json({ error: `joinRoom: não foi encontrado o chatRoom de id ${id}`});
                    return;
                } else {
                    ChatRoom.joinRoom(Number(id), user);
                }
            } else {
                res.json({ error: `joinRoom: senha inválida`});
            }
        }
    }
}

export const getUserByLogin = (req: Request, res: Response) => {
    const requestLogin = req.query.login as string;
    const userData = User.findUserByLogin(requestLogin);

    if (!userData){
        res.json({ error: `Não foi encontrado um usuário com o login ${requestLogin}`});
    } else {
        res.json({
            //retorna os dados do usuário, EXCETO a senha
            login: userData.login,
            name: userData.name,
            isAdmin: userData.isAdmin,
            roomId: userData.roomId,
            socketId: userData.socketId
        });
    }
}

export const getRooms = (req: Request, res: Response) => {
    const allChatRooms = ChatRoom.getRooms();
    res.json({allChatRooms});
}

export const getRoomById = (req: Request, res: Response) => {
    const id = req.params.roomId as string;
    const room = ChatRoom.getRoomById(Number(id));
    
    if (!room){
        res.json({ error: `Não foi encontrado um chatRoom com o id ${id}`});
    } else {
        res.json({room});
    }
}

export const createRoom = (req: Request, res: Response) => {
    const socketId = req.body.socketId as string;
    const roomName = req.query.name as string;
    
    const tempRoom: ChatRoomInterface = ({
        messages: [],
        roomName: roomName,
        users: [],
    });

    const createdRoom = ChatRoom.createChatRoom(tempRoom, socketId);
    res.json({createdRoom});
}

export const changeRoomName = (req: Request, res: Response) => {
    const socketId = req.body.socketId as string;
    const id = req.params.id as string;
    const newRoomName = req.params.newRoomName as string;

    const room = ChatRoom.getRoomById(Number(id));

    if (!room){
        res.json({ error: `Não foi encontrada uma sala com o id ${id}`});
        return;
    }

    const chatRoomUpdated = ChatRoom.changeRoomName(room, newRoomName, socketId);
    res.json({chatRoomUpdated});
}