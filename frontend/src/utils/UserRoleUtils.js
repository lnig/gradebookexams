import jwtDecode from 'jwt-decode';

export const getToken = () => {
  return localStorage.getItem('token');
};

export const getUserId = () => {
  return localStorage.getItem('userId');
};

export const decodeToken = (token) => {
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    return null;
  }
};

export const getUserRole = () => {
  const token = getToken();
  const decoded = decodeToken(token);
  if (decoded) {
    return decoded.role || decoded.Role || decoded.user?.role || null;
  }
  return null;
};