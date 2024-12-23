/**
 * @jest-environment jsdom
 */

import {screen, waitFor, fireEvent} from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js";
import { formatDate, formatStatus } from "../app/format.js";

import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

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

      // Définir la navigation
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

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

describe("When Bills page is initialized", () => {
  test("Then event listeners should be attached", () => {
    document.body.innerHTML = BillsUI({ data: [] });
    const onNavigate = jest.fn();
    const billsPage = new Bills({
      document,
      onNavigate,
      store: null,
      localStorage: window.localStorage,
    });

    const newBillButton = screen.getByTestId("btn-new-bill");
    newBillButton.click();

    expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["NewBill"]);
  });
});

describe("When there are bills", () => {
  test("Then the bills should be displayed in the table", () => {
    const billsData = [
      {
        type: "Transports",
        name: "Train Paris-Lyon",
        date: "2024-06-01",
        amount: 100,
        status: "accepted",
        fileUrl: "test-url",
      },
    ];

    document.body.innerHTML = BillsUI({ data: billsData });

    const rows = screen.getAllByRole("row");
    expect(rows.length).toBe(2); // Une ligne pour le header + une ligne de données

    expect(screen.getByText("Train Paris-Lyon")).toBeTruthy();
    expect(screen.getByText("100 €")).toBeTruthy();
    expect(screen.getByText("accepted")).toBeTruthy();
  });
});



jest.mock("../app/format.js"); // Mock des fonctions formatDate et formatStatus

describe("Given I am connected as an Employee and I am on Bills page", () => {
  describe("When getBills is called and formatDate throws an error", () => {
    test("Then it should log the error and return unformatted data", async () => {
      // Mock console.log pour vérifier son appel
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      // Mock de store avec des données corrompues
      const store = {
        bills: jest.fn(() => ({
          list: jest.fn(() =>
            Promise.resolve([
              { id: "1", date: "invalid-date", status: "pending" },
            ])
          ),
        })),
      };

      // Mock formatDate pour provoquer une erreur
      formatDate.mockImplementation(() => {
        throw new Error("Invalid date format");
      });

      // Mock formatStatus pour retourner la valeur brute (le statut brut)
      formatStatus.mockImplementation((status) => status);

      // Instanciation de Bills
      const billsPage = new Bills({
        document,
        onNavigate: jest.fn(),
        store,
        localStorage: window.localStorage,
      });

      // Appel de getBills
      const result = await billsPage.getBills();

      // Vérifie que console.log est appelé avec l'erreur et les données corrompues
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.any(Error),
        "for",
        { id: "1", date: "invalid-date", status: "pending" }
      );

      // Vérifie que les données non formatées sont retournées
      expect(result).toEqual([
        {
          id: "1",
          date: "invalid-date", // Retourne la date non formatée
          status: "pending", // Statut non formaté (ceci est maintenant correct)
        },
      ]);

      // Nettoyage
      consoleSpy.mockRestore();
    });
  });
});