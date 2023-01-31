import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import express, { Request, Response, NextFunction } from 'express';
import {
    CartItem,
    CreateCustomerInput,
    CreateDeliveryUserInput,
    EditCustomerProfileInput,
    OrderInputs,
    UserLoginInput
} from '../dto';
import {Customer, DeliveryUser, Food, Vendor} from '../models';
import { Offer } from '../models/Offer';
import { Order } from '../models/Order';
import { Transaction } from '../models/Transaction';
import { GenerateOtp, GeneratePassword, GenerateSalt, GenerateSignature, onRequestOTP, ValidatePassword } from '../utility';

export const DeliverySignUp = async (req: Request, res: Response, next: NextFunction) => {

    const deliveryUserInputs = plainToClass(CreateDeliveryUserInput, req.body);

    const validationError = await validate(deliveryUserInputs, {validationError: { target: true}})

    if(validationError.length > 0){
        return res.status(400).json(validationError);
    }

    const { email, phone, password, address, firstName, lastName, pincode } = deliveryUserInputs;

    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);

     const existingDeliveryUser =  await DeliveryUser.findOne({ email: email});

    if(existingDeliveryUser !== null){
        return res.status(400).json({message: 'A Delivery User exist with the provided email ID!'});
    }

    const result = await DeliveryUser.create({
        email: email,
        password: userPassword,
        salt: salt,
        phone: phone,
        firstName: firstName,
        lastName: lastName,
        address: address,
        pincode: pincode,
        verified: false,
        lat: 0,
        lng: 0,
        
    })

    if(result){
         
        //Generate the Signature
        const signature = await GenerateSignature({
            _id: result._id,
            email: result.email,
            verified: result.verified
        })
        // Send the result
        return res.status(201).json({signature, verified: result.verified, email: result.email})

    }

    return res.status(400).json({ msg: 'Error while creating Delivery user'});


}

export const DeliveryLogin = async (req: Request, res: Response, next: NextFunction) => {


    const loginInputs = plainToClass(UserLoginInput, req.body);

    const validationError = await validate(loginInputs, {validationError: { target: true}})

    if(validationError.length > 0){
        return res.status(400).json(validationError);
    }

    const { email, password } = loginInputs;

    const deliveryUser = await DeliveryUser.findOne({ email: email});
    if(deliveryUser){
        const validation = await ValidatePassword(password, deliveryUser.password, deliveryUser.salt);

        if(validation){

            const signature = GenerateSignature({
                _id: deliveryUser._id,
                email: deliveryUser.email,
                verified: deliveryUser.verified
            })

            return res.status(200).json({
                signature,
                email: deliveryUser.email,
                verified: deliveryUser.verified
            })
        }
    }

    return res.json({ msg: 'Error Login'});

}

export const GetDeliveryProfile = async (req: Request, res: Response, next: NextFunction) => {

    const deliveryUser = req.user;

    if(deliveryUser){

        const profile =  await DeliveryUser.findById(deliveryUser._id);

        if(profile){

            return res.status(201).json(profile);
        }

    }
    return res.status(400).json({ msg: 'Error while Fetching Profile'});

}

export const EditDeliveryProfile = async (req: Request, res: Response, next: NextFunction) => {


    const deliveryUser = req.user;

    const customerInputs = plainToClass(EditCustomerProfileInput, req.body);

    const validationError = await validate(customerInputs, {validationError: { target: true}})

    if(validationError.length > 0){
        return res.status(400).json(validationError);
    }

    const { firstName, lastName, address } = customerInputs;

    if(deliveryUser){

        const profile =  await DeliveryUser.findById(deliveryUser._id);

        if(profile){
            profile.firstName = firstName;
            profile.lastName = lastName;
            profile.address = address;
            const result = await profile.save()

            return res.status(201).json(result);
        }

    }
    return res.status(400).json({ msg: 'Error while Updating Profile'});

}

/* ------------------- Delivery Notification --------------------- */


export const UpdateDeliveryUserStatus = async (req: Request, res: Response, next: NextFunction) => {

    const deliveryUser = req.user;
    
    if(deliveryUser){
        
        const { lat, lng } = req.body;

        const profile = await DeliveryUser.findById(deliveryUser._id);

        if(profile){
            
            if(lat && lng){
                profile.lat = lat;
                profile.lng = lng;
            }

            profile.isAvailable = !profile.isAvailable;

            const result = await profile.save();

            return res.status(201).json(result);
        }

    }
    return res.status(400).json({ msg: 'Error while Updating Profile'});

}