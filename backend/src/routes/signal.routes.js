import { Router } from 'express';
import * as ctrl from '../controllers/signal.controller.js';

const router = Router();

router.post('/', ctrl.create);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.get('/:id/status', ctrl.getStatus);
router.delete('/:id', ctrl.remove);

export default router;
