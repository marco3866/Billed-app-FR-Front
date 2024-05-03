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

      newBill.billId = "1234";
      await newBill.updateBill(bill);

      expect(errorMock).toHaveBeenCalledWith(expect.any(Error));

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
    test("Then uploading a valid file should create a new bill", async () => {
      const store = mockStore;
      const createMock = jest.fn().mockResolvedValue({ fileUrl: "https://example.com/test.jpg", key: "1234" });
      store.bills = jest.fn().mockReturnValue({ create: createMock });

      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store,
        localStorage: window.localStorage,
      });

      const validFile = new File(["file content"], "test.jpg", { type: "image/jpeg" });
      const event = { preventDefault: jest.fn(), target: { value: "path/to/test.jpg", files: [validFile] } };

      await newBill.handleChangeFile(event);

      expect(createMock).toHaveBeenCalledWith({
        data: expect.any(FormData),
        headers: { noContentType: true },
      });
      expect(newBill.billId).toBe("1234");
      expect(newBill.fileUrl).toBe("https://example.com/test.jpg");
      expect(newBill.fileName).toBe("test.jpg");
    });

    test("Then uploading an incorrect file format should not set properties and should show alert", () => {
      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: null,
        localStorage: window.localStorage,
      });
    
      const inputFile = screen.getByTestId("file");
      const wrongFile = new File(["wrong content"], "test.txt", { type: "text/plain" });
    
      const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    
      fireEvent.change(inputFile, { target: { files: [wrongFile] } });
    
      // Assurez-vous que l'alerte est déclenchée
      expect(alertSpy).toHaveBeenCalled();
      expect(newBill.fileUrl).toBeNull(); // Les propriétés ne doivent pas être définies
    
      alertSpy.mockRestore(); // Restaurer l'alerte
    });
test("Then submitting the form should call handleSubmit and update the bill", () => {
  const onNavigate = jest.fn();
  const updateBill = jest.fn();
  const newBill = new NewBill({
    document,
    onNavigate,
    store: { bills: jest.fn().mockReturnValue({ update: updateBill }) },
    localStorage: window.localStorage,
  });

  const form = screen.getByTestId("form-new-bill");
  fireEvent.submit(form); // Simuler la soumission

  // Vérifiez que handleSubmit a été appelé correctement
  expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']); // Navigation vers la page des factures
  expect(updateBill).toHaveBeenCalled(); // La fonction d'update doit être appelée
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

  expect(console.error).toHaveBeenCalledWith(expect.any(Error)); // Vérifier que console.error a été appelé avec une erreur
});
    test("Then submitting an incorrect file format should not proceed", () => {
      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: null,
        localStorage: window.localStorage,
      });

      const html = NewBillUI();
      document.body.innerHTML = html;

      const inputFile = screen.getByTestId("file");
      const wrongFile = new File(["(¬_¬)"], "test.txt", { type: "text/plain" });

      const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {}); // Mock alert

      fireEvent.change(inputFile, { target: { files: [wrongFile] } });

      // Assurez-vous qu'une alerte a été déclenchée
      expect(alertSpy).toHaveBeenCalledWith("Le format de fichier n'est pas pris en charge. Veuillez télécharger une image au format jpg, jpeg ou png.");

      alertSpy.mockRestore(); // Restaurer la fonction d'alerte
    });
  });
});