// Mobile-specific utilities
import { formatPrice, validateEmail, generateId, debounce } from '../../../shared/utils';

// Re-export shared utilities
export { formatPrice, validateEmail, generateId, debounce };

// Mobile-specific utilities
export const getDeviceDimensions = () => {
  const { Dimensions } = require('react-native');
  return Dimensions.get('window');
};

export const isSmallScreen = () => {
  const dimensions = getDeviceDimensions();
  return dimensions.width < 375;
};

export const scaleFont = (size) => {
  const dimensions = getDeviceDimensions();
  const scale = dimensions.width / 375; // Based on iPhone 6/7/8 width
  return Math.round(size * scale);
};