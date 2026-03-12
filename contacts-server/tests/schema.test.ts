import { typeDefs } from "../src/graphql/schema";

describe("GraphQL Schema", () => {
  it("should define typeDefs", () => {
    expect(typeDefs).toBeDefined();
  });

  it("should have Contact type with required fields", () => {
    const schemaString = typeDefs.loc?.source.body || "";

    expect(schemaString).toContain("type Contact");
    expect(schemaString).toContain("id: ID!");
    expect(schemaString).toContain("name: String!");
    expect(schemaString).toContain("email: String!");
    expect(schemaString).toContain("phone: String");
    expect(schemaString).toContain("updatedAt: String");
  });

  it("should have Query type with contacts field", () => {
    const schemaString = typeDefs.loc?.source.body || "";

    expect(schemaString).toContain("type Query");
    expect(schemaString).toContain("contacts: [Contact!]!");
  });
});
