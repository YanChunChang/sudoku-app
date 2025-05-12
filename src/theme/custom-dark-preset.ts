import { definePreset } from '@primeng/themes';
import Lara from '@primeng/themes/Lara';

export const CustomDarkPreset = definePreset(Lara, {
  semantic: {
      primary: {
          50: '{cyan.50}',
          100: '{cyan.100}',
          200: '{cyan.200}',
          300: '{cyan.300}',
          400: '{cyan.400}',
          500: '{cyan.500}',
          600: '{cyan.600}',
          700: '{cyan.700}',
          800: '{cyan.800}',
          900: '{cyan.900}',
          950: '{cyan.950}'
      },
      colorScheme: {
          light: {
              primary: {
                  color: '{cyan.950}',
                  inverseColor: '#ffffff',
                  hoverColor: '{cyan.900}',
                  activeColor: '{cyan.800}'
              },
              highlight: {
                  background: '{cyan.950}',
                  focusBackground: '{cyan.700}',
                  color: '#ffffff',
                  focusColor: '#ffffff'
              }
          },
          dark: {
              primary: {
                  color: '{cyan.50}',
                  inverseColor: '{cyan.950}',
                  hoverColor: '{cyan.100}',
                  activeColor: '{cyan.200}'
              },
              highlight: {
                  background: 'rgba(51, 100, 120, 0.5)',
                  focusBackground: 'rgba(250, 250, 250, .24)',
                  color: 'rgba(67, 14, 14, 0.87)',
                  focusColor: 'rgba(255,255,255,.87)'
              }
          }
      },
      text: {
        900: '#ffffff',
        800: '#dddddd'
      },
      surface: {
        0: '#1e1e1e',   // background
        50: '#2a2a2a',  // component surface
        100: '#3a3a3a'  // e.g. cards
      }
  }
});

export default CustomDarkPreset;