const mongoose = require("mongoose");

const takenRecordSchema = new mongoose.Schema({
  dateISO: { type: String },
  time: { type: String }
});

const medicineSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  name: { type: String, required: true },
  dosage: { type: String },
  time: { type: String, required: true }, // "HH:MM"
  frequency: { type: String }, // daily, alternate, etc.
  notes: { type: String },

  caretakerEmail: { type: String },

  takenRecords: [takenRecordSchema],

  alertSentDate: { type: String } // prevent duplicate emails per day
}, { timestamps: true });

module.exports = mongoose.model("Medicine", medicineSchema);
