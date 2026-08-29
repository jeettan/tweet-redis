const request = require("supertest");

describe("config", () => {

    beforeEach(() => {
        jest.resetModules();
        delete process.env.NODE_ENV;
    });

    test("uses testing environment sets NODE_ENV to value", () => {

        process.env.NODE_ENV = "value";

        require("../config/config");

        expect(process.env.NODE_ENV).toBe("value");
    });

});