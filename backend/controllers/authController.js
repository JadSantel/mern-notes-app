import User from "../models/User.js";

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
        res.status(201).json({ _id: user._id, username: user.username, email: user.email });
    } catch (error) {
        res.status(500).json({ message: "Server error during registration" });
    }
};