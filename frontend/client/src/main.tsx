import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import "./index.css";
import "./styles/custom.css"; // Import custom styles
import "./styles/animate.css"; // Import animation styles
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <ToastContainer position="top-right" autoClose={3000} />
  </QueryClientProvider>
);
