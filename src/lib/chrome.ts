interface OAuth2Info {
  client_id: string;
  scopes: string[];
}

interface ChromeManifest {
  oauth2: OAuth2Info;
  // Add other manifest fields if needed
}

declare global {
  namespace chrome {
    namespace runtime {
      function getManifest(): ChromeManifest;
    }
    namespace identity {
      function launchWebAuthFlow(
        options: {
          url: string;
          interactive: boolean;
        },
        callback: (redirectUrl?: string) => void
      ): void;
      function clearAllCachedAuthTokens(callback: () => void): void;
      function getRedirectURL(): string;
      function getAuthToken(
        options: {
          interactive: boolean;
          scopes: string[];
        },
        callback: (token: string) => void
      ): void;
    }
  }
}

interface UserInfo {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

export async function getGoogleIdToken(): Promise<{ token: string; userInfo: UserInfo }> {
  try {
    console.log('Starting Google Auth Flow...');
    
    // First clear any cached tokens
    await new Promise<void>((resolve) => {
      chrome.identity.clearAllCachedAuthTokens(resolve);
    });

    const token = await new Promise<string>((resolve, reject) => {
      chrome.identity.getAuthToken({ 
        interactive: true,
        scopes: [
          'openid',
          'email',
          'profile'
        ]
      }, (token) => {
        if (chrome.runtime.lastError) {
          console.error('Auth error:', chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (!token) {
          console.error('No token received');
          reject(new Error('No token received'));
          return;
        }

        console.log('Successfully obtained token');
        resolve(token);
      });
    });

    // Get user info
    console.log('Fetching user info...');
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.status}`);
    }

    const userInfo = await response.json();
    console.log('Successfully fetched user info:', {
      email: userInfo.email,
      name: userInfo.name
    });

    return { token, userInfo };
  } catch (error) {
    console.error('Auth setup error:', error);
    throw error;
  }
}

export async function clearChromeToken(): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.identity.clearAllCachedAuthTokens(() => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
} 