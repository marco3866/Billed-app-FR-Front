/**
 * @jest-environment jsdom
 */

import LoginUI from "../views/LoginUI";
import Login from "../containers/Login.js";
import { ROUTES } from "../constants/routes";
import { fireEvent, screen } from "@testing-library/dom";

describe("Login", () => {
  let login;

  beforeEach(() => {
    document.body.innerHTML = LoginUI();
    const store = {
      login: jest.fn(() => Promise.resolve({ jwt: "fake-jwt-token" })),
      users: jest.fn(() => ({
        create: jest.fn(() => Promise.resolve()),
      })),
    };
    const onNavigate = jest.fn();
    const localStorage = {
      setItem: jest.fn(),
      getItem: jest.fn(),
    };
    login = new Login({
      document,
      localStorage,
      onNavigate,
      PREVIOUS_LOCATION: "",
      store,
    });
  });

  describe("handleSubmitEmployee", () => {
  

    test("should create user and login if login fails", async () => {
      login.store.login.mockRejectedValueOnce(new Error("Login failed"));

      const form = screen.getByTestId("form-employee");
      const emailInput = screen.getByTestId("employee-email-input");
      const passwordInput = screen.getByTestId("employee-password-input");

      fireEvent.change(emailInput, { target: { value: "employee@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password" } });
      fireEvent.submit(form);

      expect(login.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "employee@example.com",
          password: "password",
          status: "connected",
        })
      );
      expect(login.store.users).toHaveBeenCalled();
      expect(login.store.users().create).toHaveBeenCalledWith({
        data: JSON.stringify({
          type: "Employee",
          name: "employee",
          email: "employee@example.com",
          password: "password",
        }),
      });
      expect(login.store.login).toHaveBeenCalledWith(
        JSON.stringify({ email: "employee@example.com", password: "password" })
      );

      await new Promise(process.nextTick);

      expect(login.onNavigate).toHaveBeenCalledWith(ROUTES.Bills);
      expect(login.PREVIOUS_LOCATION).toBe(ROUTES.Bills);
      expect(document.body.style.backgroundColor).toBe("#fff");
    });
  });

  describe("handleSubmitAdmin", () => {

    test("should create user and login if login fails", async () => {
      login.store.login.mockRejectedValueOnce(new Error("Login failed"));

      const form = screen.getByTestId("form-admin");
      const emailInput = screen.getByTestId("admin-email-input");
      const passwordInput = screen.getByTestId("admin-password-input");

      fireEvent.change(emailInput, { target: { value: "admin@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password" } });
      fireEvent.submit(form);

      expect(login.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Admin",
          email: "admin@example.com",
          password: "password",
          status: "connected",
        })
      );
      expect(login.store.users).toHaveBeenCalled();
      expect(login.store.users().create).toHaveBeenCalledWith({
        data: JSON.stringify({
          type: "Admin",
          name: "admin",
          email: "admin@example.com",
          password: "password",
        }),
      });
      expect(login.store.login).toHaveBeenCalledWith(
        JSON.stringify({ email: "admin@example.com", password: "password" })
      );

      await new Promise(process.nextTick);

      expect(login.onNavigate).toHaveBeenCalledWith(ROUTES.Dashboard);
      expect(login.PREVIOUS_LOCATION).toBe(ROUTES.Dashboard);
      expect(document.body.style.backgroundColor).toBe("#fff");
    });
  });

  describe("login", () => {
    test("should return null if store is not defined", async () => {
      login.store = null;
      const user = {
        email: "user@example.com",
        password: "password",
      };
      const result = await login.login(user);
      expect(result).toBeNull();
    });
  });

  describe("createUser", () => {

    test("should return null if store is not defined", async () => {
      login.store = null;
      const user = {
        type: "Employee",
        email: "user@example.com",
        password: "password",
      };
      const result = await login.createUser(user);
      expect(result).toBeNull();
    });
  });
});