module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Usuńmy plugin react-native-reanimated, jeśli nie jest potrzebny w wersji webowej
    // plugins: ['react-native-reanimated/plugin'],
  };
};