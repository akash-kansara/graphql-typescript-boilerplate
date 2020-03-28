import { Router } from 'express';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as expressRequestId from 'express-request-id';

const router: Router = Router();

router.use(expressRequestId.default());

router.use(cookieParser.default(''));

router.use(cors.default({ origin: true, credentials: true }));

export default router;