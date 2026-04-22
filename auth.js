const GOOGLE_CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';

const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly profile email';

function initiateGoogleLogin() {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: window.location.origin + '/index.html',
    response_type: 'token',
    scope: SCOPES,
    include_granted_scopes: 'true',
    state: 'login'
  });

  window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?' + params.toString();
}

// Runs on page load — picks up the token Google drops in the URL hash after redirect
function handleOAuthRedirect() {
  const hash = window.location.hash.substring(1);
  if (!hash) return;

  const params = new URLSearchParams(hash);
  const token = params.get('access_token');
  const error = params.get('error');

  if (error) {
    document.getElementById('status-msg').textContent = 'Login was cancelled or failed.';
    return;
  }

  if (token) {
    const expiresIn = parseInt(params.get('expires_in') || '3600');
    const expiresAt = Date.now() + expiresIn * 1000;

    sessionStorage.setItem('goog_access_token', token);
    sessionStorage.setItem('goog_token_expires', expiresAt);

    // Clean the token out of the URL bar
    history.replaceState(null, '', window.location.pathname);

    window.location.href = 'app.html';
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
  window.location.href = 'index.html';
}

handleOAuthRedirect();
