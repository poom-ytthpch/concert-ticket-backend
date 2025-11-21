import { PrismaService } from "./prisma.service";

jest.mock("@prisma/client", () => {
  class PrismaClient {
    _options: any;
    $connect = jest.fn().mockResolvedValue(undefined);
    $disconnect = jest.fn().mockResolvedValue(undefined);
    constructor(options?: any) {
      this._options = options;
    }
  }
  return { PrismaClient };
});

describe("PrismaService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("constructs PrismaClient with expected options", () => {
    const svc = new PrismaService();
    expect((svc as any)._options).toEqual({
      log: ["query", "info", "warn"],
      errorFormat: "minimal",
    });
  });

  it("does not call $connect on construction", () => {
    const svc = new PrismaService();
    expect((svc as any).$connect).not.toHaveBeenCalled();
  });

  it("calls $connect on onModuleInit", async () => {
    const svc = new PrismaService();
    await svc.onModuleInit();
    expect((svc as any).$connect).toHaveBeenCalledTimes(1);
  });

  it("calls $disconnect on onModuleDestroy", async () => {
    const svc = new PrismaService();
    await svc.onModuleDestroy();
    expect((svc as any).$disconnect).toHaveBeenCalledTimes(1);
  });
});
