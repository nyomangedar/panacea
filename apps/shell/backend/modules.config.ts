export const modulePaths: string[] = process.env.MODULES_PATH
  ? process.env.MODULES_PATH.split(',')
  : ['../../panacea-admin', '../../panacea-ticketing'];
