export function getAccessToken() {
  return localStorage.getItem('accessToken');
}

export function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

export function setAccessToken(token: string) {
  localStorage.setItem('accessToken', token);
}

export function setRefreshToken(token: string) {
  localStorage.setItem('refreshToken', token);
}

export function setUserInfo(user: any) {
  localStorage.setItem('userInfo', JSON.stringify(user));
}

export function getUserInfo() {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    try {
      return JSON.parse(userInfo);
    } catch (error) {
      console.error('Error parsing user info from localStorage:', error);
      return null;
    }
  }
  return null;
}

export function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userInfo');
}
