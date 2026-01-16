import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
// import { useSocketStore } from './store/useSocketStore';
// import { useSocket } from './hooks/useSocket';
// import { requestNotificationPermission } from './hooks/useSocket';

function App() {
  // const { connect } = useSocketStore();

  useEffect(() => {
    // Initialize socket connection
    // connect();

    // Request notification permission
    // requestNotificationPermission();

    return () => {
      // Cleanup handled in socket store
    };
  }, []);

  // Initialize socket hooks for admin
  // useSocket();

  return <RouterProvider router={router} />;
}

export default App;