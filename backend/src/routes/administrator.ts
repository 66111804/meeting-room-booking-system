import { Router } from "express";
import { getUsers } from "../controllers/administrator/user";
import {
    createFeature,
    createMeetingRoom, deleteFeature, deleteMeetingRoom, getFeature, getFeatures,
    getMeetingRoom,
    getMeetingRooms, isFeatureExist, isFeatureExistWithId, isMeetingRoomExist, isMeetingRoomExistWithId, updateFeature,
    updateMeetingRoom
} from "../controllers/administrator/meeting-room";

const router = Router();

router.get('', (req, res) => {
    res.send('Administrator route');
});
//----------- Users ------------
router.get('/users', async (req, res) => { await getUsers(req, res) });

//---------- Meeting Rooms ------------
router.get('/meeting-rooms', async (req, res) => {
    await getMeetingRooms(req, res);
});

router.get('/meeting-room/:id', async (req, res) => {
    await getMeetingRoom(req, res);
});

router.post('/meeting-room', async (req, res) => {
    await createMeetingRoom(req, res);
});

router.put('/meeting-room/:id/update', async (req, res) => {
    await updateMeetingRoom(req, res);
});

router.delete('/meeting-room/:id/delete', async (req, res) => {
    await deleteMeetingRoom(req, res);
});

router.get('/meeting-room/is-exist', async (req, res) => {
    await isMeetingRoomExist(req, res);
});

router.get('/meeting-room/:id/is-exist', async (req, res) => {
    await isMeetingRoomExistWithId(req, res);
});

//---------- Features ------------
router.get('/features', async (req, res) => {
    await getFeatures(req, res);
});

router.get('/feature/:id', async (req, res) => {
    await getFeature(req, res);
});

router.post('/feature', async (req, res) => {
    await createFeature(req, res);
});

router.put('/feature/:id/update', async (req, res) => {
    await updateFeature(req, res);
});

router.delete('/feature/:id/delete', async (req, res) => {
    await deleteFeature(req, res);
});

router.get('/feature/is-exist', async (req, res) => {
    await isFeatureExist(req, res);
});

router.get('/feature/:id/is-exist', async (req, res) => {
    await isFeatureExistWithId(req, res);
});

export default router;