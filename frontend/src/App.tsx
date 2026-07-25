import AppRoutes from './routes';
import { ToastContainer } from './components/common/ToastContainer';
import { ErrorBoundary } from './components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ToastContainer />
      <AppRoutes />
    </ErrorBoundary>
  );
}

export default App;
