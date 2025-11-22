import * as path from "path";

describe("generate-typings bootstrap", () => {
  const modulePath = "./generate-typings";

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test("instantiates GraphQLDefinitionsFactory and calls generate once with expected options", () => {
    const mockGenerate = jest.fn();
    const mockFactory = jest
      .fn()
      .mockImplementation(() => ({ generate: mockGenerate }));

    jest.doMock("@nestjs/graphql", () => ({
      GraphQLDefinitionsFactory: mockFactory,
    }));

    jest.isolateModules(() => {
      require(modulePath);
    });

    const expectedPath = path.join(process.cwd(), "src/types/gql.ts");

    expect(mockFactory).toHaveBeenCalledTimes(1);
    expect(mockGenerate).toHaveBeenCalledTimes(1);
    expect(mockGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        typePaths: ["./src/**/*.graphql"],
        path: expectedPath,
        outputAs: "class",
        watch: true,
      })
    );
  });
});
