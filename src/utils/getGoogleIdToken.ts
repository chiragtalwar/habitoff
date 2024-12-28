export async function getGoogleIdToken(): Promise<string> {
  try {
    console.log('Starting Google auth flow...');
    const manifest = chrome.runtime.getManifest();
    
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, async function(token) {
        if (chrome.runtime.lastError) {
          console.error('Auth error:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
          return;
        }
        
        if (!token) {
          console.error('No token returned');
          reject(new Error('No token returned'));
          return;
        }

        try {
          // Exchange the token for ID token
          const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: manifest.oauth2.client_id,
              grant_type: 'refresh_token',
              refresh_token: token,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to exchange token');
          }

          const data = await response.json();
          resolve(data.id_token);
        } catch (error) {
          console.error('Token exchange error:', error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Auth flow error:', error);
    throw error;
  }
} 