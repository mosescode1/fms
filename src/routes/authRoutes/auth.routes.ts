import Router from 'express';
import  AuthController  from '../../controller/auth/auth.controller';

const router = Router();

router.post('/login', AuthController.adminLogin );
router.post('/member/login', AuthController.userLogin);
router.post('/register', AuthController.adminRegistration);
router.post('/logout', AuthController.logout);


export default router;