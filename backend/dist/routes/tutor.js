"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tutor_1 = require("../controllers/tutor");
const router = (0, express_1.Router)();
// Public route to search for tutors
router.get('/search', tutor_1.searchTutors);
exports.default = router;
