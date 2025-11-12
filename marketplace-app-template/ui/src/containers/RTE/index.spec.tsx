// eslint-disable-next-line
import { render } from "@testing-library/react/pure";
// import RTE from "./index";

test("Dummy test case", () => {
  expect(true).toBeTruthy();
});

// ID attribute of all the elements in config screen.
// const rteUIElementsIDs = [
//   '<idOfElementInRTEScreen>'
// ];

// let rteRenderedDOM: any = null;
// beforeAll(async () => {
//   rteRenderedDOM = render(<RTE />);
// });

// describe(`UI Elements of RTE Screen`, () => {
//   rteUIElementsIDs.forEach((id: String) => {
//     test(`Rendered ${id} element`, () => {
//       expect(
//         rteRenderedDOM?.
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
//   const inputElement = rteRenderedDOM?.container?.querySelector('#idOfDOMElement');
//   fireEvent.click(inputElement);
//   fireEvent.keyPress(inputElement);
//   fireEvent.keyDown(inputElement);
//   fireEvent.keyUp(inputElement);
// });
