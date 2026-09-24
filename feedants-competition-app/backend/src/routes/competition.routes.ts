import { Router } from 'express';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import {
  getCompetition, getCompetitionSchemas,
  register, registerSchemas,
  submit, submitSchemas,
} from '../controllers/competition.controller';

const router = Router();

router.get('/:id', validate(getCompetitionSchemas), asyncHandler(getCompetition));
router.post('/:id/register', validate(registerSchemas), asyncHandler(register));
router.post('/:id/submit', validate(submitSchemas), asyncHandler(submit));

export default router;
