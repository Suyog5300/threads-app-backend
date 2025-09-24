import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";

async function init() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.use(express.json());
 
 // Create GraphQL server
  const gqlServer = new ApolloServer({
    typeDefs: `
      type Query {
        hello: String
        say (name: String): String
      }
    `,
    resolvers: {
        Query: {
            hello: () => "Hello, world!",
            say: (_, { name }: { name: String }) => `Hello, ${name}! How are you?`,
        }
    },
  });

  await gqlServer.start();

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.use("/graphql", expressMiddleware(gqlServer));

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

init();
