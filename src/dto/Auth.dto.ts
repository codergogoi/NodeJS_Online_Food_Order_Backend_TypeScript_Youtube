import { VendorPayload } from './Vandor.dto'
import { CustomerPayload } from './Customer.dto';

export type AuthPayload = VendorPayload | CustomerPayload;