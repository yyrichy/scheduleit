import { trainModel } from '../app/utils/modelTrainer.js';

async function main() {
  // Verify environment variables
  if (!process.env.HUGGINGFACE_API_KEY) {
    console.error('❌ HUGGINGFACE_API_KEY is not set in environment variables');
    console.log('Please ensure your .env.local file contains a valid API key');
    process.exit(1);
  }

  console.log('Starting model training...');
  console.log('Using HF API Key:', process.env.HUGGINGFACE_API_KEY.slice(0, 8) + '...');
  
  try {
    await trainModel();
    console.log('✅ Training complete!');
    console.log('✅ Vector store saved to course_vectors');
  } catch (error) {
    console.error('❌ Training failed:', error);
    process.exit(1);
  }
}

main();