import {
  getAllContacts,
  addContact,
  updateContact,
  deleteContact,
} from "@circles-zone/contacts-local-typescript-package";

export async function getContacts() {
  const contacts = await getAllContacts();
  return contacts.map((contact: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    updatedAt?: string | null;
  }) => ({
    ...contact,
    firstName: contact.firstName?.trim() || "Unknown",
    lastName: contact.lastName?.trim() || null,
    email: contact.email || "",
    phone: contact.phone || null,
  }));
}

export async function createContact(
  firstName: string,
  lastName: string | undefined,
  phone: string,
  email: string,
) {
  const newContact = await addContact(firstName, lastName, phone, email);
  if (!newContact) return null;
  return {
    ...newContact,
    firstName: (newContact.firstName as string)?.trim() || "Unknown",
    lastName: (newContact.lastName as string)?.trim() || null,
    email: newContact.email || "",
    phone: newContact.phone || null,
  };
}

export async function editContact(
  id: string,
  firstName: string,
  lastName?: string,
  phone?: string,
  email?: string,
) {
  const updated = await updateContact(id, firstName, lastName, phone, email);
  if (!updated) return null;
  return {
    ...updated,
    firstName: (updated.firstName as string)?.trim() || "Unknown",
    lastName: (updated.lastName as string)?.trim() || null,
    email: updated.email || "",
    phone: updated.phone || null,
  };
}

export async function removeContact(id: string) {
  return await deleteContact(id);
}
