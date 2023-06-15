import express, { Request, Response } from "express";

const app = express();

app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({ hello: "World" });
});

app.listen(8080, () => console.log("Servidor rodando na porta *:8080"));
