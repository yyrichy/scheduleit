import { scrapeSections } from '../app/utils/sectionScraper';

scrapeSections()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Scraping failed:', error);
    process.exit(1);
  });