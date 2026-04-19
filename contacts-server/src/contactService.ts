import {
  getAllContacts,
  addContact,
  updateContact,
  deleteContact,
} from "@circles-zone/contacts-local-typescript-package";

export async function getContacts() {
  const contacts = await getAllContacts();
  return contacts.map(
    (contact: {
      id: string;
      firstName?: string;
      lastName?: string;
      emailAddress?: string;
      email?: string;
      phone?: string;
      updatedAt?: string | null;
    }) => {
      const emailAddress = contact.emailAddress || contact.email || "";
      return {
        ...contact,
        firstName: contact.firstName?.trim() || "Unknown",
        lastName: contact.lastName?.trim() || null,
        emailAddress,
        email: emailAddress,
        phone: contact.phone || null,
      };
    },
  );
}

export async function createContact(
  firstName: string,
  lastName: string | undefined,
  phone: string,
  emailAddress: string,
) {
  const newContact = await addContact(firstName, lastName, phone, emailAddress);
  if (!newContact) return null;
  const normalizedEmailAddress =
    newContact.emailAddress || newContact.email || "";
  return {
    ...newContact,
    firstName: (newContact.firstName as string)?.trim() || "Unknown",
    lastName: (newContact.lastName as string)?.trim() || null,
    emailAddress: normalizedEmailAddress,
    email: normalizedEmailAddress,
    phone: newContact.phone || null,
  };
}

export async function editContact(
  id: string,
  firstName: string,
  lastName?: string,
  phone?: string,
  emailAddress?: string,
) {
  const updated = await updateContact(
    id,
    firstName,
    lastName,
    phone,
    emailAddress,
  );
  if (!updated) return null;
  const normalizedEmailAddress = updated.emailAddress || updated.email || "";
  return {
    ...updated,
    firstName: (updated.firstName as string)?.trim() || "Unknown",
    lastName: (updated.lastName as string)?.trim() || null,
    emailAddress: normalizedEmailAddress,
    email: normalizedEmailAddress,
    phone: updated.phone || null,
  };
}

export async function removeContact(id: string) {
  return await deleteContact(id);
}
