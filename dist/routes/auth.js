"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
// POST /api/login
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('[LOGIN] --- INICIO ---');
    const { email, password } = req.body;
    console.log('[LOGIN] Email recibido:', email);
    try {
        const user = yield prisma_1.default.user.findUnique({ where: { email } });
        console.log('[LOGIN] Usuario encontrado:', user);
        if (!user) {
            console.log('[LOGIN] Usuario no encontrado');
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        const valid = yield bcryptjs_1.default.compare(password, user.password);
        console.log('[LOGIN] Contraseña válida:', valid);
        if (!valid) {
            console.log('[LOGIN] Contraseña incorrecta');
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        const { password: _ } = user, userData = __rest(user, ["password"]);
        console.log('[LOGIN] Login exitoso para:', email);
        res.json({ user: userData, token });
        console.log('[LOGIN] --- FIN (éxito) ---');
    }
    catch (error) {
        console.error('[LOGIN] Error:', error);
        res.status(500).json({ error: 'Error en login' });
        console.log('[LOGIN] --- FIN (error) ---');
    }
}));
// POST /api/register
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('[REGISTER] --- INICIO ---');
    const { email, password, firstName, lastName, role } = req.body;
    console.log('[REGISTER] Incoming data:', { email, firstName, lastName, role });
    try {
        const exists = yield prisma_1.default.user.findUnique({ where: { email } });
        console.log('[REGISTER] User exists?', !!exists);
        if (exists) {
            console.log('[REGISTER] Email already registered:', email);
            return res.status(400).json({ error: 'El email ya está registrado' });
        }
        const hashed = yield bcryptjs_1.default.hash(password, 10);
        console.log('[REGISTER] Password hashed');
        const user = yield prisma_1.default.user.create({
            data: { email, password: hashed, firstName, lastName, role }
        });
        console.log('[REGISTER] User created:', user);
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        const { password: _ } = user, userData = __rest(user, ["password"]);
        res.json({ user: userData, token });
        console.log('[REGISTER] Registration successful, response sent');
        console.log('[REGISTER] --- FIN (éxito) ---');
    }
    catch (error) {
        console.error('[REGISTER] Error in registration:', error);
        res.status(500).json({ error: 'Error en registro' });
        console.log('[REGISTER] --- FIN (error) ---');
    }
}));
exports.default = router;
