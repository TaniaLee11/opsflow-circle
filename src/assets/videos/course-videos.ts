// Course video assets - imported as ES6 modules for bundling
import ideationValidation from './lesson-ideation-validation.mp4';
import moneyTaxes from './lesson-money-taxes.mp4';
import brandBuilding from './lesson-brand-building.mp4';

export const courseVideos = {
  'ideation-validation': ideationValidation,
  'money-taxes': moneyTaxes,
  'brand-building': brandBuilding,
} as const;

export type CourseVideoKey = keyof typeof courseVideos;
