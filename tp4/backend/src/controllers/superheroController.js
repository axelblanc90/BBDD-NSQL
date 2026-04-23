const Superhero = require('../models/Superhero');

// Get all superheroes (optional house filter)
exports.getSuperheroes = async (req, res) => {
  try {
    const { house } = req.query;
    let filter = {};
    if (house) {
      filter.house = { $regex: new RegExp(`^${house}$`, 'i') };
    }
    const superheroes = await Superhero.find(filter);
    res.json(superheroes);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving superheroes', error });
  }
};

// Get a single superhero by ID
exports.getSuperheroById = async (req, res) => {
  try {
    const superhero = await Superhero.findById(req.params.id);
    if (!superhero) return res.status(404).json({ message: 'Superhero not found' });
    res.json(superhero);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving superhero', error });
  }
};

// Create a new superhero
exports.createSuperhero = async (req, res) => {
  try {
    const newSuperhero = new Superhero(req.body);
    const savedSuperhero = await newSuperhero.save();
    res.status(201).json(savedSuperhero);
  } catch (error) {
    res.status(400).json({ message: 'Error creating superhero', error });
  }
};

// Update an existing superhero
exports.updateSuperhero = async (req, res) => {
  try {
    const updatedSuperhero = await Superhero.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!updatedSuperhero) return res.status(404).json({ message: 'Superhero not found' });
    res.json(updatedSuperhero);
  } catch (error) {
    res.status(400).json({ message: 'Error updating superhero', error });
  }
};

// Delete a superhero
exports.deleteSuperhero = async (req, res) => {
  try {
    const deletedSuperhero = await Superhero.findByIdAndDelete(req.params.id);
    if (!deletedSuperhero) return res.status(404).json({ message: 'Superhero not found' });
    res.json({ message: 'Superhero deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting superhero', error });
  }
};
