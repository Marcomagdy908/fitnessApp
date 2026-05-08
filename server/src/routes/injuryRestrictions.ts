import { Router } from 'express';
import { getInjuryRestrictions, getInjuryRestrictionByType } from '../controllers/injuryRestrictionController';

const router = Router();

router.get('/', getInjuryRestrictions);
router.get('/:type', getInjuryRestrictionByType);

export default router;
