const mongoose = require('mongoose');

const superheroSchema = new mongoose.Schema({
  name: { type: String, required: true },
  character_name: { type: String }, // optional real name
  year: { type: Number, required: true },
  house: { type: String, required: true, enum: ['Marvel', 'DC'] },
  biography: { type: String, required: true },
  equipment: { type: String }, // optional
  images: [{ type: String }] // array of image URLs, required to have at least one but checked in logic
}, { timestamps: true });

module.exports = mongoose.model('Superhero', superheroSchema);
