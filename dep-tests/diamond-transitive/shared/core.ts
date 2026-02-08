import { chunk } from "lodash";
import { makeLeaf } from "./leaf";

export const sharedCore = `${makeLeaf("core")}:${chunk(["a", "b"], 1).length}`;
