import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Card,
  Grid,
  Chip,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import api from "../api";

interface Food {
  id: number;
  name: string;
  category: string;
  price: string;
}

interface FoodResponse {
  status: string;
  message: string;
  data: {
    current_page: number;
    data: Food[];
  };
}


interface CreateOrderItemResponse {
  meta: {
    code: number;
    status: string;
    message: string;
  };
  result: {
    id: number;
    order_id: string;
    food_id: number;
    quantity: string;
    price: string;
    created_at: string;
    updated_at: string;
    food: Food;
    order: {
      id: number;
      customer_name: string;
      status: string;
      total_price: string;
      table_id: number;
      user_id: number;
      created_at: string;
      updated_at: string;
      deleted_at: null | string;
    };
  };
}

interface Order {
  id: number;
  customer_name: string;
  status: string;
  total_price: string;
  table_id: number;
  user_id: number;
  order_items: OrderItem[];
}

interface OrderItem {
  id: number;
  food: Food;
  quantity: string;
  price: string;
}

interface OrderResponse {
  meta: {
    code: number;
    status: string;
    message: string;
  };
  result: Order;
}

const OrderPage: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tableId = queryParams.get("table");

  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchText, setSearchText] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    console.log("orderId:", orderId); // harus ada
    console.log("tableId:", tableId); // harus ada
  }, [orderId, tableId]);

    const fetchFoods = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get<FoodResponse>("/food", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFoods(res.data.data.data); // TypeScript sekarang paham ini Food[]
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrderItems = async () => {
  if (!orderId) return;
  try {
    const token = localStorage.getItem("token");
    const res = await api.get<OrderResponse>(`/order/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setOrderItems(res.data.result.order_items || []);
  } catch (err) {
    console.error(err);
  }
};


  useEffect(() => {
    fetchFoods();
    fetchOrderItems();
  }, [orderId]);

  const handleBack = () => navigate("/dashboard");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const filteredFoods = foods.filter((food) => {
    const matchCategory = selectedCategory ? food.category === selectedCategory : true;
    const matchSearch = food.name.toLowerCase().includes(searchText.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleAddFood = async (food: Food) => {
    if (!orderId) {
      alert("Order ID tidak tersedia!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = { order_id: orderId, food_id: food.id, quantity: 1 };
      const res = await api.post<CreateOrderItemResponse>("/orderitem", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update orderItems state
      setOrderItems((prev) => [...prev, res.data.result]);

    } catch (err) {
      console.error("Error adding food:", err);
    }
  };

  return (
    <Box>
      {/* AppBar */}
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              color="inherit"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              sx={{ textTransform: "none" }}
            />
            <Typography variant="h6">Table {tableId}</Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body1">Hi, {user.name}</Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Konten */}
      <Box p={3}>
        <Grid container spacing={2} mt={2}>
          <Grid size={6}>
            {/* Category Chips */}
            <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
              {["appetizers", "main_course", "desserts", "beverages", "salads"].map((cat) => (
                <Chip
                  key={cat}
                  label={cat.replace("_", " ")}
                  variant="filled"
                  sx={{
                    bgcolor: selectedCategory === cat ? "black !important" : "#e0e0e0",
                    color: selectedCategory === cat ? "white !important" : "black",
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? "" : cat)}
                />
              ))}
            </Box>

            {/* Search */}
            <TextField
              fullWidth
              size="small"
              placeholder="Search menu..."
              variant="outlined"
              sx={{ mt: 1 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            {/* Table */}
            <Box mt={2}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredFoods.map((food) => (
                    <TableRow key={food.id}>
                      <TableCell>{food.name}</TableCell>
                      <TableCell>{food.category.replace("_", " ")}</TableCell>
                      <TableCell>Rp {parseFloat(food.price).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="success"
                          size="small"
                          onClick={() => handleAddFood(food)}
                        >
                          +
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Grid>

          {/* Current Order */}
          <Grid size={6}>
            <Card sx={{ padding: 2, border: "1px solid #ccc", borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Current Order
              </Typography>
              <Typography variant="body2" gutterBottom>
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Typography>

              <Box mt={2} display="flex" flexDirection="column" gap={1}>
                {orderItems.map((item) => (
                  <Box key={item.id} display="flex" justifyContent="space-between">
                    <Typography>
                      {item.food.name} x {item.quantity}
                    </Typography>
                    <Typography>
                      Rp {(parseFloat(item.food.price) * parseInt(item.quantity)).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default OrderPage;
