// eslint-disable-next-line
import { render } from "@testing-library/react/pure";
// import SidebarWidget from "./index";

test("Dummy test case", () => {
  expect(true).toBeTruthy();
});

// ID attribute of all the elements in config screen.
// const sidebarWidgetUIElementsIDs = [
//   '<idOfElementInSidebarWidgetScreen>'
// ];

// let sidebarWidgetRenderedDOM: any = null;
// beforeAll(async () => {
//   sidebarWidgetRenderedDOM = render(<SidebarWidget />);
// });

// describe(`UI Elements of Sidebar Widget Screen`, () => {
//   sidebarWidgetUIElementsIDs.forEach((id: String) => {
//     test(`Rendered ${id} element`, () => {
//       expect(
//         sidebarWidgetRenderedDOM?.
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
//   const inputElement = sidebarWidgetRenderedDOM?.container?.querySelector('#idOfDOMElement');
//   fireEvent.click(inputElement);
//   fireEvent.keyPress(inputElement);
//   fireEvent.keyDown(inputElement);
//   fireEvent.keyUp(inputElement);
// });
