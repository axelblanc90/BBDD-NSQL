const express = require('express');
const router = express.Router();
const superheroController = require('../controllers/superheroController');

// Routes
router.get('/', superheroController.getSuperheroes);
router.get('/:id', superheroController.getSuperheroById);
router.post('/', superheroController.createSuperhero);
router.put('/:id', superheroController.updateSuperhero);
router.delete('/:id', superheroController.deleteSuperhero);

module.exports = router;
