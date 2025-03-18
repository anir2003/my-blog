/**
 * Simple middleware function to handle Next.js requests on Netlify
 * This helps with handling requests that might not be properly handled by the Next.js plugin
 */
exports.handler = async function(event, context) {
  // Log the request for debugging
  console.log('Netlify middleware received request:', event.path);
  
  // Just pass through to Next.js handler
  return {
    statusCode: 200,
    body: JSON.stringify({ 
      message: 'This request should be handled by Next.js',
      path: event.path 
    }),
  };
}; 