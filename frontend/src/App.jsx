import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { WorkspaceProvider } from "./contexts/WorkspaceContext";
import Routes from "./Routes";

function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <Routes />
      </WorkspaceProvider>
    </AuthProvider>
  );
}

export default App;