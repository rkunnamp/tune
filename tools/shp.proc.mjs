import { execSync } from 'node:child_process';

const shp = async (node, args, ctx) => ({
  type: 'text',
  read: async () => {
    let result
    try {
      result =  execSync(args.trim(), { encoding: "utf8" })
    } catch (e) {
      result = e.stderr + e.stdout
    }
    return result.replaceAll("@", "\\@");
  }
})
export default shp;
