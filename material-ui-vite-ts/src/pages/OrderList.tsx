import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import api from "../api";

interface Food {
  id: number;
  name: string;
  category: string;
  price: string;
}

interface OrderItem {
  id: number;
  quantity: number;
  price: string;
  food_id: number;
  food: Food;
}

interface TableData {
  id: number;
  number: number;
  status: string;
}

interface UserData {
  id: number;
  name: string;
}

interface Order {
  id: number;
  customer_name: string;
  status: string;
  total_price: string;
  table_id: number;
  user_id: number;
  order_items: OrderItem[];
  table: TableData;
  user: UserData;
}

interface OrderResponse {
  meta: {
    code: number;
    status: string;
    message: string;
  };
  result: {
    current_page: number;
    data: Order[];
    last_page: number;
  };
}

interface UpdateOrderResponse {
  meta: {
    code: number;
    status: string;
    message: string;
  };
  result: Order;
}

const statuses = ["progress", "completed", "canceled"];

const OrderListPage: React.FC = () => {
    const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // Dialog for edit order status
  const [openDialog, setOpenDialog] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Partial<Order>>({});
  const [selectedStatus, setSelectedStatus] = useState<string>("progress");

  const fetchOrders = async (pageNumber = 1) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get<OrderResponse>(`/order?page=${pageNumber}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.result.data);
      setPage(res.data.result.current_page);
      setLastPage(res.data.result.last_page);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenDialog = (order: Order) => {
    setCurrentOrder(order);
    setSelectedStatus(order.status);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleSaveOrder = async () => {
    if (!currentOrder.id) return;
    try {
      const token = localStorage.getItem("token");
      const res = await api.put<UpdateOrderResponse>(
        `/order/${currentOrder.id}`,
        { ...currentOrder, status: selectedStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders((prev) =>
        prev.map((o) => (o.id === currentOrder.id ? res.data.result : o))
      );
      handleCloseDialog();
    } catch (err) {
      console.error("Error updating order:", err);
    }
  };

  const handleDeleteOrder = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/order/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error("Error deleting order:", err);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>
        Order List
      </Typography>

      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>Customer</TableCell>
            <TableCell>Table</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.customer_name}</TableCell>
              <TableCell>{order.table.number}</TableCell>
              <TableCell>{order.status}</TableCell>
              <TableCell>
                Rp {parseFloat(order.total_price).toLocaleString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="outlined"
                  color="info"
                  size="small"
                  onClick={() => handleOpenDialog(order)}
                  sx={{ mr: 1 }}
                >
                  Edit
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDeleteOrder(order.id)}
                    sx={{ mr: 1 }}
                >
                  Delete
                </Button>
                <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    onClick={() => navigate(`/order/${order.id}?table=${order.table_id}`)}
                >
                    Detail
                </Button>


              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <Box mt={2} display="flex" gap={1}>
        <Button disabled={page <= 1} onClick={() => fetchOrders(page - 1)}>
          Previous
        </Button>
        <Typography>
          Page {page} of {lastPage}
        </Typography>
        <Button disabled={page >= lastPage} onClick={() => fetchOrders(page + 1)}>
          Next
        </Button>
      </Box>

      {/* Dialog for Edit Status */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Edit Order Status</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedStatus}
              label="Status"
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statuses.map((s) => (
                <MenuItem key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveOrder}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderListPage;
