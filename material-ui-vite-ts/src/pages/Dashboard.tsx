import React, { useEffect, useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

// tipe data dari API
interface Floor {
  id: number;
  name: string;
}

interface Table {
  id: number;
  number: string; // biasanya nomor meja
  status: string;
  floor_id: number;
}

interface FloorResponse {
  data: {
    data: Floor[];
  };
}

interface TableResponse {
  data: {
    data: Table[];
  };
}
interface CreateOrderResponse {
  meta: {
    code: number;
    status: string;
    message: string;
  };
  result: {
    id: number;
    user_id: number;
    customer_name: string;
    table_id: string;
    status: string;
    total_price: number;
    updated_at: string;
    created_at: string;
    order_items: any[];
  };
}

const Dashboard: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const [floors, setFloors] = useState<Floor[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<string>("");

  // Dialog / input customer
  const [openDialog, setOpenDialog] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  useEffect(() => {
    const fetchFloors = async () => {
      try {
        const res = await api.get<FloorResponse>("/floor");
        const floorsData = res.data.data.data;
        setFloors(floorsData);

        const floor1 = floorsData.find((floor) => floor.id === 1);
        if (floor1) {
          setSelectedFloor(String(floor1.id));
        } else if (floorsData.length > 0) {
          setSelectedFloor(String(floorsData[0].id));
        }
      } catch (err) {
        console.error("Error fetching floors:", err);
      }
    };
    fetchFloors();
  }, []);

  useEffect(() => {
    const fetchTables = async () => {
      if (!selectedFloor) return;
      try {
        const res = await api.get<TableResponse>("/table");
        const filtered = res.data.data.data.filter(
          (t) => t.floor_id === parseInt(selectedFloor)
        );
        setTables(filtered);
      } catch (err) {
        console.error("Error fetching tables:", err);
      }
    };
    fetchTables();
  }, [selectedFloor]);

  const handleFloorChange = (event: SelectChangeEvent) => {
    setSelectedFloor(event.target.value);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "#c8e6c9";
      case "occupied":
        return "#ffcdd2";
      case "reserved":
        return "#fff9c4";
      case "inactive":
        return "#e0e0e0";
      default:
        return "#ffffff";
    }
  };

  // buka popup input customer
  const handleTableClick = (table: Table) => {
    if (table.status.toLowerCase() === "inactive") return;
    setSelectedTableId(table.id);
    setOpenDialog(true);
  };

  // create order
  const handleCreateOrder = async () => {
    if (!customerName || !selectedTableId) return;
    setLoadingOrder(true);
    try {
        const token = localStorage.getItem("token");
        const res = await api.post<CreateOrderResponse>(
        "/order",
            {
                customer_name: customerName,
                table_id: selectedTableId,
            },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        const orderId = res.data.result.id;
        
        setOpenDialog(false);
        setCustomerName("");
        setSelectedTableId(null);
        navigate(`/order/${orderId}?table=${selectedTableId}`);
    } catch (err) {
      console.error("Error creating order:", err);
    } finally {
      setLoadingOrder(false);
    }
  };

  return (
    <Box>
      {/* AppBar */}
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6">Dashboard</Typography>

          <Box sx={{ display: "flex", gap: 2, mx: "auto" }}>
            <Button
              color="inherit"
              component={Link}
              to="/masterfood"
              sx={{ textTransform: "none" }}
            >
              Master Food
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/orderlist"
              sx={{ textTransform: "none" }}
            >
              Order List
            </Button>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body1">Hi, {user.name}</Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Konten Dashboard */}
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Table Management</Typography>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="floor-select-label">Floor</InputLabel>
            <Select
              labelId="floor-select-label"
              value={selectedFloor}
              onChange={handleFloorChange}
              label="Floor"
            >
              {floors.map((floor) => (
                <MenuItem key={floor.id} value={String(floor.id)}>
                  {floor.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box mt={2} display="flex" gap={1}>
          <Chip label="Available" sx={{ bgcolor: "#c8e6c9" }} />
          <Chip label="Occupied" sx={{ bgcolor: "#ffcdd2" }} />
          <Chip label="Reserved" sx={{ bgcolor: "#fff9c4" }} />
          <Chip label="Inactive" sx={{ bgcolor: "#e0e0e0" }} />
        </Box>

        <Grid container spacing={2} mt={3}>
          <Grid size={10}>
            <Grid container spacing={2}>
              {tables.map((table) => {
                const isInactive = table.status.toLowerCase() === "inactive";

                return (
                  <Card
                    key={table.id}
                    sx={{
                      bgcolor: getStatusColor(table.status),
                      minWidth: 120,
                      cursor: isInactive ? "not-allowed" : "pointer",
                      opacity: isInactive ? 0.5 : 1,
                    }}
                    onClick={() => handleTableClick(table)}
                  >
                    <CardContent>
                      <Typography variant="subtitle1">
                        Table {table.number}
                      </Typography>
                      <Typography variant="body2">
                        Status: {table.status}
                      </Typography>
                    </CardContent>
                  </Card>
                );
              })}
            </Grid>
          </Grid>

          <Grid size={2}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Stats
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Chip
                    label={`Available: ${
                      tables.filter(
                        (t) => t.status.toLowerCase() === "available"
                      ).length
                    }`}
                    sx={{ bgcolor: "#c8e6c9" }}
                  />
                  <Chip
                    label={`Occupied: ${
                      tables.filter(
                        (t) => t.status.toLowerCase() === "occupied"
                      ).length
                    }`}
                    sx={{ bgcolor: "#ffcdd2" }}
                  />
                  <Chip
                    label={`Reserved: ${
                      tables.filter(
                        (t) => t.status.toLowerCase() === "reserved"
                      ).length
                    }`}
                    sx={{ bgcolor: "#fff9c4" }}
                  />
                  <Chip
                    label={`Inactive: ${
                      tables.filter(
                        (t) => t.status.toLowerCase() === "inactive"
                      ).length
                    }`}
                    sx={{ bgcolor: "#e0e0e0" }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Dialog Input Customer */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Enter Customer Name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            disabled={loadingOrder}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={loadingOrder}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateOrder}
            variant="contained"
            color="primary"
            disabled={loadingOrder || !customerName}
          >
            {loadingOrder ? "Creating..." : "Order"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
