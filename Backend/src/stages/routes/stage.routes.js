const express = require('express');
const router = express.Router();
const StageController = require('../controllers/stage.controller');
const Stage01Controller = require('../controllers/stage01.controller');
const Stage02Controller = require('../controllers/stage02.controller');
const Stage04Controller = require('../controllers/stage04.controller');
const Stage06Controller = require('../controllers/stage06.controller');
const Stage07Controller = require('../controllers/stage07.controller');
const Stage08Controller = require('../controllers/stage08.controller');
const Stage09Controller = require('../controllers/stage09.controller');
const Stage10Controller = require('../controllers/stage10.controller');
const Stage11Controller = require('../controllers/stage11.controller');

const authMiddleware = require('../../middleware/auth.middleware');

// Public USB port scanner endpoint
router.get('/jig/usb-ports', StageController.getUsbPorts);
router.post('/jig/usb-ports', StageController.getUsbPorts);

router.use(authMiddleware);

// Stage execution & Jig endpoints
router.post('/start', StageController.startStage);
router.post('/jig/connect', StageController.jigConnect);
router.post('/jig/run-test', StageController.jigRunTest);
router.post('/jig/save-db', StageController.jigSaveDb);

// Individual Stage Endpoints
router.post('/stage01/run', Stage01Controller.run);
router.post('/stage02/run', Stage02Controller.run);
router.post('/stage04/run', Stage04Controller.run);
router.post('/stage06/run', Stage06Controller.run);
router.post('/stage07/run', Stage07Controller.run);
router.post('/stage08/run', Stage08Controller.run);
router.post('/stage09/run', Stage09Controller.run);
router.post('/stage10/run', Stage10Controller.run);
router.post('/stage11/run', Stage11Controller.run);

// Stage Management Endpoints
router.get('/management', StageController.getStageManagement);
router.post('/management', StageController.createStage);
router.put('/management/:id', StageController.updateStage);
router.delete('/management/:id', StageController.deleteStage);

module.exports = router;
