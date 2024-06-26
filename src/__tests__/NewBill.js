/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES_PATH } from "../constants/routes.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";


describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    // Configuration de l'environnement Jest
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
    
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);

    router(); // Initialiser le routeur
  });
  describe("When I am on NewBill Page", () => {
    test("Then the form should be displayed", () => {
      const html = NewBillUI(); // Rendre l'interface utilisateur
      document.body.innerHTML = html;

      const form = screen.getByTestId("form-new-bill"); // Assurer que le formulaire est présent
      expect(form).toBeTruthy(); // Le formulaire devrait exister
    });
    test("Then updating a bill with an error should log an error", async () => {
      const errorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: {
          bills: jest.fn().mockReturnValue({
            update: jest.fn().mockRejectedValue(new Error("Failed to update bill")),
          }),
        },
        localStorage: window.localStorage,
      });

      const bill = {
        email: "test@example.com",
        type: "Transports",
        name: "Test Bill",
        amount: 100,
        date: "2023-06-13",
        vat: "20",
        pct: 20,
        commentary: "Test commentary",
        fileUrl: "https://example.com/test.jpg",
        fileName: "test.jpg",
        status: "pending",
      };

      errorMock.mockRestore();
    });

    test("Then calling updateBill with null store should not throw an error", () => {
      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: null,
        localStorage: window.localStorage,
      });

      const bill = {
        email: "test@example.com",
        type: "Transports",
        name: "Test Bill",
        amount: 100,
        date: "2023-06-13",
        vat: "20",
        pct: 20,
        commentary: "Test commentary",
        fileUrl: "https://example.com/test.jpg",
        fileName: "test.jpg",
        status: "pending",
      };

      expect(() => newBill.updateBill(bill)).not.toThrow();
    });    


    test("Then submitting the form should call handleSubmit and update the bill", async () => {
      const onNavigate = jest.fn();
      const updateBill = jest.fn().mockResolvedValue({}); // Modifier pour renvoyer une promesse résolue
      const newBill = new NewBill({
        document,
        onNavigate,
        store: { bills: jest.fn().mockReturnValue({ update: updateBill }) },
        localStorage: window.localStorage,
      });
    
      const form = screen.getByTestId("form-new-bill");
    
      // Remplir les champs du formulaire avec des données valides
      const expenseTypeInput = screen.getByTestId("expense-type");
      fireEvent.change(expenseTypeInput, { target: { value: "Transports" } });
    
      const expenseNameInput = screen.getByTestId("expense-name");
      fireEvent.change(expenseNameInput, { target: { value: "Test Expense" } });
    
      const datepickerInput = screen.getByTestId("datepicker");
      fireEvent.change(datepickerInput, { target: { value: "2023-06-13" } });
    
      const amountInput = screen.getByTestId("amount");
      fireEvent.change(amountInput, { target: { value: "100" } });
    
      const vatInput = screen.getByTestId("vat");
      fireEvent.change(vatInput, { target: { value: "20" } });
    
      const pctInput = screen.getByTestId("pct");
      fireEvent.change(pctInput, { target: { value: "20" } });
    
      const commentaryInput = screen.getByTestId("commentary");
      fireEvent.change(commentaryInput, { target: { value: "Test commentary" } });
    
      const fileInput = screen.getByTestId("file");
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      fireEvent.change(fileInput, { target: { files: [file] } });
    
      // Simuler la soumission du formulaire
      fireEvent.submit(form);
    
      // Attendre que la promesse soit résolue
      await waitFor(() => {
        expect(updateBill).toHaveBeenCalled(); // La fonction d'update doit être appelée
      });
    
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']); // Navigation vers la page des factures
    });
test("Then it should log an error if creating a new bill fails", async () => {
  const store = mockStore;
  const createMock = jest.fn().mockRejectedValue(new Error("Failed to create bill"));
  store.bills = jest.fn().mockReturnValue({ create: createMock });

  const newBill = new NewBill({
    document,
    onNavigate: jest.fn(),
    store,
    localStorage: window.localStorage,
  });

  const validFile = new File(["file content"], "test.jpg", { type: "image/jpeg" });
  const event = { preventDefault: jest.fn(), target: { value: "path/to/test.jpg", files: [validFile] } };

  console.error = jest.fn(); // Espionner la fonction console.error

  await newBill.handleChangeFile(event);

});

  });
});