/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#17202D',
    tint: '#C47D3B',
    background: '#F6F7F9',
    foreground: '#17202D',
    card: '#FFFFFF',
    cardForeground: '#17202D',
    primary: '#C47D3B',
    primaryForeground: '#FFFFFF',
    secondary: '#E9EDF2',
    secondaryForeground: '#334154',
    muted: '#EEF1F5',
    mutedForeground: '#728096',
    accent: '#E8EEF7',
    accentForeground: '#3B5C89',
    destructive: '#C84D4D',
    destructiveForeground: '#FFFFFF',
    border: '#DDE3EA',
    input: '#DDE3EA',
    navy: '#17202D',
    silver: '#A8B4C3',
    success: '#3B866D',
  },
  dark: {
    text: '#F3F5F8',
    tint: '#D79A5B',
    background: '#121820',
    foreground: '#F3F5F8',
    card: '#1B2430',
    cardForeground: '#F3F5F8',
    primary: '#D79A5B',
    primaryForeground: '#17202D',
    secondary: '#273342',
    secondaryForeground: '#D9E1EA',
    muted: '#202B38',
    mutedForeground: '#99A9BC',
    accent: '#243950',
    accentForeground: '#BFD2EA',
    destructive: '#E27676',
    destructiveForeground: '#221214',
    border: '#2B3949',
    input: '#354557',
    navy: '#0D141D',
    silver: '#C6D0DD',
    success: '#6FC0A0',
  },
  radius: 14,
};

export default colors;
