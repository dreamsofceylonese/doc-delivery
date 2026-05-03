const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    "postcss-preset-env": {
      stage: 2,
      features: {
        'lab-function': true,
      },
    },
  },
};

export default config;
