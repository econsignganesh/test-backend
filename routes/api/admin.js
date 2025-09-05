const express = require('express');
const router = express.Router();

// Controllers
const UserController = require('../../app/controller/v1/admin/UserController');


router.post('/user-create', UserController.createUser);
router.post('/user-edit', UserController.editUser);
router.post('/user-delete', UserController.deleteUser);
router.get('/users-all-list', UserController.listUsers);
router.post('/user-status', UserController.statusUser);
router.get('/user-details', UserController.getUserDetails);


module.exports = router;


