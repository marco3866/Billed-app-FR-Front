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

      await waitFor(() => {
        expect(login.store.users).toHaveBeenCalled();
        expect(createSpy).toHaveBeenCalledWith({
          data: expect.any(String),
        });
      });

      expect(login.store.login).toHaveBeenCalledWith(
        JSON.stringify({ email: "employee@example.com", password: "password" })
      );

      expect(login.onNavigate).toHaveBeenCalledWith(ROUTES.Bills);
      expect(login.PREVIOUS_LOCATION).toBe(ROUTES.Bills);
      expect(document.body.style.backgroundColor).toBe("#fff");
    });
  });

  describe("handleSubmitAdmin", () => {
    test("should create user and login if login fails", async () => {
      login.store.login.mockRejectedValueOnce(new Error("Login failed"));
  
      const createSpy = jest.spyOn(login.store.users(), "create"); // Espionner la méthode create
  
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
        expect(createSpy).toHaveBeenCalledWith({
          data: expect.any(String), // Assurez-vous que c'est une chaîne JSON comme prévu
        });
        console.log(createSpy.mock.calls);

      });
  
      expect(login.store.login).toHaveBeenCalledWith(
        JSON.stringify({ email: "admin@example.com", password: "password" })
      );
  
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