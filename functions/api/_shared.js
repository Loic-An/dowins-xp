import * as jose from "jose";
import bcrypt from 'bcryptjs';

/**
 * @type {Uint8Array| import("jose").KeyLike | null}
 */
var key = null;
const appsInstalled = ["command_prompt", "hangman", "internet_explorer", "media_center", "flipper"]
/**
 * get shared key
 * @param {*} env 
 */
export async function getSharedKey(env) {
    return key || (key = await jose.importJWK({ kty: "oct", k: env.JWT_KEY, alg: "HS256" }))
}

/**
 * 
 * @param {string} token 
 * @param {*} env 
 * @returns 
 */
export async function verifyToken(token, env) {
    return await jose.jwtVerify(token, await getSharedKey(env), { issuer: "Socrimoft", audience: "Dowins-XP", clockTolerance: 60 })
}

/**
 * 
 * @param {string} username 
 */
export async function createNewToken(username, env) {
    return await new jose.SignJWT({ sub: username, appsInstalled })
        .setIssuer("Socrimoft")
        .setAudience("Dowins-XP")
        .setIssuedAt()
        .setExpirationTime('24h')
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .sign(await getSharedKey(env));
}

/**
 * compare password
 * @param {*} plain 
 * @param {*} hash 
 * @returns `true` if the password is correct, `false` otherwise
 */
export function comparePassword(plain, hash) {
    return bcrypt.compareSync(plain, hash)
}

/**
 * hash password
 */
export function hashPassword(password) {
    return bcrypt.hashSync(password, 8)
}

/**
 * @param {import("@cloudflare/workers-types/experimental").D1Database} db
 * @param {string} value
 */
export async function prepareDBpassword(db, value) {
    return await db.prepare('SELECT Password FROM Users WHERE Username = ?1').bind(value).run()
}

/**
 * @param {number} min 
 * @param {number} max 
 * @returns 
 */
export function getRandomWord(min, max) {
    if (max > Object.keys(words).length) {
        max = Object.keys(words).length - 1
        if (min > Object.keys(words).length) min = Object.keys(words).length - 1
    }
    const index = min + Math.floor(Math.random() * (max - min))
    return words[index][(Math.random() * words[index].length) | 0]
}
/**
 * run `npm build` to populate the constant
 * @type {{[key:number]:string[]}}
 */
const words = {}