// Country list for form dropdowns.
// Per the Legacy Lab brief, African countries are listed first, then the
// rest of the world alphabetically. A single flat array keeps <option>
// rendering simple; the divider is a non-selectable label.

export const AFRICAN_COUNTRIES = [
    'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi',
    'Cabo Verde', 'Cameroon', 'Central African Republic', 'Chad', 'Comoros',
    'Congo (Brazzaville)', 'Congo (DRC)', "Côte d'Ivoire", 'Djibouti', 'Egypt',
    'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon', 'The Gambia',
    'Ghana', 'Guinea', 'Guinea-Bissau', 'Kenya', 'Lesotho', 'Liberia', 'Libya',
    'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco',
    'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda',
    'São Tomé and Príncipe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia',
    'South Africa', 'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia',
    'Uganda', 'Zambia', 'Zimbabwe',
] as const;

export const OTHER_COUNTRIES = [
    'Afghanistan', 'Albania', 'Andorra', 'Argentina', 'Armenia', 'Australia',
    'Austria', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Belarus', 'Belgium',
    'Bolivia', 'Bosnia and Herzegovina', 'Brazil', 'Bulgaria', 'Cambodia',
    'Canada', 'Chile', 'China', 'Colombia', 'Costa Rica', 'Croatia', 'Cuba',
    'Cyprus', 'Czechia', 'Denmark', 'Dominican Republic', 'Ecuador',
    'El Salvador', 'Estonia', 'Finland', 'France', 'Georgia', 'Germany',
    'Greece', 'Guatemala', 'Honduras', 'Hungary', 'Iceland', 'India',
    'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica',
    'Japan', 'Jordan', 'Kazakhstan', 'Kuwait', 'Latvia', 'Lebanon',
    'Lithuania', 'Luxembourg', 'Malaysia', 'Maldives', 'Malta', 'Mexico',
    'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Nepal', 'Netherlands',
    'New Zealand', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Panama',
    'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania',
    'Russia', 'Saudi Arabia', 'Serbia', 'Singapore', 'Slovakia', 'Slovenia',
    'South Korea', 'Spain', 'Sri Lanka', 'Sweden', 'Switzerland', 'Syria',
    'Taiwan', 'Thailand', 'Trinidad and Tobago', 'Turkey', 'Ukraine',
    'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay',
    'Uzbekistan', 'Venezuela', 'Vietnam', 'Yemen',
] as const;

export const COUNTRY_OPTIONS: string[] = [...AFRICAN_COUNTRIES, ...OTHER_COUNTRIES];
