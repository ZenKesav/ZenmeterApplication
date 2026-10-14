import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { wsClient } from '../services/websocketService';
import { initialProducts, initialNotifications } from '../services/initialData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [currentShift, setCurrentShift] = useState(() => {
    try {
      const saved = sessionStorage.getItem('zenmeter_shift');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [selectedStageId, setSelectedStageIdState] = useState(() => {
    try {
      const saved = sessionStorage.getItem('zenmeter_selected_stage_id');
      if (saved === 'all') return 'all';
      return saved ? Number(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const setSelectedStageId = (id) => {
    let val = id;
    if (id !== 'all' && id !== null && id !== undefined && id !== '') {
      val = Number(id);
    }
    setSelectedStageIdState(val);
    if (val) {
      sessionStorage.setItem('zenmeter_selected_stage_id', String(val));
    } else {
      sessionStorage.removeItem('zenmeter_selected_stage_id');
    }
  };

  const [loading, setLoading] = useState(true);
  const [realtimeNotification, setRealtimeNotification] = useState(null);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [products, setProducts] = useState(initialProducts);
  const [notifications, setNotifications] = useState(initialNotifications);

  const toggleSidebar = () => setIsCollapsed(prev => !prev);
  const toggleMobileSidebar = () => setIsMobileOpen(prev => !prev);
  const closeMobileSidebar = () => setIsMobileOpen(false);

  const addProduct = (newProd) => {
    const createdProduct = {
      id: Date.now(),
      code: newProd.code || `PRD${String(products.length + 1).padStart(3, '0')}`,
      name: newProd.name,
      category: newProd.category || 'Metering',
      brand: newProd.brand || 'Zenmeter',
      price: parseFloat(newProd.price) || 0,
      unit: newProd.unit || 'pcs',
      quantity: parseInt(newProd.stock || newProd.quantity, 10) || 0,
      image: newProd.image || (initialProducts[0] && initialProducts[0].image),
      salesPercentage: 0,
      unitsSold: 0,
    };
    setProducts(prev => [createdProduct, ...prev]);
    return createdProduct;
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  useEffect(() => {
    const initAuth = async () => {
      // Clear legacy localStorage to enforce strict tab-scoped session control
      localStorage.removeItem('zenmeter_token');
      localStorage.removeItem('zenmeter_user');
      localStorage.removeItem('zenmeter_shift');

      const token = sessionStorage.getItem('zenmeter_token');
      if (token) {
        try {
          const res = await authService.getMe();
          setUser(res.user);
          setPermissions(res.permissions || []);
          if (res.currentShift) {
            setCurrentShift(res.currentShift);
          }
        } catch (err) {
          console.warn('Failed to validate session token:', err);
          authService.logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (user) {
      wsClient.connect();
      const unsubscribe = wsClient.subscribe((data) => {
        if (data.event && data.event !== 'CONNECTED') {
          setRealtimeNotification(data);
          setNotifications(prev => [
            {
              id: Date.now(),
              title: data.event,
              subtitle: data.message || JSON.stringify(data.data || {}),
              time: 'Just now',
              avatar: initialNotifications[0] ? initialNotifications[0].avatar : '',
            },
            ...prev
          ]);
          setTimeout(() => setRealtimeNotification(null), 4000);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  const login = async (employee_id, password) => {
    const res = await authService.login(employee_id, password);
    setUser(res.user);
    setPermissions(res.permissions || []);
    if (res.currentShift) {
      setCurrentShift(res.currentShift);
    }
    return res;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setPermissions([]);
    setCurrentShift(null);
    setSelectedStageId(null);
    sessionStorage.removeItem('zenmeter_selected_stage_id');
    wsClient.disconnect();
  };

  const updateProfile = (updatedFields) => {
    setUser(prev => {
      if (!prev) return prev;
      const newObj = { ...prev, ...updatedFields };
      try {
        sessionStorage.setItem('zenmeter_user', JSON.stringify(newObj));
      } catch (e) { }
      return newObj;
    });
  };

  const normalizeRoleStr = (r) => (r || '').toUpperCase().replace(/\s+/g, '_');

  const hasPermission = (code) => {
    if (!user) return false;
    const normRole = normalizeRoleStr(user.role);
    if (normRole === 'ADMIN' || normRole.includes('ADMIN')) return true;
    return Array.isArray(permissions) && permissions.includes(code);
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    const normRole = normalizeRoleStr(user.role);
    return roles.some(r => {
      const target = normalizeRoleStr(r);
      if (normRole === target) return true;
      if (target === 'QC' && normRole.includes('QC')) return true;
      if (target === 'REPORT_VIEWER' && (normRole.includes('REPORT') || normRole.includes('VIEWER'))) return true;
      return normRole.includes(target) || target.includes(normRole);
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        updateProfile,
        permissions,
        currentShift,
        selectedStageId,
        setSelectedStageId,
        loading,
        login,
        logout,
        hasPermission,
        hasRole,
        realtimeNotification,
        isCollapsed,
        isMobileOpen,
        toggleSidebar,
        toggleMobileSidebar,
        closeMobileSidebar,
        products,
        notifications,
        addProduct,
        deleteProduct,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const useInventory = useAuth;
