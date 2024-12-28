export async function getGoogleIdToken(): Promise<string> {
  try {
    const manifest = chrome.runtime.getManifest();
    const clientId = manifest.oauth2.client_id;
    const redirectUri = chrome.identity.getRedirectURL();
    
    const authParams = new URLSearchParams({
      client_id: clientId,
      response_type: 'id_token',
      redirect_uri: redirectUri,
      scope: manifest.oauth2.scopes.join(' '),
      nonce: crypto.randomUUID(),
      prompt: 'consent'
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${authParams.toString()}`;
    console.log('Starting auth flow with URL:', authUrl);

    const responseUrl = await new Promise<string>((resolve, reject) => {
      chrome.identity.launchWebAuthFlow(
        {
          url: authUrl,
          interactive: true
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('Chrome runtime error:', chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          if (!response) {
            console.error('No response from auth flow');
            reject(new Error('No response from auth flow'));
            return;
          }
          console.log('Got response URL:', response);
          resolve(response);
        }
      );
    });

    const hashParams = new URLSearchParams(responseUrl.split('#')[1]);
    const idToken = hashParams.get('id_token');
    
    if (!idToken) {
      throw new Error('No ID token found in response');
    }

    return idToken;
  } catch (error) {
    console.error('Failed to get Google ID token:', error);
    throw error;
  }
} 