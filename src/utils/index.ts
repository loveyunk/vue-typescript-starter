import { BASE_URL_DEV, BASE_URL_PRO } from './config';

export const getCurrentEnv = (): string => {
  switch (process.env.VUE_APP_ONO_ENV) {
    case 'development':
      return BASE_URL_DEV;
    case 'production':
      return BASE_URL_PRO;
    default:
      return '';
  }
};
