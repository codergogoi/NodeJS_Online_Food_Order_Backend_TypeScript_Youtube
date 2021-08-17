import express, { Request, Response, NextFunction } from 'express';
import {
    DeliveryLogin,
    DeliverySignUp, EditDeliveryProfile, GetDeliveryProfile, UpdateDeliveryUserStatus
} from '../controllers';
import { Authenticate } from '../middleware';
import { Offer } from '../models/Offer';

const router = express.Router();

/* ------------------- Signup / Create Customer --------------------- */
router.post('/signup', DeliverySignUp)

/* ------------------- Login --------------------- */
router.post('/login', DeliveryLogin)

/* ------------------- Authentication --------------------- */
router.use(Authenticate);

/* ------------------- Change Service Status --------------------- */
router.put('/change-status', UpdateDeliveryUserStatus);

/* ------------------- Profile --------------------- */
router.get('/profile', GetDeliveryProfile)
router.patch('/profile', EditDeliveryProfile)


export { router as DeliveryRoute}