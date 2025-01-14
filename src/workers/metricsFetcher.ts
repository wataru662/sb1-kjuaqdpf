import { fetchInstagramMetrics, storeMetrics } from '../services/instagram';

async function fetchAndStoreMetrics() {
  try {
    const metrics = await fetchInstagramMetrics();
    await storeMetrics(metrics);
    console.log('Successfully updated Instagram metrics');
  } catch (error) {
    console.error('Failed to update Instagram metrics:', error);
  }
}

// Run the fetch every hour
setInterval(fetchAndStoreMetrics, 60 * 60 * 1000);

// Initial fetch
fetchAndStoreMetrics();