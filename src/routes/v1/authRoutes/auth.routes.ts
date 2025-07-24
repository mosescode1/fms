import Router from 'express';
import  AuthController  from '../../../controller/v1/auth/auth.controller';

const router = Router();
// authentication system
router.post('/register', AuthController.adminRegistration);
router.post('/login', AuthController.adminLogin );
router.post('/member/login', AuthController.userLogin);
router.post('/logout', AuthController.logout);


export default router;