import Router from 'express';
import  AuthController  from '../../controller/auth/auth.controller';

const router = Router();

router.post('/login', AuthController.login );
router.post('/register', AuthController.register);
router.post('/logout', AuthController.logout);


export default router;