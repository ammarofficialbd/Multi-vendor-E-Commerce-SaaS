import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../../../../packages/error-handler";
import {
  checkOtpRestricksion,
  sendOtp,
  trackOtpRequest,
  validRegestrationData,
} from "../utils/auth.helper";
import { prismadb } from "../../../../packages/libs/prisma/index"; // make sure you import prisma correctly

export const userRegestration = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // ✅ validate input
    validRegestrationData(req.body, "user");

    // ✅ correctly extract fields from req.body
    const { name, email } = req.body as { name: string; email: string };

    // ✅ fix prisma query (need object with `where` key)
    const existingUser = await prismadb.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ValidationError("User already exists with this email");
    }

    await checkOtpRestricksion(email, next);
    await trackOtpRequest(email, next);
    await sendOtp(name, email, "user-activation-mail");

    res.status(200).json({
      message: "OTP sent to email. Please verify your account",
    });
  } catch (error) {
    next(error);
  }
};
