const express = require('express');

const itemController = require('../controllers/itemController');
const upload = require('../middlewares/upload');
const { valCheck } = require('../middlewares/validation');
const { protect } = require('../middlewares/auth');
const router = express.Router();

router.route('/plainText').post(protect, itemController.createText);
router.route('/plainText/:id').get(valCheck, itemController.getText);

router.route('/file').post(protect, upload.single('file'), itemController.createFile);
router.route('/file/:id').get(valCheck, itemController.getFile);

router.route('/my-links').get(protect, itemController.getMyLinks);
router.route('/my-links/:id').patch(protect, itemController.updateMyLink).delete(protect, itemController.deleteMyLink);

module.exports = router;
