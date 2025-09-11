#!/usr/bin/env node

import parser from "yargs-parser";

import { processHTML } from "./data.js";
import { fetchLifeList } from "./network.js";

const args = parser(process.argv.slice(2) || "", {
  boolean: ["verbose"],
  alias: { verbose: "v" },
  string: ["username", "password"],
  envPrefix: "LISTEBIRD_",
});

if (!args.username)
  throw new Error(
    `Provide your ebird username either as a flag (--username birb) or an environment variable (LISTEBIRD_USERNAME=birb).`
  );
if (!args.password)
  throw new Error(
    `Provide your ebird password either as a flag (--password secrecy) or an environment variable (LISTEBIRD_PASSWORD=secrecy).`
  );

console.log(JSON.stringify(processHTML(await fetchLifeList(args)), null, 2));
