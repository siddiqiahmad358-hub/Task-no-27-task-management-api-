
import jwt from "jsonwebtoken";

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({
            message: "Access denied. Please provide a token."
        });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer" || !parts[1]) {
        return res.status(401).json({
            message: "Invalid authorization format. Use Bearer token."
        });
    }

    const token = parts[1];

    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
        if (error) {
            return res.status(403).json({
                message: "Invalid or expired token."
            });
        }

        req.user = user;
        next();
    });
}

export default authenticateToken;