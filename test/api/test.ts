export {};

function importTest(name, path) {
  describe(name, function () {
    require(path);
  });
}

describe('API Tests', () => {
  importTest('Auth Module', './auth/test.ts');
  importTest('User Module', './user/test.ts');
  importTest('Product Module', './product/test.ts');
  importTest('Sale Module', './sale/test.ts');
  after((done) => {
    done(); process.exit(0);
  });
});