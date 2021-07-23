import express, { Request, Response, NextFunction } from 'express';
import { VendorLogin } from '../controllers';
import { Authenticate } from '../middleware';

const router = express.Router();

router.get('/login', VendorLogin);

router.use(Authenticate)
router.get('/profile', VendorLogin);
router.patch('/profile', VendorLogin);
router.patch('/service', VendorLogin);


router.get('/', (req: Request, res: Response, next: NextFunction) => {


res.json({ message: "Hello from Vandor"})

})



export { router as VandorRoute };