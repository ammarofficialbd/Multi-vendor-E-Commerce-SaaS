import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Auth Service API",
    description: "Auto generated swagger docx",
    version: "1.0.0",
  },
  host: "localhost:6001",
  schemes: ["http"], // Use "http" if local
};

const outputFile = "./swagger-output.json";
const endpointFiles = ["./routes/auth.router.ts"];

swaggerAutogen(outputFile, endpointFiles, doc);
