import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';
import { AuthProvider } from "react-oidc-context";
import App from './App.tsx'
import { Provider } from 'react-redux'
import { store } from './store/Store.ts'

const cognitoAuthConfig = {
  authority: import.meta.env.VITE_COGNITO_AUTHORITY,
  client_id: import.meta.env.VITE_CLIENT_ID,
  redirect_uri: "https://www.cloudshop.click/auth/callback",
  response_type: "code",
  scope: "email openid profile",
};

createRoot(document.getElementById('root')!).render(
  
  <StrictMode>
  <Provider store={store}>
    <AuthProvider {...cognitoAuthConfig}>
      <App/>
    </AuthProvider>
  </Provider>
  </StrictMode>,
  
)
