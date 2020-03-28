export default `
  type User {
    firstname: String!
    lastname: String!
    fullname: String!
    email: String!
    dob: String!
  }

  type Query {
    user(email: String!): User!
    users: [User!]!
  }

  type Mutation {
    createUser(user: UserUpsertInput): User!
    updateUser(user: UserUpsertInput): User!
  }

  input UserUpsertInput {
    firstname: String!
    lastname: String!
    email: String!
    dob: String!
  }
`;