import { db } from "../db.js";
import bcrypt from "bcrypt";

export const updateTutorInfo = async (req,res) => {
    const { tutor_id } = req.params;
    const { 
        full_name, 
        email, 
        location_postal, 
        tutor_password,
    } = req.body;

    const fields = [];
    const values = [];

    // Name update
    if (full_name) {
        fields.push("full_name = ?");
        values.push(full_name);
    }

    // Email update
    if (email) {
        fields.push("email = ?");
        values.push(email);
    }

    // Location update
    if (location_postal) {
        const postalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
        if (!postalRegex.test(location_postal)) {
            return res.status(400).json({
                error: "Invalid Canadian postal code format (expected A1A 1A1)",
            });
        }
        fields.push("location_postal = ?");
        values.push(location_postal);
    }
    // Does not allow for rank change

    // Allow password change
    if (tutor_password){
        const hashedPassword = await bcrypt.hash(tutor_password, 10);
        fields.push("tutor_password = ?");
        values.push(hashedPassword);
    }

    if (fields.length === 0) {
        return res.status(400).json({ error: "No fields to update"});
    }

    values.push(tutor_id);

    try {
        const [result] = await db.query(
            `UPDATE tutor SET ${fields.join(", ")} WHERE tutor_id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({error: "Tutor not found"});
        }

        res.json({
            success: true,
            message: "Tutor information updated successfully",
        });
    }catch (err) {
        if(err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({error: "Email already exists" });
        }
        console.error("updateTutorInfo error:", err);
        res.status(500).json({ error: err.message });
    }
};