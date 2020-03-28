export default `
  type Product {
    code: String!
    name: String!
    desc: String!
    tag: String!
    price: Float!
  }

  type Query {
    product(code: String!): Product!
    products: [Product!]!
  }

  type Mutation {
    createProduct(product: ProductUpsertInput): Product!
    updateProduct(product: ProductUpsertInput): Product!
  }

  input ProductUpsertInput {
    code: String!
    name: String!
    desc: String!
    tag: String!
    price: Float!
  }
`;