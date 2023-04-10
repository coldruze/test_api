import TokenSchema from "../models/tokenModel.js";
import jwt from "jsonwebtoken";
import config from "../config.json" assert {type: "json"};


class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, config.access_secret, {expiresIn: "10m"});
        const refreshToken = jwt.sign(payload, config.refresh_secret, {expiresIn: "24h"});

        return {
            accessToken,
            refreshToken
        }
    }

    validateAccessToken(token) {
        try {
            return jwt.verify(token, config.access_secret);
        } catch (e) {
            return null;
        }
    }

    validateRefreshToken(token) {
        try {
            return jwt.verify(token, config.refresh_secret);
        } catch (e) {
            return null;
        }
    }

    async saveToken(userId, refreshToken) {
        const tokenData = await TokenSchema.findOne({user: userId});

        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }

        return await TokenSchema.create({user: userId, refreshToken});
    }

    async removeToken(refreshToken) {
        return TokenSchema.deleteOne({refreshToken});
    }

    async findToken(refreshToken) {
        return TokenSchema.findOne({refreshToken});
    }
}


export const {generateTokens, saveToken, removeToken, validateAccessToken, validateRefreshToken, findToken} = new TokenService();