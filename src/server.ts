import express from 'express';
import bodyParser from 'body-parser';
import mainRoutes from './routes/index';
import http from 'http';
import { Server }  from 'socket.io';
import { connectedUsers } from './controllers/DataController';

//models
import { UserSocketInterface } from './models/User';
import { ChatMessage } from './models/Message';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});

//para utilizar a forma JSON
app.use(bodyParser.json());
//para utilizar a forma 'x-www-form-urlencoded'
app.use(bodyParser.urlencoded({ extended: false }))
//Rotas
app.use(mainRoutes);

io.on('connection', (socket : UserSocketInterface) => {
    //cada conexão terá seu próprio socket
    console.log('Conexão detectada...');

    //emite para o cliente o id do socket dele, que deverá ser armazenado em uma variável para enviar para o servidor posteriormente
    //esse id será enviado, pelo front ao back, todas as vezes que for acionada uma rota, 
    //isso faz com que seja possível encontrar o socket dele e fazer a comunicação devida
    socket.emit('id', socket.id);

    connectedUsers.push(socket);

    io.on('view-message', (socketId, messageId) => {
        ChatMessage.setViwedMessage(socketId, messageId);
    })
});