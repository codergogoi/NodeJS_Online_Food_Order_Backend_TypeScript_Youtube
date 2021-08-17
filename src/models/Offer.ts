import mongoose, { Schema, Document, Model } from 'mongoose';


export interface OfferDoc extends Document {
   offerType: string;
   vendors: [any];
   title: string;
   description: string;
   minValue: number;
   offerAmount: number;
   startValidity: Date;
   endValidity: Date;
   promocode: string;
   promoType: string;
   bank: [any];
   bins: [any];
   pincode: string;
   isActive: boolean;
}


const OfferSchema = new Schema({

    offerType: {type: String, require: true},
    vendors: [
        {type: Schema.Types.ObjectId, ref: 'vendor'},
    ],
    title: {type: String, require: true},
    description: {type: String},
    minValue: {type: Number, require: true},
    offerAmount: {type: Number, require: true},
    startValidity: Date,
    endValidity: Date,
    promocode: {type: String, require: true},
    promoType: {type: String, require: true},
    bank: [{ type: String}],
    bins: [{ type: Number}],
    pincode: {type: String, require: true},
    isActive: Boolean
  
},{
    toJSON: {
        transform(doc, ret){
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;

        }
    },
    timestamps: true
});


const Offer = mongoose.model<OfferDoc>('offer', OfferSchema);

export { Offer }