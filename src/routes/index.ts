import { Router} from "express";
import * as RoutesController from "../controllers/RoutesController";

const router = Router();

router.get('/', RoutesController.home);

router.post('/create-user', RoutesController.createUser);
router.get('/user/:login', RoutesController.getUserByLogin);

router.put('/join-room/:roomId', RoutesController.joinRoom);
router.get('/rooms', RoutesController.getRooms);
router.get('/room/:roomId', RoutesController.getRoomById);
router.post('/create-room/:roomName', RoutesController.createRoom);
router.put('/change-room-name/:roomId', RoutesController.changeRoomName);

export default router;

