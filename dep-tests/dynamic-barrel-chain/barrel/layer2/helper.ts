import { camelCase } from "lodash";
import { tokenPrefix } from "../shared/token";

export const helperToken = `${tokenPrefix}-${camelCase("barrel helper")}`;
