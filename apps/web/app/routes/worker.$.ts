// Catch-all route for Remotion worker files
// This prevents 404 errors for worker-*.js files in development
export async function loader() {
  return new Response('', {
    status: 204,
    headers: {
      'Content-Type': 'application/javascript',
    },
  });
}
