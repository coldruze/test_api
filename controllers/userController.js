import {userRegistration, userLogin, userLogout, refreshCurrentToken, getAllUsers} from "../services/userService.js";
import {validationResult} from "express-validator";
import {ApiError} from "../exceptions/apiError.js";


class UserController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest("Validation error", errors.array()));
            }

            const {email, password} = req.body;
            const userData = await userRegistration(email, password);

            res.cookie("refreshToken", userData.refreshToken, {maxAge: 600000, httpOnly: true});

            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const {email, password} = req.body;
            const userData = await userLogin(email, password);

            res.cookie("refreshToken", userData.refreshToken, {maxAge: 600000, httpOnly: true});

            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const token = await userLogout(refreshToken);

            res.clearCookie("refreshToken");
            return res.json(token);
        } catch (e) {
            next(e);
        }
    }

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const userData = await refreshCurrentToken(refreshToken);

            res.cookie("refreshToken", userData.refreshToken, {maxAge: 600000, httpOnly: true});

            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async getUsers(req, res, next) {
        try {
            const users = await getAllUsers();
            
            return res.json(users);
        } catch (e) {
            next(e);
        }
    }
}

export const {registration, login, logout, refresh, getUsers} = new UserController();