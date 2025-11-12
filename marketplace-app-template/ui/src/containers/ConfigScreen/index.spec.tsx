import React from "react";
import { render } from "@testing-library/react/pure";
import ConfigScreen from "./index";

// ID attribute of all the elements in config screen.
const configScreenUIElementsIDs = ["configField1Id", "configField2Id"];

let configScreenRenderedDOM: any = null;
beforeAll(async () => {
  configScreenRenderedDOM = render(<ConfigScreen />);
});

describe(`UI Elements of Config Screen`, () => {
  configScreenUIElementsIDs.forEach((id: String) => {
    test(`Rendered ${id} element`, () => {
      expect(
        configScreenRenderedDOM?.container?.querySelector(`#${id}`)
      ).toBeTruthy();
    });
  });
});
