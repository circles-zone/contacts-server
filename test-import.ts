import { getAllContacts } from "@circles-zone/contacts-local";

async function test() {
  try {
    console.log("Testing getAllContacts...");
    const contacts = await getAllContacts();
    console.log(`Found ${contacts.length} contacts`);
    console.log("First contact:", contacts[0]);
  } catch (error) {
    console.error("Error:", error);
  }
}

test();