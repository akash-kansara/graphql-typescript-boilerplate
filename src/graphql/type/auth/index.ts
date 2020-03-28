export default `
  type AuthenticationSuccess {
    accessToken: String!
    refreshToken: String!
  }

  type Mutation {
    authenticate(credential: AuthenticationInput): AuthenticationSuccess!
    refreshToken(refreshToken: String!): AuthenticationSuccess!
  }

  input AuthenticationInput {
    username: String!
    password: String!
  }
`;