import { NextFunction } from "express";
import { ValidationError } from "../../../../packages/error-handler";
import { checkOtpRestricksion, sendOtp, trackOtpRequest, validRegestrationData } from "../utils/auth.helper"


export const userRegestration = async (req: Request , res:Response, next:NextFunction) => {

    try {
        validRegestrationData(req.body, "user") 

    const {name , email} = req.body;

    const existinUser = await prismadb.users.findUnique({where : email});

    if(existinUser) {
        throw next(new ValidationError("User is already made with this email")) 
    }
       
    await checkOtpRestricksion(email, next)

    await trackOtpRequest(email, next)

    await sendOtp(name, email, "user-activation-mail")

    res.status(200).json({
        message: "OTP sent to email. plese veruify your account"
    })
    } catch (error) {
        next(error)
    }
}





