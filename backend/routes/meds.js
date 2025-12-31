  const express = require("express");
const router = express.Router();

const Medicine = require("../models/Medicine");
const auth = require("../middleware/authMiddleware");
const Med = require("../models/Medicine");
const authMiddleware = require("../middleware/authMiddleware");


// ➕ Add medicine (protected)
router.post("/", auth, async (req, res) => {
  try {
    const med = new Medicine({
      user: req.user._id,
      name: req.body.name,
      dosage: req.body.dosage,
      time: req.body.time,
      frequency: req.body.frequency,
      notes: req.body.notes,
      caretakerEmail: req.body.caretakerEmail
    });

    await med.save();
    res.status(201).json(med);
  } catch (err) {
    res.status(500).json({ message: "Failed to add medicine" });
  }
});

// 📄 Get all medicines for logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const meds = await Medicine.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(meds);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch medicines" });
  }
});

// ❌ Delete medicine
router.delete("/:id", auth, async (req, res) => {
  try {
    await Medicine.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    res.json({ message: "Medicine deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete medicine" });
  }
});

module.exports = router;
// MARK MEDICINE AS TAKEN
router.post("/:id/take", authMiddleware, async (req, res) => {
  try {
    const med = await Med.findById(req.params.id);

    if (!med) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    const now = new Date();

    // ensure array exists
    if (!med.takenRecords) {
      med.takenRecords = [];
    }

    // add taken record
    med.takenRecords.push({
      dateISO: now.toISOString(),
      time: now.toTimeString().slice(0, 5),
    });

    // reset missed alert
    med.alertSentToday = null;

    await med.save();

    res.json({ message: "Medicine marked as taken" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to mark medicine as taken" });
  }
});

