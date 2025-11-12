// eslint-disable-next-line
import { render } from "@testing-library/react/pure";
// import DashboardWidget from "./index";

test("Dummy test case", () => {
  expect(true).toBeTruthy();
});

// ID attribute of all the elements in config screen.
// const dashboardWidgetUIElementsIDs = [
//   '<idOfElementInDashboardWidgetScreen>'
// ];

// let dashboardWidgetRenderedDOM: any = null;
// beforeAll(async () => {
//   dashboardWidgetRenderedDOM = render(<DashboardWidget />);
// });

// describe(`UI Elements of Dashboard Widget Screen`, () => {
//   dashboardWidgetUIElementsIDs.forEach((id: String) => {
//     test(`Rendered ${id} element`, () => {
//       expect(
//         dashboardWidgetRenderedDOM?.
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
//   const inputElement = dashboardWidgetRenderedDOM?.container?.querySelector('#idOfDOMElement');
//   fireEvent.click(inputElement);
//   fireEvent.keyPress(inputElement);
//   fireEvent.keyDown(inputElement);
//   fireEvent.keyUp(inputElement);
// });
