import { execSync } from 'node:child_process';
import util from 'node:util'

export default async function sh({ text }) {
  try {
    return execSync(text, { encoding: "utf8" }).replaceAll("@", "\\@");
  } catch (e) {
    return e.stderr + e.stdout
  }
}
