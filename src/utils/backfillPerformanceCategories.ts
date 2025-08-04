import { getAllQuizResponses, getPerformanceCategory } from '../services/responseService';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Utility function to backfill performance categories for existing quiz responses
 * that don't have the performanceCategory field set
 */
export const backfillPerformanceCategories = async (): Promise<void> => {
  try {
    console.log('Starting backfill of performance categories...');
    
    // Get all quiz responses
    const responses = await getAllQuizResponses();
    
    // Filter responses that don't have performanceCategory set
    const responsesToUpdate = responses.filter(response => 
      !response.performanceCategory && response.percentage !== undefined
    );
    
    console.log(`Found ${responsesToUpdate.length} responses to update`);
    
    if (responsesToUpdate.length === 0) {
      console.log('No responses need updating');
      return;
    }
    
    // Update each response with the correct performance category
    const updatePromises = responsesToUpdate.map(async (response) => {
      if (!response.id || !db) return;
      
      const performanceCategory = getPerformanceCategory(response.percentage);
      const responseRef = doc(db, 'quizResponses', response.id);
      
      return updateDoc(responseRef, {
        performanceCategory
      });
    });
    
    await Promise.all(updatePromises);
    
    console.log(`Successfully updated ${responsesToUpdate.length} responses with performance categories`);
  } catch (error) {
    console.error('Error backfilling performance categories:', error);
    throw error;
  }
};
