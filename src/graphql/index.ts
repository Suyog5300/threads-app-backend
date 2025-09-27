import { ApolloServer } from "@apollo/server";
import { PrismaClient } from "@prisma/client";
import { User } from "./user/index.js";

const prisma = new PrismaClient();

async function createGqlServer() {
  const gqlServer = new ApolloServer({
    typeDefs: `
      ${User.typeDefs}
      type Query {
    ${User.queries}
      }
      type Mutation {
    ${User.mutations}
      }
    `,
    resolvers: {
      Query: {
        ...User.resolvers.queries,
      },
      Mutation: {
        ...User.resolvers.mutations,
      },
    },
  });

  await gqlServer.start();

  return gqlServer;
}

export default createGqlServer;
