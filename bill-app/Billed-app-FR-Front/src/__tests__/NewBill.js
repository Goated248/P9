
/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen, fireEvent, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
//import mockStore from "../__mocks__/store";



// Mock de window.alert
jest.spyOn(window, 'alert').mockImplementation(() => {});

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then new bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId('icon-mail'));
      const mailIcon = screen.getByTestId('icon-mail');
      expect(mailIcon.classList.contains('active-icon')).toBe(true);
    });
  });
});




describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    test("Then an alert should be displayed if the file format is not correct", async () => {
      // Configuration initiale du test
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      // Créez un fichier avec une extension incorrecte (ex. .exe)
      const file = new File(["dummy content"], "test-file.exe", { type: "application/exe" });

      // Trouver l'élément d'upload du fichier
      const fileInput = screen.getByTestId("file");

      // Simuler l'événement de changement sur le champ d'input de fichier
      userEvent.upload(fileInput, file);

      // Attendre que l'alerte soit affichée
      await waitFor(() => expect(window.alert).toHaveBeenCalledTimes(1));

      // Vérifier que l'alerte a été appelée avec le message correct
      expect(window.alert).toHaveBeenCalledWith("Veuillez télécharger un fichier avec une extension jpg, jpeg ou png.");
    });
  });
});


//test POST

describe("When I fill out the form and click on send", () => {
  test("Then the form should be submitted", () => {
    // Mock des fonctions nécessaires
    const onNavigate = jest.fn();
    const store = {
      bills: jest.fn(() => ({
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({})
      }))
    };

    // Créer une instance de NewBill
    const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage });

    // Générer le DOM pour le formulaire
    const html = NewBillUI();
    document.body.innerHTML = html;

    // Mock de la méthode handleSubmit
    const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
    const form = screen.getByTestId("form-new-bill");

    // Attacher handleSubmit au formulaire
    form.addEventListener("submit", handleSubmit);

    // Simuler l'envoi du formulaire
    fireEvent.submit(form);

    // Vérifier que handleSubmit a été appelé
    expect(handleSubmit).toHaveBeenCalled();

    // Vérifier que onNavigate a été appelé avec le bon chemin
    expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
  });
});




describe("Given I am connected as an employee", () => {
  it("Then it should call store.bills().create and update fileUrl, fileName, and billId", async () => {

    const mockCreate = jest.fn().mockResolvedValue({ fileUrl: "http://test.com", key: "123"});
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
    // Mock the store
    const store = {
      bills: jest.fn(() => ({
        create: mockCreate,
      })),
    };

    const newBill = new NewBill({
      document,
      onNavigate: jest.fn(),
      store,
      localStorage: window.localStorage,
    });

    const inputFile = screen.getByTestId("file");
    const validFile = new File(["dummy content"], "test.jpg", { type: "image/jpeg" });

    fireEvent.change(inputFile, { target: { files: [validFile] } });
  
    // Assertions
    await waitFor(() => expect(store.bills().create).toHaveBeenCalled());
  
    expect(newBill.fileUrl).toBe("http://test.com");
    expect(newBill.billId).toBe("123");
  });
});




