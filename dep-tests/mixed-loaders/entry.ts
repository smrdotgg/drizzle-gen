import { renderComponent } from "./component.tsx";
import data from "./data.json";
import { cjsValue } from "./esm-wrapper.mjs";

console.log(renderComponent(), data.name, cjsValue);
