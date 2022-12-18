/* ------------------- Email --------------------- */

/* ------------------- Notification --------------------- */

/* ------------------- OTP --------------------- */

export const GenerateOtp = () => {

    const otp = Math.floor(10000 + Math.random() * 900000);
    let expiry = new Date()
    expiry.setTime(new Date().getTime() + (30 * 60 * 1000));

    return {otp, expiry};
}

export const onRequestOTP = async(otp: number, toPhoneNumber: string) => {

    try {
        const accountSid = "Your Account SID from TWILIO DASHBOARD";
        const authToken = "YOUR AUTH TOKEN AS I SAID ON VIDEO";
        const client = require('twilio')(accountSid, authToken);
    
        const response = await client.message.create({
            body: `Your OTP is ${otp}`,
            from: 'Your TWILIO PHONE NUMBER YOU CAN GET IT FROM YOUR DASHBOARD',
            to: `recipient_countrycode${toPhoneNumber}` // recipient phone number // Add country before the number
        })
    
        return response;
    } catch (error){
        return false
    }
    
}

/* ------------------- Payment --------------------- */