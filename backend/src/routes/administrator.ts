import { Router } from "express";
import { getUsers } from "../controllers/administrator/user";
import {
    createFeature,
    createMeetingRoom,
    deleteFeature,
    deleteMeetingRoom,
    getFeature,
    getFeatures,
    getMeetingRoom,
    getMeetingRooms,
    isValidateMeetingRoomWithId,
    isValidateMeetingRoom,
    isValidateFeature,
    isValidateFeatureWithId,
    updateFeature,
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

router.get('/meeting-room/validate', async (req, res) => {
    await isValidateMeetingRoom(req, res);
});

router.get('/meeting-room/:id/validate', async (req, res) => {
    await isValidateMeetingRoomWithId(req, res);
});

//---------- Features ------------

router.get('/features', async (req, res) => {
    await getFeatures(req, res);
});

router.get('/feature-get/:id', async (req, res) => {
    await getFeature(req, res);
});

router.post('/feature-create', async (req, res) => {
    await createFeature(req, res);
});

router.put('/feature-update/:id', async (req, res) => {
    await updateFeature(req, res);
});

router.delete('/feature-delete/:id', async (req, res) => {
    await deleteFeature(req, res);
});

router.get('/feature-validate', async (req, res) => {
    await isValidateFeature(req, res);
});

router.get('/feature/:id/validate', async (req, res) => {
    await isValidateFeatureWithId(req, res);
});


export default router;