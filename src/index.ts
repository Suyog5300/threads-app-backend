import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { PrismaClient } from "@prisma/client";
import createGqlServer from "./graphql/index.js";
import { User } from "./graphql/user/index.js";
import UserService from "./services/user.js";
// import { createGqlServer } from "../src/graphql/index.js";

// Create Prisma client instance
const prisma = new PrismaClient();

async function init() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Create GraphQL server

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  // const gqlServer = ;
  app.use(
    "/graphql",
    expressMiddleware(await createGqlServer(), {
      context: async ({ req }) => {
        const token = req.headers['token'];
        try {
          const user = UserService.decodeToken(token as string);
          return { user };
        } catch (error) {
          return { user: null };
        }
      },
    })
  );

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

init();