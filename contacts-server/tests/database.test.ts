import {
  getDbConfig,
  testConnection,
  createPool,
  DbConfig,
} from "../src/db/database";

type PoolLike = {
  query: ReturnType<typeof vi.fn>;
  end: ReturnType<typeof vi.fn>;
};

describe("Database Module", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("getDbConfig", () => {
    it("should return local config when ENVIRONMENT is not cloud", () => {
      process.env.ENVIRONMENT = "local";
      process.env.MYSQL_HOST = "localhost";
      process.env.MYSQL_USER = "testuser";
      process.env.MYSQL_PASSWORD = "testpass";
      process.env.MYSQL_DATABASE = "testdb";
      process.env.MYSQL_PORT = "3306";

      const config = getDbConfig();

      expect(config.host).toBe("localhost");
      expect(config.user).toBe("testuser");
      expect(config.database).toBe("testdb");
      expect(config.port).toBe(3306);
    });

    it("should return cloud config when ENVIRONMENT is cloud", () => {
      process.env.ENVIRONMENT = "cloud";
      process.env.AWS_RDS_HOST = "aws-host";
      process.env.AWS_RDS_USER = "awsuser";
      process.env.AWS_RDS_PASSWORD = "awspass";
      process.env.AWS_RDS_DATABASE = "awsdb";
      process.env.AWS_RDS_PORT = "3307";

      const config = getDbConfig();

      expect(config.host).toBe("aws-host");
      expect(config.user).toBe("awsuser");
      expect(config.database).toBe("awsdb");
      expect(config.port).toBe(3307);
    });

    it("should default port to 3306 when not specified", () => {
      process.env.ENVIRONMENT = "local";
      delete process.env.MYSQL_PORT;

      const config = getDbConfig();

      expect(config.port).toBe(3306);
    });
  });

  describe("createPool", () => {
    it("should create a pool with given config", () => {
      const config: DbConfig = {
        host: "localhost",
        user: "test",
        password: "pass",
        database: "db",
        port: 3306,
      };

      const pool = createPool(config);
      expect(pool).toBeDefined();
      pool.end();
    });
  });

  describe("testConnection", () => {
    it("should return true when connection succeeds", async () => {
      // Create a mock pool that succeeds
      const mockPool = {
        query: vi.fn().mockResolvedValue([{ 1: 1 }]),
        end: vi.fn(),
      } as PoolLike;

      const result = await testConnection(mockPool);

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith("SELECT 1");
    });

    it("should return false when connection fails", async () => {
      // Create a mock pool that fails
      const mockPool = {
        query: vi.fn().mockRejectedValue(new Error("Mock connection error")),
        end: vi.fn(),
      } as PoolLike;

      const result = await testConnection(mockPool);

      expect(result).toBe(false);
      expect(mockPool.query).toHaveBeenCalledWith("SELECT 1");
    });
  });
});
