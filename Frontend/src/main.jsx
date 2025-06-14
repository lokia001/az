import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store, persistor } from './store';
import App from './App.jsx';

// CSS imports
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import './styles/global.css';
import './index.css';

// i18n configuration
import './i18n';

const loadingMarkup = (
  <div className="py-4 text-center">
    <h3>Đang tải...</h3>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <Suspense fallback={loadingMarkup}>
      <App />
    </Suspense>
  </Provider>
);