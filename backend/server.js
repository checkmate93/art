import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// =======================
// 🏠 HEALTH CHECK ROUTE
// =======================
app.get("/", (req, res) => {
    res.send("🎨 Art Curator AI backend is running");
});

// =======================
// 🤖 AI ROUTE
// =======================
app.post("/api/groq", async (req, res) => {
    const { title, artist } = req.body;

    if (!title || !artist) {
        return res.status(400).json({
            error: "Missing title or artist"
        });
    }

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: `
Είσαι κορυφαίος ιστορικός τέχνης.
Δεν γράφεις γενικότητες.
Πάντα:
1. Fun Fact πρώτο
2. Ανάλυση έργου
3. Context εποχής
`
                    },
                    {
                        role: "user",
                        content: `
Έργο: "${title}"
Καλλιτέχνης: "${artist}"

Δομή απάντησης:
🎯 Fun Fact:
🎨 Ανάλυση:
🧠 Context:

150-220 λέξεις, συγκεκριμένα στοιχεία.
`
                    }
                ],
                max_tokens: 900,
                temperature: 0.85
            })
        });

        const data = await response.json();

        // =======================
        // ❗ SAFE RESPONSE CHECK
        // =======================
        if (!data || !data.choices || !data.choices[0]) {
            console.error("Groq error response:", data);
            return res.status(500).json({
                error: "Invalid AI response",
                raw: data
            });
        }

        res.json(data);

    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({
            error: "AI request failed"
        });
    }
});

// =======================
// 🚀 START SERVER
// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
