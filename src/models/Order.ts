import mongoose, { Schema, Document, Model } from 'mongoose';


export interface OrderDoc extends Document {

    orderId: string;
    vendorId: string;
    items: [any];
    totalAmount: number;
    paidAmount: number;
    orderDate: Date;
    orderStatus: string;
    remarks: string;
    deliveryId: string;
    readyTime: number;
}


const OrderSchema = new Schema({
    orderId: {type: String, require: true},
    vendorId: {type: String, require: true},
    items: [
        {
            food: {type: Schema.Types.ObjectId, ref: "food", require: true},
            unit: { type: Number, require: true}
        }
    ],
    totalAmount: {type: Number, require: true},
    paidAmount: {type: Number, require: true},
    orderDate: {type: Date },
    orderStatus: {type: String},
    remarks: {type: String},
    deliveryId: {type: String},
    readyTime:{type: Number},
     
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


const Order = mongoose.model<OrderDoc>('order', OrderSchema);

export { Order }