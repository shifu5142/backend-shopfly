import { detectBot, fixedWindow, shield } from '@arcjet/nest';

export const arcjetConfig = {
  key: process.env.ARCJET_KEY!,

  rules: [
    shield({
      mode: 'LIVE',
    }),

    detectBot({
      mode: 'LIVE',
      allow: ['CATEGORY:SEARCH_ENGINE'],
    }),

    fixedWindow({
      mode: 'LIVE',
      window: '60s',
      max: 2,
    }),
  ],
};
