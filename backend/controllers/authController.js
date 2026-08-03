import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (userId) => {
    return jwt.sign(
        {id: userId}, 
        process.env.JWT_SECRET, 
        {expiresIn: process.env.JWT_EXPIRES_IN || "7d",}
    );
};

export const registerUser = async (req, res) => {
    try {
        const {username, email, password} = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Please provide username, email, and password" })
        }

        const userExists = await User.findOne({ $or: [{ email },{ username }] });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({ username, email, password });
        res.status(201).json({ 
            _id: user._id, 
            username: user.username, 
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: "Server error during registration" });
    }
};

export const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password" });
        }

        const user = await User.findOne({email}).select("+password");
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: "Server error during login" });
    }
};

export const getMe = async (req, res) => {
    res.json(req.user);
};