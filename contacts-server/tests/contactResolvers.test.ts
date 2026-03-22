import { jest } from "@jest/globals";
import mysql from "mysql2/promise";
import {
  createResolvers,
  formatContact,
} from "../src/graphql/contactResolvers";

describe("Contact Resolvers", () => {
  describe("formatContact", () => {
    it("should format contact with all fields", () => {
      const row = {
        id: "1",
        firstName: "  John  ",
        lastName: "  Doe  ",
        email: "john@example.com",
        phone: "123456789",
        updatedAt: "2024-01-01",
      };

      const result = formatContact(row);

      expect(result).toEqual({
        id: "1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "123456789",
        updatedAt: "2024-01-01",
      });
    });

    it("should use default firstName when firstName is empty", () => {
      const row = {
        id: "1",
        firstName: "   ",
        lastName: null,
        email: "john@example.com",
        phone: "123456789",
        updatedAt: "2024-01-01",
      };

      const result = formatContact(row);

      expect(result.firstName).toBe("לא ידוע");
    });

    it("should use default firstName when firstName is null", () => {
      const row = {
        id: "1",
        firstName: null as any,
        lastName: null,
        email: "john@example.com",
        phone: "123456789",
        updatedAt: "2024-01-01",
      };

      const result = formatContact(row);

      expect(result.firstName).toBe("לא ידוע");
    });

    it("should use default email when email is missing", () => {
      const row = {
        id: "1",
        firstName: "John",
        lastName: null,
        email: null as any,
        phone: "123456789",
        updatedAt: "2024-01-01",
      };

      const result = formatContact(row);

      expect(result.email).toBe("unknown@example.com");
    });

    it("should set phone to null when phone is missing", () => {
      const row = {
        id: "1",
        firstName: "John",
        lastName: null,
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
      } as unknown as mysql.Pool;

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
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          phone: "123456789",
          updatedAt: "2024-01-01",
        },
      ];

      const mockPool = {
        query: jest.fn().mockResolvedValue([mockRows]),
      } as unknown as mysql.Pool;

      const resolvers = createResolvers(mockPool);
      const result = await resolvers.Query.contacts();

      expect(result).toHaveLength(1);
      expect(result[0].firstName).toBe("John");
      expect(result[0].lastName).toBe("Doe");
    });

    it("should handle contacts with missing firstName (applies default)", async () => {
      const mockRows = [
        {
          id: "1",
          firstName: null,
          lastName: null,
          email: "john@example.com",
          phone: "123456789",
          updatedAt: "2024-01-01",
        },
      ];

      const mockPool = {
        query: jest.fn().mockResolvedValue([mockRows]),
      } as unknown as mysql.Pool;

      const resolvers = createResolvers(mockPool);
      const result = await resolvers.Query.contacts();

      expect(result).toHaveLength(1);
      expect(result[0].firstName).toBe("לא ידוע");
    });

    it("should handle contacts with whitespace-only firstName", async () => {
      const mockRows = [
        {
          id: "1",
          firstName: "   ",
          lastName: null,
          email: "john@example.com",
          phone: "123456789",
          updatedAt: "2024-01-01",
        },
      ];

      const mockPool = {
        query: jest.fn().mockResolvedValue([mockRows]),
      } as unknown as mysql.Pool;

      const resolvers = createResolvers(mockPool);
      const result = await resolvers.Query.contacts();

      expect(result).toHaveLength(1);
      expect(result[0].firstName).toBe("לא ידוע");
    });

    it("should handle contacts with missing email (applies default)", async () => {
      const mockRows = [
        {
          id: "1",
          firstName: "John",
          lastName: "Doe",
          email: null,
          phone: "123456789",
          updatedAt: "2024-01-01",
        },
      ];

      const mockPool = {
        query: jest.fn().mockResolvedValue([mockRows]),
      } as unknown as mysql.Pool;

      const resolvers = createResolvers(mockPool);
      const result = await resolvers.Query.contacts();

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe("unknown@example.com");
    });

    it("should handle contacts with missing phone (sets to null)", async () => {
      const mockRows = [
        {
          id: "1",
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          phone: null,
          updatedAt: "2024-01-01",
        },
      ];

      const mockPool = {
        query: jest.fn().mockResolvedValue([mockRows]),
      } as unknown as mysql.Pool;

      const resolvers = createResolvers(mockPool);
      const result = await resolvers.Query.contacts();

      expect(result).toHaveLength(1);
      expect(result[0].phone).toBeNull();
    });

    it("should return empty array on database error", async () => {
      const mockPool = {
        query: jest.fn().mockRejectedValue(new Error("DB Error")),
      } as unknown as mysql.Pool;

      const resolvers = createResolvers(mockPool);
      const result = await resolvers.Query.contacts();

      expect(result).toEqual([]);
    });

    it("should handle empty result set", async () => {
      const mockPool = {
        query: jest.fn().mockResolvedValue([[]]),
      } as unknown as mysql.Pool;

      const resolvers = createResolvers(mockPool);
      const result = await resolvers.Query.contacts();

      expect(result).toEqual([]);
    });
  });
});
