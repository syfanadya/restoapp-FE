import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import api from "../api";

// Tipe respons API
interface LoginResponse {
  meta: {
    code: number;
    status: string;
    message: string;
  };
  result: {
    access_token: string;
    token_type: string;
    user: {
      id: number;
      name: string;
      email: string;
      email_verified_at: string | null;
      created_at: string;
      updated_at: string;
      roles: Array<{
        id: number;
        name: string;
        guard_name: string;
        created_at: string;
        updated_at: string;
      }>;
    };
  };
}

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post<LoginResponse>("/login", { email, password });

      const token = res.data?.result?.access_token;
      const user = res.data?.result?.user;

      if (!token || !user) {
        setError("Login failed: token or user data not received");
        return;
      }

      // Simpan token dan user ke localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect ke dashboard
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
    >
      <Card sx={{ width: 400, boxShadow: 5, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom color="primary">
            RestoApp
          </Typography>
          <Typography variant="h6" align="center" gutterBottom>
            Login
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <TextField
              fullWidth
              margin="normal"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
