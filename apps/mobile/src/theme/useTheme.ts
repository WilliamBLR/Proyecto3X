import { useColorScheme } from 'react-native';

const light = {
  background: '#F4F6F8', surface: '#FFFFFF', text: '#142C36',
  muted: '#526671', primary: '#146B50', onPrimary: '#FFFFFF',
  border: '#DAE3E7', soft: '#E3F2EB',
};
const dark: typeof light = {
  background: '#101A20', surface: '#1B2931', text: '#F3F7F8',
  muted: '#B4C6CF', primary: '#9CE9BE', onPrimary: '#103826',
  border: '#354852', soft: '#223F34',
};

export function useTheme() {
  const isDark = useColorScheme() === 'dark';
  return { colors: isDark ? dark : light, isDark };
}
