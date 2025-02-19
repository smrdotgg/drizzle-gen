import prettier from "prettier";

const jsCode = `
                    function myFunction(arg1,arg2) {// Some complex logic here
    if(arg1> 10){console.log("Arg1 is greater than 10");
    }
    return arg1   + arg2;
  }
`;

async function formatCode(code) {
  try {
    const formattedCode = await prettier.format(code, {
      parser: "typescript",

    });
    console.log(formattedCode);
  } catch (error) {
    console.error("Error formatting code:", error);
  }
}

formatCode(jsCode);
