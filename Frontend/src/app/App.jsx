import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './store';
import AppRoutes from './routes';
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}
