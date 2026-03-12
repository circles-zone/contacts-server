import { ApolloServer, gql } from "apollo-server";
import request from "supertest";

describe("ApolloServer", () => {
  let server: ApolloServer;

  beforeAll(() => {
    const typeDefs = gql`
      type Query {
        hello: String
      }
    `;
    const resolvers = {
      Query: {
        hello: () => "Hello from Apollo GraphQL!",
      },
    };
    server = new ApolloServer({ typeDefs, resolvers });
  });

  it("should respond to hello query", async () => {
    const result = await server.executeOperation({
      query: "query { hello }",
    });
    expect(result.errors).toBeUndefined();
    expect(result.data?.hello).toBe("Hello from Apollo GraphQL!");
  });
});
