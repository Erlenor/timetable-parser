const GOOGLE_CLIENT_ID = CONFIG.GOOGLE_CLIENT_ID;

const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly profile email';

function getBasePath() {
  return window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
}

function initiateGoogleLogin() {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: getBasePath() + 'callback.html',
    response_type: 'token',
    scope: SCOPES,
    include_granted_scopes: 'true',
    state: 'login'
  });

  window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?' + params.toString();
}

// Picks up the token from the URL hash after Google redirects to callback.html
function handleOAuthRedirect() {
  const hash = window.location.hash.substring(1);
  if (!hash) return;

  const params = new URLSearchParams(hash);
  const token = params.get('access_token');
  const error = params.get('error');

  if (error) {
    window.location.replace(getBasePath() + 'index.html');
    return;
  }

  if (token) {
    const expiresIn = parseInt(params.get('expires_in') || '3600');
    const expiresAt = Date.now() + expiresIn * 1000;

    sessionStorage.setItem('goog_access_token', token);
    sessionStorage.setItem('goog_token_expires', expiresAt);

    window.location.replace(getBasePath() + 'app.html');
  }
}

function getToken() {
  const token = sessionStorage.getItem('goog_access_token');
  const expires = parseInt(sessionStorage.getItem('goog_token_expires') || '0');

  if (!token || Date.now() > expires) {
    signOut();
    return null;
  }
  return token;
}

function signOut() {
  sessionStorage.removeItem('goog_access_token');
  sessionStorage.removeItem('goog_token_expires');
  window.location.replace(getBasePath() + 'index.html');
}

handleOAuthRedirect();