import {User} from './../models/models';

export async function newUser(req, res, next) {

    let user = await User.findOne({where: {username: req.body.username}});

    if (user) {
        req.session.alert = user.username + " is already registered. Please choose another username";
        next();
        return;
    }

    let newUser = User.build({
        username: req.body.username,
        password: req.body.password,
        admin: false,
    });

    let userOk = await newUser.save();

    if (userOk) {
        req.session.alert = userOk.username + " has been registered";
        next();
    }

}

export async function getUsers(req,res,next) {






}

export async function updatePassword(req, res, next) {

    let user = await User.findOne({where: {username: req.session.user.username}});

    user.password = req.body.updatePassword;

    if (await user.save()) {
        req.session.alert = "Password updated";
    }

    next();

}
