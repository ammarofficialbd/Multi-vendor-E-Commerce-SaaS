import express from 'express';
import cors from "cors";
import { errorHandler } from '../../../packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
  origin : ['http://localhost:3000'],
  allowedHeaders: ["Authorization" , "Content-Type" ],
  credentials: true,
}))

app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send({ 'message': 'Hello API'});
});

app.use(errorHandler)


const port = process.env.PORT || 6001;

const database = process.env.DATABASE_URL

console.log(database)

const server = app.listen(port, () => {
    console.log(`[ Auth Service is Running ] http://localhost:${port} - ${database}`);
});

server.on("error", (err) => {
    console.log("Server error", err);
    
})