"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatController_1 = require("../controllers/chatController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.post('/send', chatController_1.sendMessage);
router.get('/test-connection', chatController_1.testAIConnection);
exports.default = router;
//# sourceMappingURL=chat.js.map