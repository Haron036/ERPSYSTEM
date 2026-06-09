import { RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext"; 
import { getRouter } from "./router";

const queryClient = new QueryClient();
const router = getRouter();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider> 
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}