/** @jest-environment jsdom */
import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
import { formatDate, formatStatus } from "../app/format.js";

describe("Given I am on Bills Page", () => {
  test("Then getBills should return undefined if store is not defined", () => {
    const billsContainer = new Bills({
      document,
      onNavigate: jest.fn(),
      store: null, // Simuler le cas où `store` n'est pas défini
      localStorage: window.localStorage,
    });

    const result = billsContainer.getBills(); // Appeler `getBills`

    expect(result).toBeUndefined(); // Vérifiez le comportement attendu
  });
});

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    beforeEach(async () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      document.body.innerHTML = ''; // Assurez-vous de réinitialiser le contenu du body avant chaque test
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
      await new Promise(resolve => setTimeout(resolve, 0)); // Simulez un délai pour permettre au DOM de se mettre à jour
    });

    test("Then it should handle click on new bill button and navigate to NewBill page", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const onNavigate = jest.fn();
      const billsContainer = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const buttonNewBill = screen.getByTestId("btn-new-bill");
      userEvent.click(buttonNewBill);

      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["NewBill"]);
    });
    test("Then it should fetch bills from the mock store", async () => {
      const billsContainer = new Bills({
        document,
        onNavigate: () => {},
        store: mockStore,
        localStorage: window.localStorage,
      });
    
      const bills = await billsContainer.getBills();
    
      expect(bills.length).toBe(4);
      expect(bills[0].date).toEqual(expect.any(String));
      expect(bills[0].status).toEqual(expect.any(String));
    });
    test("Then bill icon in vertical layout should be highlighted", async () => {
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => expect(screen.getByTestId("icon-window")).toBeTruthy());
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });
    
    test("Then it should display the modal with the correct content when clicking on eye icon", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const billsContainer = new Bills({
        document,
        onNavigate: () => {},
        store: null,
        localStorage: window.localStorage,
      });
    
      const iconEye = screen.getAllByTestId("icon-eye")[0];
      const billUrl = iconEye.getAttribute("data-bill-url");
    
      // Créer un mock pour la fonction modal de jQuery
      const modalMock = jest.fn();
      $.fn.modal = modalMock;
    
      const handleClickIconEye = jest.fn(() =>
        billsContainer.handleClickIconEye(iconEye)
      );
      iconEye.addEventListener("click", handleClickIconEye);
      userEvent.click(iconEye);
    
      expect(handleClickIconEye).toHaveBeenCalled();
      expect(modalMock).toHaveBeenCalledWith("show");
      expect(document.querySelector(".modal")).toBeTruthy();
      expect(document.querySelector(".modal img").getAttribute("src")).toBe(billUrl);
    });
  });
});