import express, { Request, Response, NextFunction } from 'express';
import { CreateVandor, GetDeliveryUsers, GetTransactionById, GetTransactions, GetVandorByID, GetVanndors, VerifyDeliveryUser } from '../controllers';


const router = express.Router();

router.post('/vendor', CreateVandor)

router.get('/vendors', GetVanndors)
router.get('/vendor/:id', GetVandorByID)


router.get('/transactions', GetTransactions)
router.get('/transaction/:id', GetTransactionById)

router.put('/delivery/verify', VerifyDeliveryUser)
router.get('/delivery/users', GetDeliveryUsers);


router.get('/', (req: Request, res: Response, next: NextFunction) => {


        res.json({ message: "Hello from  Admin"})

})



export { router as AdminRoute };