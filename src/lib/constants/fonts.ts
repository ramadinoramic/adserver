export interface FontOption {
  family: string;
  label: string;
  weights: number[];
  source: 'google' | 'system';
}

export const AVAILABLE_FONTS: FontOption[] = [
  { family: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', weights: [400, 500, 600, 700, 800], source: 'google' },
  { family: 'Inter', label: 'Inter', weights: [400, 500, 600, 700, 800], source: 'google' },
  { family: 'Roboto', label: 'Roboto', weights: [400, 500, 700, 900], source: 'google' },
  { family: 'Open Sans', label: 'Open Sans', weights: [400, 600, 700, 800], source: 'google' },
  { family: 'Montserrat', label: 'Montserrat', weights: [400, 500, 600, 700, 800, 900], source: 'google' },
  { family: 'Poppins', label: 'Poppins', weights: [400, 500, 600, 700, 800, 900], source: 'google' },
  { family: 'Lato', label: 'Lato', weights: [400, 700, 900], source: 'google' },
  { family: 'Raleway', label: 'Raleway', weights: [400, 500, 600, 700, 800, 900], source: 'google' },
  { family: 'Oswald', label: 'Oswald', weights: [400, 500, 600, 700], source: 'google' },
  { family: 'Nunito', label: 'Nunito', weights: [400, 600, 700, 800, 900], source: 'google' },
  { family: 'Source Sans 3', label: 'Source Sans 3', weights: [400, 600, 700, 900], source: 'google' },
  { family: 'Rubik', label: 'Rubik', weights: [400, 500, 600, 700, 800, 900], source: 'google' },
  { family: 'Bebas Neue', label: 'Bebas Neue', weights: [400], source: 'google' },
  { family: 'Anton', label: 'Anton', weights: [400], source: 'google' },
  { family: 'Playfair Display', label: 'Playfair Display', weights: [400, 500, 600, 700, 800, 900], source: 'google' },
  { family: 'JetBrains Mono', label: 'JetBrains Mono', weights: [400, 500, 700], source: 'google' },
  { family: 'Arial', label: 'Arial', weights: [400, 700], source: 'system' },
  { family: 'Georgia', label: 'Georgia', weights: [400, 700], source: 'system' },
];

export const FONT_WEIGHTS = [
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi Bold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extra Bold' },
  { value: '900', label: 'Black' },
];

export const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=' +
  AVAILABLE_FONTS.filter((f) => f.source === 'google')
    .map((f) => `${f.family.replace(/ /g, '+')}:wght@${f.weights.join(';')}`)
    .join('&family=') +
  '&display=swap';
