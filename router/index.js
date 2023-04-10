import {Router} from "express";
import {registration, login, logout, refresh, getUsers} from "../controllers/userController.js";
import {body} from "express-validator";
import {authMiddleware} from "../middlewares/authMiddlware.js";


const router = Router();


router.post("/registration",
    body("email").isEmail(),
    body("password").isLength({min: 4, max: 20}),
    registration);
router.post("/login", login);
router.post("/logout", logout);
router.get("/refresh", refresh);
router.get("/users", authMiddleware, getUsers);


export {router};