// Module repo directories (relative to the panacea-sourcecode root, or absolute).
// Ticketing lands in M4; only admin is wired for M3.
export const modulePaths: string[] = process.env.MODULES_PATH
  ? process.env.MODULES_PATH.split(',')
  : ['panacea-admin'];
