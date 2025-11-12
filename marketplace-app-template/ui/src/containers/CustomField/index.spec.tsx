// eslint-disable-next-line
import { render } from "@testing-library/react/pure";
// import CustomField from "./index";

test("Dummy test case", () => {
  expect(true).toBeTruthy();
});

// ID attribute of all the elements in config screen.
// const customFieldUIElementsIDs = [
//   '<idOfElementInCustomFieldScreen>'
// ];

// let customFieldRenderedDOM: any = null;
// beforeAll(async () => {
//   customFieldRenderedDOM = render(<CustomField />);
// });

// describe(`UI Elements of Custom Field Screen`, () => {
//   customFieldUIElementsIDs.forEach((id: String) => {
//     test(`Rendered ${id} element`, () => {
//       expect(
//         customFieldRenderedDOM?.
//           container?.
//           querySelector(`#${id}`)
//       ).toBeTruthy();
//     });
//   });
// });

// describe(`Functional test cases`, () => {
//   List out all the functional test cases if any
//   For firing various events on HTML DOM Elements,
//   use functions like:
//   const inputElement = customFieldRenderedDOM?.container?.querySelector('#idOfDOMElement');
//   fireEvent.click(inputElement);
//   fireEvent.keyPress(inputElement);
//   fireEvent.keyDown(inputElement);
//   fireEvent.keyUp(inputElement);
// });
