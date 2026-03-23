import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetAll, mockAdd, mockUpdate, mockDelete } = vi.hoisted(() => ({
  mockGetAll: vi.fn(),
  mockAdd: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock("@circles-zone/contacts-local-typescript-package", () => ({
  getAllContacts: mockGetAll,
  addContact: mockAdd,
  updateContact: mockUpdate,
  deleteContact: mockDelete,
}));

import {
  getContacts,
  createContact,
  editContact,
  removeContact,
} from "../src/contactService";

beforeEach(() => {
  mockGetAll.mockReset();
  mockAdd.mockReset();
  mockUpdate.mockReset();
  mockDelete.mockReset();
});

describe("getContacts", () => {
  it("returns mapped contacts", async () => {
    mockGetAll.mockResolvedValueOnce([
      { id: "1", firstName: " Alice ", lastName: " Smith ", email: "a@test.com", phone: "123", updatedAt: "2024-01-01" },
    ]);
    const result = await getContacts();
    expect(result[0].firstName).toBe("Alice");
    expect(result[0].lastName).toBe("Smith");
  });

  it("defaults firstName to Unknown when empty", async () => {
    mockGetAll.mockResolvedValueOnce([
      { id: "1", firstName: "  ", lastName: null, email: null, phone: null, updatedAt: null },
    ]);
    const result = await getContacts();
    expect(result[0].firstName).toBe("Unknown");
    expect(result[0].lastName).toBeNull();
    expect(result[0].email).toBe("");
    expect(result[0].phone).toBeNull();
  });
});

describe("createContact", () => {
  it("returns created contact", async () => {
    mockAdd.mockResolvedValueOnce({ id: "2", firstName: " Bob ", lastName: null, email: "b@test.com", phone: "555" });
    const result = await createContact("Bob", undefined, "555", "b@test.com");
    expect(result!.firstName).toBe("Bob");
  });

  it("returns null when addContact returns null", async () => {
    mockAdd.mockResolvedValueOnce(null);
    const result = await createContact("Bob", undefined, "555", "b@test.com");
    expect(result).toBeNull();
  });

  it("defaults firstName to Unknown when empty", async () => {
    mockAdd.mockResolvedValueOnce({ id: "3", firstName: "  ", lastName: "  ", email: null, phone: null });
    const result = await createContact("  ", undefined, "", "");
    expect(result!.firstName).toBe("Unknown");
    expect(result!.lastName).toBeNull();
    expect(result!.email).toBe("");
  });
});

describe("editContact", () => {
  it("returns updated contact", async () => {
    mockUpdate.mockResolvedValueOnce({ id: "1", firstName: " Updated ", lastName: " Last ", email: "u@test.com", phone: "999" });
    const result = await editContact("1", "Updated", "Last", "999", "u@test.com");
    expect(result!.firstName).toBe("Updated");
  });

  it("returns null when updateContact returns null", async () => {
    mockUpdate.mockResolvedValueOnce(null);
    const result = await editContact("1", "Test");
    expect(result).toBeNull();
  });

  it("defaults firstName to Unknown when empty", async () => {
    mockUpdate.mockResolvedValueOnce({ id: "1", firstName: "", lastName: "  ", email: null, phone: null });
    const result = await editContact("1", "");
    expect(result!.firstName).toBe("Unknown");
    expect(result!.lastName).toBeNull();
  });
});

describe("removeContact", () => {
  it("returns true on success", async () => {
    mockDelete.mockResolvedValueOnce(true);
    const result = await removeContact("1");
    expect(result).toBe(true);
  });

  it("returns false when not found", async () => {
    mockDelete.mockResolvedValueOnce(false);
    const result = await removeContact("99");
    expect(result).toBe(false);
  });
});
