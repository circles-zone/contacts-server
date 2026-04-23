import {
  getAllContacts,
  addContact,
  updateContact,
  deleteContact,
} from "@circles-zone/contacts-local-typescript-package";
import { loggerRemote, ComponentCategory } from "@circles-zone/logger-remote";

const logger = loggerRemote(
  process.env.BRAND_NAME || "Circlez",
  process.env.ENVIRONMENT_NAME || "local"
);
const logFields = {
  componentId: 5002,
  componentName: "contacts-server-service",
  componentCategory: ComponentCategory.Code,
};

export async function getContacts() {
  try {
    const contacts = await getAllContacts();
    logger.info(`getContacts: found ${contacts.length} contacts`, logFields);
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
  } catch (error) {
    logger.error("getContacts failed", { ...logFields, error: String(error) });
    throw error;
  }
}

export async function createContact(
  firstName: string,
  lastName: string | undefined,
  phone: string,
  emailAddress: string,
) {
  try {
    const newContact = await addContact(firstName, lastName, phone, emailAddress);
    if (!newContact) return null;
    logger.info("createContact succeeded", { ...logFields, emailAddress });
    const normalizedEmailAddress = newContact.email || "";
    return {
      ...newContact,
      firstName: (newContact.firstName as string)?.trim() || "Unknown",
      lastName: (newContact.lastName as string)?.trim() || null,
      emailAddress: normalizedEmailAddress,
      email: normalizedEmailAddress,
      phone: newContact.phone || null,
    };
  } catch (error) {
    logger.error("createContact failed", { ...logFields, error: String(error) });
    throw error;
  }
}

export async function editContact(
  id: string,
  firstName: string,
  lastName?: string,
  phone?: string,
  emailAddress?: string,
) {
  try {
    const updated = await updateContact(id, firstName, lastName, phone, emailAddress);
    if (!updated) return null;
    logger.info("editContact succeeded", { ...logFields, id });
    const normalizedEmailAddress = updated.email || "";
    return {
      ...updated,
      firstName: (updated.firstName as string)?.trim() || "Unknown",
      lastName: (updated.lastName as string)?.trim() || null,
      emailAddress: normalizedEmailAddress,
      email: normalizedEmailAddress,
      phone: updated.phone || null,
    };
  } catch (error) {
    logger.error("editContact failed", { ...logFields, id, error: String(error) });
    throw error;
  }
}

export async function removeContact(id: string) {
  try {
    const result = await deleteContact(id);
    logger.info("removeContact succeeded", { ...logFields, id });
    return result;
  } catch (error) {
    logger.error("removeContact failed", { ...logFields, id, error: String(error) });
    throw error;
  }
}
