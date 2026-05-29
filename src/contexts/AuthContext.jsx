import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
const AuthContext = createContext(null);

// Native lightweight JWT decoder
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);
    const id = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || payload.sub || payload.nameid;
    const email = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || payload.email;
    const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"] || payload.role;
    
    return { 
      id: parseInt(id), 
      email, 
      role: role ? role.toLowerCase() : '' 
    };
  } catch (e) {
    return null;
  }
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async (token) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const profile = await res.json();
        setUser(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            name: profile.name || profile.Name || prev.name || '',
            legalAddress: profile.legalAddress || profile.LegalAddress || prev.legalAddress || '',
            physicalAddress: profile.physicalAddress || profile.PhysicalAddress || profile.actualAddress || profile.ActualAddress || prev.physicalAddress || '',
            phone: profile.phone || profile.Phone || profile.phoneNumber || profile.PhoneNumber || prev.phone || '',
            email: profile.email || profile.Email || prev.email || '',
            isVerified: profile.isVerified !== undefined ? profile.isVerified : (profile.IsVerified !== undefined ? profile.IsVerified : prev.isVerified),
            hasDocument: profile.hasDocument !== undefined ? profile.hasDocument : (profile.HasDocument !== undefined ? profile.HasDocument : prev.hasDocument || false),
            totalHelped: profile.totalHelped !== undefined ? profile.totalHelped : (profile.TotalHelped !== undefined ? profile.TotalHelped : prev.totalHelped || 0),
            activeRequests: profile.activeRequests || profile.ActiveRequests || prev.activeRequests || [],
            avatar: profile.avatar !== undefined ? profile.avatar : (profile.Avatar !== undefined ? profile.Avatar : prev.avatar || null),
            avatarContentType: profile.avatarContentType !== undefined ? profile.avatarContentType : (profile.AvatarContentType !== undefined ? profile.AvatarContentType : prev.avatarContentType || null)
          };
        });
      }
    } catch (err) {
      console.error("Не удалось загрузить детальный профиль с бэкенда:", err);
    }
  };

  // Load session from localStorage on startup
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = parseJwt(token);
        if (decoded) {
          setIsLoggedIn(true);
          setUser({
            ...decoded,
            isVerified: decoded.role === 'shelter' ? false : true,
            hasDocument: false,
            activeRequests: []
          });
          await fetchMe(token);
        } else {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (token) => {
    localStorage.setItem('token', token);
    const decoded = parseJwt(token);
    if (decoded) {
      setIsLoggedIn(true);
      setUser({
        ...decoded,
        isVerified: decoded.role === 'shelter' ? false : true,
        hasDocument: false,
        activeRequests: []
      });
      await fetchMe(token);
    }
  };

  const takeRequest = () => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchMe(token);
    }
  };

  const updateUser = async (newData) => {
    if (user) {
      setUser(prev => ({
        ...prev,
        ...newData
      }));

      const hasProfileFields = Object.keys(newData).some(key => 
        ['name', 'legalAddress', 'physicalAddress', 'phone', 'email', 'password'].includes(key)
      );

      if (!hasProfileFields) {
        return;
      }

      try {
        const token = localStorage.getItem('token');
        
        const payload = {
          name: newData.name !== undefined ? newData.name : user.name,
          legalAddress: newData.legalAddress !== undefined ? newData.legalAddress : user.legalAddress,
          physicalAddress: newData.physicalAddress !== undefined ? newData.physicalAddress : user.physicalAddress,
          phone: newData.phone !== undefined ? newData.phone : user.phone,
          email: newData.email !== undefined ? newData.email : user.email,
          password: newData.password || undefined
        };

        await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.error("Ошибка при сохранении профиля на сервере:", err);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, takeRequest, updateUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
