import { Router } from "express";
import {
    assignRoleUser, assignRoleUserAll,
    createUser,
    deleteUser,
    employeeIdValidation,
    getUser,
    getUsers, revokeRoleUser, revokeRoleUserAll,
    updateUser
} from "../controllers/administrator/userController";
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
import {
    createRole, deleteRole,
    getAllPermissions,
    getAllRoles,
    permissionAssign, revokePermission, updateRole
} from "../controllers/administrator/rolePermissionController";
import {createBlog, deleteBlog, getBlog, getBlogs, updateBlog} from "../controllers/administrator/blogController";
import {
    getHourlyBookingReport,
    getTopBooks,
    getTopDepartmentBooks, getTopDepartmentBooksByRoomNames
} from "../controllers/administrator/reportController";

const router = Router();

router.get('', (req, res) => {
    res.send('Administrator route');
});
//----------- Users ------------
router.get('/users', async (req, res) => { await getUsers(req, res) });

router.get('/user/:id', async (req, res) => {
    await getUser(req, res);
});

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
router.put('/user/:id/update', upload.single('avatar'), updateUser);

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

router.put('/meeting-room/:id/update', upload.single('image'),updateMeetingRoom);

router.delete('/meeting-room/:id/delete', async (req, res) => {
    await deleteMeetingRoom(req, res);
});

router.get('/meeting-room-validate', isValidateMeetingRoom);

router.get('/meeting-room/:id/validate', isValidateMeetingRoomWithId);

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

// ----------- Role and Permission ------------
router.get('/roles', getAllRoles);
router.post('/role-create', createRole);
router.post('/role-update/:id', updateRole);
router.delete('/role-delete/:id', deleteRole);
router.post('/role-assign-permission',permissionAssign);
router.post('/role-revoke-permission',revokePermission);

router.get('/permissions', getAllPermissions);

// ----------- Role and User ------------
router.post('/role-assign-user', assignRoleUser);
router.post('/role-revoke-user', revokeRoleUser);
router.post('/role-assign-user-all', assignRoleUserAll);
router.post('/role-revoke-user-all', revokeRoleUserAll);

// ----------- Blog ------------
router.get('/blogs', getBlogs);
router.post('/blog-create', upload.single('image'), createBlog);
router.get('/blog/:id/info', getBlog);
router.post('/blog/:id/update', upload.single('image'), updateBlog);
router.delete('/blog/:id/delete', deleteBlog);


// ----------- Report ------------
router.get('/report/top-booking', getTopBooks);
router.get('/report/top-department-booking', getTopDepartmentBooks);
router.get('/report/top-department-booking-rooms', getTopDepartmentBooksByRoomNames);
// getHourlyBookingReport
router.get('/report/hourly-booking', getHourlyBookingReport);

export default router;