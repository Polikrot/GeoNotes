const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Dodaj alias dla react-native-maps
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native-maps': 'react-native-web-maps',
  };

  // Dodaj polyfill dla expo-location
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "expo-location": require.resolve("expo-location/src/ExpoLocation.web.ts"),
  };

  return config;
};