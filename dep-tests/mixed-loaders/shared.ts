import { kebabCase } from "lodash";
import nestedInfo from "./nested/info.json";

export const helperValue = kebabCase(`${nestedInfo.kind} helper`);
