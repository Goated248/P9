/**
 * @jest-environment jsdom
 */

import {screen, waitFor, fireEvent} from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js";


import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains('active-icon')).toBe(true)


    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => b - a
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})


//verifie l'affichage d'une modale lorsque l'on clique sur l'icone "eye"
describe("Given I am connected as an Employee and I am on Bills page", () => {
  describe("When I click on the eye icon", () => {
    beforeAll(() => {
      // Mock de la méthode modal de Bootstrap
      $.fn.modal = jest.fn();
    });

    test("Then a modal should open", () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));

      // Initialiser le DOM avec BillsUI
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;


      // Initialiser Bills
      const store = null;
      const billsPage = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      // Mock de handleClickIconEye
      const handleClickIconEye = jest.fn((icon) => billsPage.handleClickIconEye(icon));

      // Récupérer et simuler le clic sur l'icône Eye
      const eyeIcons = screen.getAllByTestId("icon-eye");
      const eyeIcon = eyeIcons[0];
      eyeIcon.addEventListener("click", () => handleClickIconEye(eyeIcon));
      userEvent.click(eyeIcon);

      // Vérifier que la méthode a bien été appelée
      expect(handleClickIconEye).toHaveBeenCalled();

      // Vérifier que la modale est affichée
      expect($.fn.modal).toHaveBeenCalled();
    });
  });
});

describe("Given I am connected as an Employee and I am on Bills page", () => {
  describe("When I click on 'Nouvelle note de frais'", () => {
    test("Then I should be redirected to the NewBill page", () => {
      // Mock localStorage et définir le type d'utilisateur
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));

      // Initialiser le DOM avec BillsUI
      const html = BillsUI({ data: [] });
      document.body.innerHTML = html;

      // Mock de la fonction de navigation
      const onNavigate = jest.fn();

      // Initialiser Bills
      const billsPage = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      // Récupérer le bouton "Nouvelle note de frais"
      const newBillButton = screen.getByTestId("btn-new-bill");
      expect(newBillButton).toBeTruthy();

      // Simuler le clic sur le bouton
      newBillButton.addEventListener("click", billsPage.handleClickNewBill);
      fireEvent.click(newBillButton);

      // Vérifier que la navigation a été appelée avec la bonne route
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["NewBill"]);
    });
  });
});





//TEST GET


describe("Given I am connected as an employee", () => {
  describe("When I navigate to Bills", () => {
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", { value: localStorageMock });
        window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });

      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
      const message = await screen.getAllByText(/Erreur 404/)
      expect(message).toBeTruthy()
      });

      test("fetches bills from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
      const message = await screen.getAllByText(/Erreur 500/)
      expect(message).toBeTruthy()
      });
    });
  });
});