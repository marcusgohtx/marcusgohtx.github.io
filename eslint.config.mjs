import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [...nextVitals, { ignores: ['schedular/**', 'ikigai-for-humanity/**', 'results-reporter/**', '.migration/**', 'out/**', '.next/**', 'next-env.d.ts'] }];

export default config;
