/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from '@testing-library/dom';
import LoginUI from "../views/LoginUI";
import Login from "../containers/Login.js";
import { ROUTES } from "../constants/routes";

describe("Login", () => {
  let login;
  let createSpy;

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
    createSpy = jest.spyOn(login.store.users(), "create");
  });

  afterEach(() => {
    jest.clearAllMocks();
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
  
      await waitFor(() => {
        expect(login.store.users).toHaveBeenCalled();
        // Ajout d'un log pour voir les appels
        console.log('Calls to create:', createSpy.mock.calls);
        console.log(createSpy.mock.calls);

      });
  
      expect(login.store.login).toHaveBeenCalledWith(
        JSON.stringify({ email: "admin@example.com", password: "password" })
      );
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