
import {  Request, Response ,NextFunction } from 'express';
import { CreateFoodInput, CreateOfferInputs, EditVendorInput, VendorLoginInput } from '../dto'
import { Food } from '../models';
import { Offer } from '../models/Offer';
import { Order } from '../models/Order';
import { GenerateSignature, ValidatePassword } from '../utility';
import { FindVendor } from './AdminController';


export const VendorLogin = async (req: Request,res: Response, next: NextFunction) => {

    const { email, password } = <VendorLoginInput>req.body;

    const existingUser = await FindVendor('', email);

    if(existingUser !== null){

        const validation = await ValidatePassword(password, existingUser.password, existingUser.salt);
        if(validation){

            const signature = await GenerateSignature({
                _id: existingUser._id,
                email: existingUser.email,
                name: existingUser.name
            })
            return res.json(signature);
        }
    }

    return res.json({'message': 'Login credential is not valid'})

}



export const GetVendorProfile = async (req: Request,res: Response, next: NextFunction) => {

    const user = req.user;
     
    if(user){

       const existingVendor = await FindVendor(user._id);
       return res.json(existingVendor);
    }

    return res.json({'message': 'vendor Information Not Found'})
}



export const UpdateVendorProfile = async (req: Request,res: Response, next: NextFunction) => {

    const user = req.user;

    const { foodType, name, address, phone} = <EditVendorInput>req.body;
     
    if(user){

       const existingVendor = await FindVendor(user._id);

       if(existingVendor !== null){

            existingVendor.name = name;
            existingVendor.address;
            existingVendor.phone = phone;
            existingVendor.foodType = foodType;
            const saveResult = await existingVendor.save();

            return res.json(saveResult);
       }

    }
    return res.json({'message': 'Unable to Update vendor profile '})

}



export const UpdateVendorCoverImage = async (req: Request,res: Response, next: NextFunction) => {

    const user = req.user;

     if(user){

       const vendor = await FindVendor(user._id);

       if(vendor !== null){

            const files = req.files as [Express.Multer.File];

            const images = files.map((file: Express.Multer.File) => file.filename);

            vendor.coverImages.push(...images);

            const saveResult = await vendor.save();
            
            return res.json(saveResult);
       }

    }
    return res.json({'message': 'Unable to Update vendor profile '})

}

export const UpdateVendorService = async (req: Request,res: Response, next: NextFunction) => {

    const user = req.user;

    const { lat, lng} = req.body;
     
    if(user){

       const existingVendor = await FindVendor(user._id);

       if(existingVendor !== null){

            existingVendor.serviceAvailable = !existingVendor.serviceAvailable;
            if(lat && lng){
                existingVendor.lat = lat;
                existingVendor.lng = lng;
            }
            const saveResult = await existingVendor.save();

            return res.json(saveResult);
       }

    }
    return res.json({'message': 'Unable to Update vendor profile '})

}


export const AddFood = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    const { name, description, category, foodType, readyTime, price } = <CreateFoodInput>req.body;
     
    if(user){

       const vendor = await FindVendor(user._id);

       if(vendor !== null){

            const files = req.files as [Express.Multer.File];

            const images = files.map((file: Express.Multer.File) => file.filename);
            
            const food = await Food.create({
                vendorId: vendor._id,
                name: name,
                description: description,
                category: category,
                price: price,
                rating: 0,
                readyTime: readyTime,
                foodType: foodType,
                images: images
            })
            
            vendor.foods.push(food);
            const result = await vendor.save();
            return res.json(result);
       }

    }
    return res.json({'message': 'Unable to Update vendor profile '})
}

export const GetFoods = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
 
    if(user){

       const foods = await Food.find({ vendorId: user._id});

       if(foods !== null){
            return res.json(foods);
       }

    }
    return res.json({'message': 'Foods not found!'})
}


export const GetCurrentOrders = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;
    
    if(user){

        const orders = await Order.find({ vendorId: user._id}).populate('items.food');

        if(orders != null){
            return res.status(200).json(orders);
        }
    }

    return res.json({ message: 'Orders Not found'});
}

export const GetOrderDetails = async (req: Request, res: Response, next: NextFunction) => {

    const orderId = req.params.id;
    
    if(orderId){

        const order = await Order.findById(orderId).populate('items.food');

        if(order != null){
            return res.status(200).json(order);
        }
    }

    return res.json({ message: 'Order Not found'});
}

export const ProcessOrder = async (req: Request, res: Response, next: NextFunction) => {

    const orderId = req.params.id;

    const { status, remarks, time } = req.body;

    
    if(orderId){

        const order = await Order.findById(orderId).populate('food');

        order.orderStatus = status;
        order.remarks = remarks;
        if(time){
            order.readyTime = time;
        }

        const orderResult = await order.save();

        if(orderResult != null){
            return res.status(200).json(orderResult);
        }
    }

    return res.json({ message: 'Unable to process order'});
}

export const GetOffers = async (req: Request, res: Response, next: NextFunction) => {


    const user = req.user;

    if(user){
        let currentOffer = Array();

        const offers = await Offer.find().populate('vendors');

        if(offers){


            offers.map(item => {

                if(item.vendors){
                    item.vendors.map(vendor => {
                        if(vendor._id.toString() === user._id){
                            currentOffer.push(item);
                        }
                    })
                }

                if(item.offerType === "GENERIC"){
                    currentOffer.push(item)
                }

            })

        }

        return res.status(200).json(currentOffer);

    }

    return res.json({ message: 'Offers Not available'});
}


export const AddOffer = async (req: Request, res: Response, next: NextFunction) => {


    const user = req.user;

    if(user){
        const { title, description, offerType, offerAmount, pincode,
        promocode, promoType, startValidity, endValidity, bank, bins, minValue, isActive } = <CreateOfferInputs>req.body;

        const vendor = await FindVendor(user._id);

        if(vendor){

            const offer = await Offer.create({
                title,
                description,
                offerType,
                offerAmount,
                pincode,
                promoType,
                startValidity,
                endValidity,
                bank,
                isActive,
                minValue,
                vendor:[vendor]
            })

            console.log(offer);

            return res.status(200).json(offer);

        }

    }

    return res.json({ message: 'Unable to add Offer!'});

    

}

export const EditOffer = async (req: Request, res: Response, next: NextFunction) => {


    const user = req.user;
    const offerId = req.params.id;

    if(user){
        const { title, description, offerType, offerAmount, pincode,
        promocode, promoType, startValidity, endValidity, bank, bins, minValue, isActive } = <CreateOfferInputs>req.body;

        const currentOffer = await Offer.findById(offerId);

        if(currentOffer){

            const vendor = await FindVendor(user._id);

            if(vendor){
           
                currentOffer.title = title,
                currentOffer.description = description,
                currentOffer.offerType = offerType,
                currentOffer.offerAmount = offerAmount,
                currentOffer.pincode = pincode,
                currentOffer.promoType = promoType,
                currentOffer.startValidity = startValidity,
                currentOffer.endValidity = endValidity,
                currentOffer.bank = bank,
                currentOffer.isActive = isActive,
                currentOffer.minValue = minValue;

                const result = await currentOffer.save();

                return res.status(200).json(result);
            }
            
        }

    }

    return res.json({ message: 'Unable to add Offer!'});    

}


