import axios from "axios";
import { getApiHealth } from "./api";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("getApiHealth", () => {
  const originalBackendUrl = process.env.BACKEND_URL;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env.BACKEND_URL = "http://127.0.0.1:8193";
  });

  afterAll(() => {
    process.env.BACKEND_URL = originalBackendUrl;
  });

  it("returns the parsed health payload", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { status: "ok", database: "up" },
    });

    await expect(getApiHealth()).resolves.toEqual({
      status: "ok",
      database: "up",
    });
  });

  it("calls the health endpoint with a timeout", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { status: "ok", database: "up" },
    });

    await getApiHealth();

    // Without a timeout a hung backend would hang the page render too.
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "http://127.0.0.1:8193/api/health",
      { timeout: 5000 },
    );
  });

  it("returns null when the backend is unreachable", async () => {
    mockedAxios.get.mockRejectedValue(new Error("ECONNREFUSED"));

    await expect(getApiHealth()).resolves.toBeNull();
  });

  it("returns null when BACKEND_URL is unset rather than calling undefined", async () => {
    delete process.env.BACKEND_URL;

    await expect(getApiHealth()).resolves.toBeNull();
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });
});
