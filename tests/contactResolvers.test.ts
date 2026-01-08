import {
  createResolvers,
  formatContact,
  Contact,
} from "../src/graphql/contactResolvers";

describe("Contact Resolvers", () => {
  describe("formatContact", () => {
    it("should format contact with all fields", () => {
      const row = {
        id: "1",
        name: "  John Doe  ",
        email: "john@example.com",
        phone: "123456789",
        updatedAt: "2024-01-01",
      };

      const result = formatContact(row);

      expect(result).toEqual({
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        phone: "123456789",
        updatedAt: "2024-01-01",
      });
    });

    it("should use default name when name is empty", () => {
      const row = {
        id: "1",
        name: "   ",
        email: "john@example.com",
        phone: "123456789",
        updatedAt: "2024-01-01",
      };

      const result = formatContact(row);

      expect(result.name).toBe("לא ידוע");
    });

    it("should use default name when name is null", () => {
      const row = {
        id: "1",
        name: null,
        email: "john@example.com",
        phone: "123456789",
        updatedAt: "2024-01-01",
      };

      const result = formatContact(row);

      expect(result.name).toBe("לא ידוע");
    });

    it("should use default email when email is missing", () => {
      const row = {
        id: "1",
        name: "John",
        email: null,
        phone: "123456789",
        updatedAt: "2024-01-01",
      };

      const result = formatContact(row);

      expect(result.email).toBe("unknown@example.com");
    });

    it("should set phone to null when phone is missing", () => {
      const row = {
        id: "1",
        name: "John",
        email: "john@example.com",
        phone: null,
        updatedAt: "2024-01-01",
      };

      const result = formatContact(row);

      expect(result.phone).toBeNull();
    });
  });

  describe("createResolvers", () => {
    it("should create resolvers with Query.contacts", () => {
      const mockPool = {
        query: jest.fn().mockResolvedValue([[]]),
      } as any;

      const resolvers = createResolvers(mockPool);

      expect(resolvers).toBeDefined();
      expect(resolvers.Query).toBeDefined();
      expect(resolvers.Query.contacts).toBeDefined();
      expect(typeof resolvers.Query.contacts).toBe("function");
    });

    it("should return contacts from database", async () => {
      const mockRows = [
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          phone: "123456789",
          updatedAt: "2024-01-01",
        },
      ];

      const mockPool = {
        query: jest.fn().mockResolvedValue([mockRows]),
      } as any;

      const resolvers = createResolvers(mockPool);
      const result = await resolvers.Query.contacts();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("John Doe");
    });

    it("should handle contacts with missing name (applies default)", async () => {
      const mockRows = [
        {
          id: "1",
          name: null,
          email: "john@example.com",
          phone: "123456789",
          updatedAt: "2024-01-01",
        },
      ];

      const mockPool = {
        query: jest.fn().mockResolvedValue([mockRows]),
      } as any;

      const resolvers = createResolvers(mockPool);
      const result = await resolvers.Query.contacts();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("לא ידוע");
    });

    it("should handle contacts with whitespace-only name", async () => {
      const mockRows = [
        {
          id: "1",
          name: "   ",
          email: "john@example.com",
          phone: "123456789",
          updatedAt: "2024-01-01",
        },
      ];

      const mockPool = {
        query: jest.fn().mockResolvedValue([mockRows]),
      } as any;

      const resolvers = createResolvers(mockPool);
      const result = await resolvers.Query.contacts();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("לא ידוע");
    });

    it("should handle contacts with missing email (applies default)", async () => {
      const mockRows = [
        {
          id: "1",
          name: "John Doe",
          email: null,
          phone: "123456789",
          updatedAt: "2024-01-01",
        },
      ];

      const mockPool = {
        query: jest.fn().mockResolvedValue([mockRows]),
      } as any;

      const resolvers = createResolvers(mockPool);
      const result = await resolvers.Query.contacts();

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe("unknown@example.com");
    });

    it("should handle contacts with missing phone (sets to null)", async () => {
      const mockRows = [
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          phone: null,
          updatedAt: "2024-01-01",
        },
      ];

      const mockPool = {
        query: jest.fn().mockResolvedValue([mockRows]),
      } as any;

      const resolvers = createResolvers(mockPool);
      const result = await resolvers.Query.contacts();

      expect(result).toHaveLength(1);
      expect(result[0].phone).toBeNull();
    });

    it("should return empty array on database error", async () => {
      const mockPool = {
        query: jest.fn().mockRejectedValue(new Error("DB Error")),
      } as any;

      const resolvers = createResolvers(mockPool);
      const result = await resolvers.Query.contacts();

      expect(result).toEqual([]);
    });

    it("should handle empty result set", async () => {
      const mockPool = {
        query: jest.fn().mockResolvedValue([[]]),
      } as any;

      const resolvers = createResolvers(mockPool);
      const result = await resolvers.Query.contacts();

      expect(result).toEqual([]);
    });
  });
});
