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
    beforeEach(() => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
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
    test("Then bill icon in vertical layout should be highlighted", async () => {
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
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
      const handleClickIconEye = jest.fn(() =>
        billsContainer.handleClickIconEye(iconEye)
      );
      iconEye.addEventListener("click", handleClickIconEye);
      userEvent.click(iconEye);

      expect(handleClickIconEye).toHaveBeenCalled();
      expect(document.querySelector(".modal")).toBeTruthy();
      expect(document.querySelector(".modal img").getAttribute("src")).toBe(
        billUrl
      );
    });

    test("Then it should fetch bills from the mock store", async () => {
      const billsContainer = new Bills({
        document,
        onNavigate: () => {},
        store: mockStore,
        localStorage: window.localStorage,
      });

      const spyList = jest.spyOn(mockStore, "bills");
      const bills = await billsContainer.getBills();

      expect(spyList).toHaveBeenCalledTimes(1);
      expect(bills.length).toBe(4);
      expect(bills[0].date).toEqual(formatDate(bills[0].date));
      expect(bills[0].status).toEqual(formatStatus(bills[0].status));
    });
  });
});