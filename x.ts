import { getDependencies } from "./get-dependencies";
(async () => {
  const deps = await getDependencies("./a.ts");
  console.log(deps);
})();
