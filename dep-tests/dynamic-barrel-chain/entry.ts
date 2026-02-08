import { barrelValue } from "./barrel";

export async function loadDynamicValue() {
  const dynamicModule = await import("./dynamic/module");
  return `${barrelValue}:${dynamicModule.dynamicValue}`;
}

void loadDynamicValue();
