export default `
  type Sale {
    productCode: String!
    userEmail: String!
    quantity: Int!
    user: User!
    product: Product!
  }

  type Query {
    sales: [Sale!]!
  }

  type Mutation {
    postSale(sale: CreateSaleInput): Sale!
  }

  type Subscription {
    salePosted(token: String!): Sale!
  }

  input CreateSaleInput {
    productCode: String!
    userEmail: String!
    quantity: Int!
  }
`;