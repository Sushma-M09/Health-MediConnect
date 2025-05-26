const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

router.get('/profile/:role/:id', profileController.getProfile);
router.put('/profile/:role/:id', profileController.updateProfile);

module.exports = router;
