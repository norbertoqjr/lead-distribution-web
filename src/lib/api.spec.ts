import axios from "axios";
import { apiFetch, getApiHealth } from "./api";
import { z } from "zod";

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

jest.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined }),
}));

describe("apiFetch", () => {
  const originalBackendUrl = process.env.BACKEND_URL;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env.BACKEND_URL = "http://127.0.0.1:8193";
  });

  afterAll(() => {
    process.env.BACKEND_URL = originalBackendUrl;
  });

  it("reads an empty body as null", async () => {
    // Nest sends a null return as zero bytes, which axios reports as "". The
    // dashboard asks /forms and /distributions for records that need not exist
    // yet, so on a fresh database this is the ordinary answer, not a fault.
    mockedAxios.request.mockResolvedValue({ data: "" });

    await expect(
      apiFetch("/forms", z.object({ id: z.number() }).nullable()),
    ).resolves.toBeNull();
  });

  it("still rejects a body of the wrong shape", async () => {
    mockedAxios.request.mockResolvedValue({ data: { unexpected: true } });

    await expect(
      apiFetch("/forms", z.object({ id: z.number() }).nullable()),
    ).rejects.toThrow("The API returned an unexpected response");
  });
});
