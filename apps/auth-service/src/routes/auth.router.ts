import express , { Router } from "express";
import { userRegestration } from "../controller/auth.controller";

const router : Router = express.Router()


router.post("/user-regestration", userRegestration);

export default router;