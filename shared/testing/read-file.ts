import { readFileSync } from "node:fs";
import { join } from "node:path";

export const read = (...parts: string[]) => readFileSync(join(process.cwd(), ...parts), "utf8");
