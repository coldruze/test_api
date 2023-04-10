import UserSchema from "../models/userModel.js";
import bcrypt from "bcrypt";
import {generateTokens, removeToken, saveToken, validateAccessToken, validateRefreshToken, findToken} from "./tokenService.js";
import {UserDto} from "../dto/userDto.js";
import {ApiError} from "../exceptions/apiError.js";


class UserService {
    async userRegistration(email, password) {
        const candidate = await UserSchema.findOne({email});

        if (candidate) {
            throw ApiError.BadRequest(`User with this email already exists`);
        }

        const hashPassword = await bcrypt.hash(password, 3);
        const user = await UserSchema.create({email, password: hashPassword});
        const userDto = new UserDto(user);

        const tokens = generateTokens({...userDto});
        await saveToken(userDto.id, tokens.refreshToken);

        return {...tokens, user: userDto};
    }

    async userLogin(email, password) {
        const user = await UserSchema.findOne({email});

        if (!user) {
            throw ApiError.BadRequest(`User with this email doesn't exist`);
        }

        const isPassEquals = await bcrypt.compare(password, user.password);

        if (!isPassEquals) {
            throw ApiError.BadRequest("Wrong password");
        }

        const userDto = new UserDto(user);

        const tokens = generateTokens({...userDto});
        await saveToken(userDto.id, tokens.refreshToken);

        return {...tokens, user: userDto};
    }

    async userLogout(refreshToken) {
        return await removeToken(refreshToken);
    }

    async refreshCurrentToken(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }

        const userData = validateRefreshToken(refreshToken);

        const tokenFromDb = await findToken(refreshToken);

        if (!tokenFromDb || !userData) {
            throw ApiError.UnauthorizedError();
        }

        const user = await UserSchema.findById(userData.id);
        const userDto = new UserDto(user);

        const tokens = generateTokens({...userDto});
        await saveToken(userDto.id, tokens.refreshToken);

        return {...tokens, user: userDto};
    }

    async getAllUsers() {
        return UserSchema.find();
    }
}


export const {userRegistration, userLogin, userLogout, refreshCurrentToken, getAllUsers} = new UserService();