/* 
This is a sample test cases to test our index.js file. 
Here, there are two methods to test our handler function in index.js : 
1) comparing actual and returned data
2) Mocking our handler function(this is commented out, check bellow)
*/

const app = require("../index");

test("Sample test in Jest", () => {
  expect(true).toBe(true);
});

test("testing our API endpoint", async () => {
  const event = {
    queryStringParameters: {
      name: "Contentstack",
    },
    key: {},
  };

  const actualData = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event.queryStringParameters),
  };

  const returnValue = await app.handler(event);

  expect(returnValue).toStrictEqual(actualData);
});

/*
jest.mock('../index');

test('testing our API endpoint with "Mocking"', async() => {

    const mockedData = {
        statusCode: 200
    };
    app.handler.mockResolvedValue(mockedData);

    const event = {
        queryStringParameters: {
            name: 'Contentstack'
        },
        key: {}
    };

    const actualData = await app.handler(event);

    expect(actualData).toBe(mockedData);
});
*/
