import { Router } from "express";
import { createUser, deleteUser, employeeIdValidation, getUsers, updateUser } from "../controllers/administrator/userController";
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
    updateMeetingRoom, getRoomFeatures
} from "../controllers/administrator/meetingRoomController";
import { upload } from "../shared/uploadFile";

const router = Router();

router.get('', (req, res) => {
    res.send('Administrator route');
});
//----------- Users ------------
router.get('/users', async (req, res) => { await getUsers(req, res) });

//----------- User EmployeeId Validation ------------
router.get('/user-validate', async (req, res) => {
    await employeeIdValidation(req, res);
});

router.get('/user/:id/validate', async (req, res) => {
    await employeeIdValidation(req, res);
});
// ----------- Create User ------------
router.post('/user-create', upload.single('avatar') , async (req, res) => {
    await createUser(req, res);
});

// ----------- Update User ------------
router.put('/user/:id/update', upload.single('avatar'), async (req, res) => {
    await updateUser(req, res);
});

// ----------- Delete User ------------
router.delete('/user/:id/delete', async (req, res) => {
    await deleteUser(req, res);
});

//---------- Meeting Rooms ------------
router.get('/meeting-rooms', async (req, res) => {
    await getMeetingRooms(req, res);
});

router.get('/meeting-room/:id', async (req, res) => {
    await getMeetingRoom(req, res);
});

router.post('/meeting-room-create', upload.single('image') ,async (req, res) => {
    await createMeetingRoom(req, res);
});

router.put('/meeting-room/:id/update', upload.single('image'), async (req, res) => {
    await updateMeetingRoom(req, res);
});

router.delete('/meeting-room/:id/delete', async (req, res) => {
    await deleteMeetingRoom(req, res);
});

router.get('/meeting-room-validate', async (req, res) => {
    await isValidateMeetingRoom(req, res);
});

router.get('/meeting-room/:id/validate', async (req, res) => {
    await isValidateMeetingRoomWithId(req, res);
});

router.get('/meeting-room/:id/feature', async (req, res) => {
    await getRoomFeatures(req, res);
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