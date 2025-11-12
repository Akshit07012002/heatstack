import { TypePopupWindowDetails } from "../types";

const filterFetchedArray = (array: any[]) => {
  const tempFetchedList = [...array];
  const fetchedList = Array.from(new Set(tempFetchedList.map((a) => a.id))).map(
    (id) => tempFetchedList.find((a) => a.id === id)
  );
  return fetchedList;
};

const popupWindow = (windowDetails: TypePopupWindowDetails) =>
  window.open(
    windowDetails.url,
    windowDetails.title,
    `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${
      windowDetails.w
    }, height=${windowDetails.h}, top=${
      window.screen.height / 2 - windowDetails.h / 2
    }, left=${window.screen.width / 2 - windowDetails.w / 2}`
  );

const mergeObjects = (target: any, source: any) => {
  // Iterate through `source` properties and if an `Object` then
  // set property to merge of `target` and `source` properties
  Object.keys(source)?.forEach((key) => {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], mergeObjects(target[key], source[key]));
    }
  });

  // Join `target` and modified `source`
  Object.assign(target || {}, source);
  return target;
};
export default {
  popupWindow,
  filterFetchedArray,
  mergeObjects,
};
