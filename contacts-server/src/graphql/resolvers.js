"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const mysql_1 = require("../../../../../contacts-local-graphql-typescript-package/dist/db/mysql");
exports.resolvers = {
  Query: {
    contacts: async () => {
      console.log("contacts resolver called");
      const data = await (0, mysql_1.getAllContacts)();
      console.log("נתונים מה-MySQL:", data);
      return data;
    },
  },
  Mutation: {
    addContact: async (_parent, { input }) => {
      // קריאה לפונקציה שמוסיפה למסד הנתונים
      const {
        addContact,
      } = require("../../../../../contacts-local-graphql-typescript-package/dist/db/mysql");
      const newContact = await addContact(input);
      return newContact;
    },
  },
};
