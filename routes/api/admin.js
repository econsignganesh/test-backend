const express = require('express');
const router = express.Router();
const auth = require('../../app/middleware/adminAuth');

// Controllers
const LoginController = require('../../app/controller/v1/admin/LoginController');
const UsertypeController = require('../../app/controller/v1/admin/UsertypeController');
const UserController = require('../../app/controller/v1/admin/UserController');
const MenuAccessCodesController = require('../../app/controller/v1/admin/MenuAccessCodesController');


router.post('/login', LoginController.login);
router.post('/forgot-Password', LoginController.forgotPassword);
router.post('/reset-Password', LoginController.resetPasword);
router.post('/change-password', auth, LoginController.changePassword);

//user
router.post('/user-create', auth, UserController.createUser);
router.post('/user-edit', auth, UserController.editUser);
router.post('/user-delete', auth, UserController.deleteUser);
router.get('/users-all-list', auth, UserController.listUsers);
router.post('/user-status', auth, UserController.statusUser);
router.get('/user-details', auth, UserController.getUserDetails);
//usertype routes
router.post('/usertype-create', auth, UsertypeController.createUserType);
router.post('/usertype-edit', auth, UsertypeController.editUserType);
router.get('/usertype-list', auth, UsertypeController.listUserTypes);
router.get('/usertype-active-list', auth, UsertypeController.listActiveUserTypes);
router.post('/usertype-status', auth, UsertypeController.statusUserType);
router.post('/usertype-delete', auth, UsertypeController.deleteUserType);

// Menu Access Codes Management 
router.get("/menuaccesscodes-list", auth, MenuAccessCodesController.getMenuAccessCodesList);
router.post("/menuaccesscodes-add", auth, MenuAccessCodesController.addMenuAccessCodes);
router.post("/menuaccesscodes-edit", auth, MenuAccessCodesController.UpdateMenuAccessCodes);
router.post("/menuaccesscodes-delete", auth, MenuAccessCodesController.DeleteMenuAccessCodes);
router.post("/menuaccesscodes-status", auth, MenuAccessCodesController.StatusUpdateMenuAccessCodes);
router.get("/menuaccesscodes-by-id", auth, MenuAccessCodesController.GetMenuAccessCodesByID);

// Menu Modules
router.get("/menumodules-dropdown", auth, MenuAccessCodesController.getMenuModulesDropDownList);
router.get("/list-menuaccess-with-module", auth, MenuAccessCodesController.getMenuAccessCodesListWithModules);
router.get("/list-roles-with-module", auth, MenuAccessCodesController.getRolesWithModules);
//  User Roles 
router.get("/userrole-dropdown", auth, MenuAccessCodesController.getUserRoledropdownList);

// Role Access 
router.get("/roleaccess-list", auth, MenuAccessCodesController.Getroleaccesslist);
router.get("/unassigned-roleaccess", auth, MenuAccessCodesController.getUnassignedRoleAccessCodes);
router.post("/assign-roleaccess", auth, MenuAccessCodesController.assignAccessCodesToRole);
router.post("/delete-roleaccess", auth, MenuAccessCodesController.deleteAssignedRoleAccess);



module.exports = router;


