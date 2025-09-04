let Admin = require('../../../../models').tbl_adminusers;
let Roles = require('../../../../models').tbl_usertypes;
let RoleAccess = require('../../../../models').tbl_roleaccess;
const {
    Op,
    literal
} = require("sequelize");


const jwt = require('../../../../utils/jwt.util');
let {
    dump
} = require('../../../helper/logs');
let {
    success,
    failed,
    failedValidation
} = require('../../../helper/response');
const jwtConfig = require('../../../../config/jwt.config');
const {
    Validator
} = require('node-input-validator');
const {
    decrypter, passwordEncrypter, dotNetPasswordEncrypt, dotNetPasswordDecrypt
} = require('../../../helper/crypto');
const {
    mail
} = require('../../../helper/mail');
const admin = require('../../../helper/adminAuth');
const {
    fn,
    col
} = require('../../../../models').sequelize

exports.login = async function (req, res) {
    try {
        var requests = await decrypter(req.body);

        if (requests == false) {
            return failed(res, "Internal server error");
        }

        const v = new Validator(requests, {
            username: 'required',
            password: 'required'
        });

        const matched = await v.check();
        if (!matched) {
            return failedValidation(res, v);
        }

        let user = await Admin.findOne({
            where: {
                EmailID: requests.username,
                Status: 1
            },
            attributes: [
                'Password',
                'UserID',
                'FirstName',
                'LastName',
                'EmailID',
                'UserTypeID',
                'Status',
                //[fn('CONCAT', process.env.AWS_IMAGE_URL, col('ProfilePic')), 'ProfilePic']
            ],
            include: [{
                model: Roles,
                as: "usersType",
                include: [{
                    model: RoleAccess,
                    as: "RoleAccess"
                }]
            }]
        });

        if (!user)
            return failed(res, "User not found");

        if (user.dataValues.Status == 0) {
            return failed(res, "Your account is inactive ,please contact to admin");
        }

        // extract RoleAccess
        let userAccessIds = user.dataValues.usersType?.RoleAccess || [];
        const userAccessIdsArr = userAccessIds.map(item => item.access_code);

        var data = {};

        let encPass = await dotNetPasswordEncrypt(requests.password);
        console.log("encpass : ", encPass);

        if (encPass == user.dataValues.Password) {
            if (requests.type && requests.type == 'admin') {
                // future restriction logic here if needed
            }

            const token = await jwt.createToken({
                data: user.dataValues.UserID,
                roleId: user.dataValues.UserTypeID,
            });

            data = {
                access_token: token,
                token_type: 'Bearer',
                expires_in: jwtConfig.ttl,
                firstname: user.dataValues.FirstName,
                lastname: user.dataValues.LastName,
                email: user.dataValues.EmailID,
                roleId: user.dataValues.UserTypeID,
                roleName: user.dataValues.usersType.UserType,
                ProfilePic: user.dataValues.ProfilePic,
                roleAccess: userAccessIdsArr
            };

            return success(res, 'Success', data);
        } else {
            return failed(res, "Invalid Password.");
        }

    } catch (error) {
        return failed(res, error.message);
    }
};

exports.forgotPassword = async function (req, res) {
    try {

        var requests = await decrypter(req.body);

        if (requests == false) {
            return failed(res, "Internal server error");
        }

        // Validate the request data: check that the 'email' field is provided
        const v = new Validator(requests, {
            email: 'required|email',
        });

        const matched = await v.check();

        // If validation fails, return an error
        if (!matched) {
            return failedValidation(res, v);
        }

        // Find the user by emailid in the database
        let user = await Admin.findOne({
            where: {
                EmailID: requests.email,
                Status: 1
            }
        });

        var data = {};

        // If the user exists
        if (user) {
            // Generate the reset password URL
            let url = process.env.ADMIN_RESET_PASSWORD + user.dataValues.UserID;

            // Prepare the mail data for sending the reset link via email
            var mailData = {
                email: user.dataValues.EmailID,
                subject: "Change Password Request",
                text: url,
                html: `<a href="${url}" target="__blank">Click Here to Reset Password</a>`,
            };

            // Call the mail function to send the email with the reset link
            mail(mailData);

        } else {
            // If the user is not found, return an error
            return failed(res, "Invalid Email.");
        }

        // Return a success response
        return success(res, 'Success', data);
    } catch (error) {
        // Catch any errors and return a failure response
        return failed(res, error.message);
    }
}



exports.resetPasword = async function (req, res) {
    try {

        var requests = await decrypter(req.body);

        if (requests == false) {
            return failed(res, "Internal server error");
        }
        dump({ requests })
        const v = new Validator(requests, {
            key: 'required',
            password: 'required|same:confirmPassword'
        });

        const matched = await v.check();

        if (!matched) {
            return failedValidation(res, v);
        }

        const user = await Admin.findOne({
            where: {
                UserID: requests.key
            }
        });

        var data = {}

        if (user) {
            let encPass = await dotNetPasswordEncrypt(requests.password)
            dump({ encPass })
            await Admin.update({
                Password: encPass
            }, {
                where: {
                    UserID: requests.key
                }
            });
        } else {
            return failed(res, "Invalid Key.");
        }

        return success(res, 'Success', data);
    } catch (error) {
        return failed(res, error.message);
    }
}

exports.changePassword = async function (req, res) {
    try {

        var requests = await decrypter(req.body);

        if (requests == false) {
            return failed(res, "Internal server error");
        }

        const v = new Validator(requests, {
            password: "required",
            newPassword: 'required|same:confirmPassword',
            confirmPassword: 'required'
        });

        const matched = await v.check();

        if (!matched) {
            return failedValidation(res, v);
        }

        let userData = await admin(req);

        const user = await Admin.findOne({
            where: {
                UserID: userData.dataValues.UserID
            }
        });


        var data = {}

        if (user) {
            let encPass = await dotNetPasswordEncrypt(requests.newPassword)
            let decPass = await dotNetPasswordDecrypt(user.dataValues.Password)
            if (decPass != requests.password) {
                return failed(res, "Invalid password.");
            } else {
                await Admin.update({
                    Password: encPass
                }, {
                    where: {
                        UserID: userData.dataValues.UserID
                    }
                });
            }
        } else {
            return failed(res, "User not found.");
        }

        return success(res, 'Success', data);
    } catch (error) {
        return failed(res, error.message);
    }
}


