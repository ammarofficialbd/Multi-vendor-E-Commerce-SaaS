import crypto from "crypto";

import { ValidationError } from "../../../../packages/error-handler";
import { redis } from "../../../../packages/libs/redis";
import { sendEmail } from "./send-mail";
import { NextFunction } from "express";

// throw and return er moddhe differntiate gulo ki ki ?
//Ans:

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validRegestrationData = (
  data: any,
  userType: "user" | "seller"
) => {
  const { name, email, password, phone_number, country } = data;

  if (
    !name ||
    !email ||
    password ||
    (userType === "seller" && (!phone_number || !country))
  ) {
    throw new ValidationError(`Mising required fields!`);
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError("Inavlid email format");
  }
};

export const checkOtpRestricksion = async (
  email: string,
  next: NextFunction
) => {
  if (await redis.get(`otp_lock: ${email}`))
    return next(
      new ValidationError(
        "Account locked due to multiple attempts! Try again after 30 mInutes"
      )
    );

  if (await redis.get(`otp_spam_lock: ${email}`))
    return next(
      new ValidationError(
        "Too many OTP request! Please wait 1 hour for before sending requestign again"
      )
    );

  if (await redis.get(`otp_cooldown: ${email}`)) {
    return next(
      new ValidationError("please wiat 1 minute before requesting a new otp!")
    );
  }
};

export const trackOtpRequest = async (email: string, next: NextFunction) => {
  const otpRequestKey = `otp_request_count: ${email}`;

  let otpRequests = parseInt((await redis.get(otpRequestKey)) || "0");

  if (otpRequests >= 2) {
    await redis.set(`otp_spam_lock: ${email}`, "locked", "EX", 3600); //lock for 1 hour

    return next(
      new ValidationError(
        "Too many OTP request! Please wait 1 hour for before sending requestign again"
      )
    );
  }

  await redis.set(otpRequestKey, otpRequests + 1, "EX", 3600); //track request for 1 hour
};

export const sendOtp = async (
  name: string,
  email: string,
  template: string
) => {
  const otp = crypto.randomInt(1000, 9999).toString();

  await sendEmail(email, "verify your Email", template, { name, otp });

  await redis.set(`otp : ${email}`, otp, "EX", 300);

  await redis.set(`otp_countdown: ${email}`, "true", "EX", 60);
};
