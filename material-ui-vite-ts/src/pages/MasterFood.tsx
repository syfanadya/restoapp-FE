import React, { useState, useEffect } from "react";
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

interface CreateFoodResponse {
  meta: {
    code: number;
    status: string;
    message: string;
  };
  result: Food;
}

interface FoodResponse {
  status: string;
  message: string;
  data: {
    current_page: number;
    data: Food[];
    last_page: number;
  };
}

interface UpdateFoodResponse {
  meta: {
    code: number;
    status: string;
    message: string;
  };
  result: Food;
}

const categories = ["appetizers", "main_course", "desserts", "beverages", "salads"];

const MasterFoodPage: React.FC = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [currentFood, setCurrentFood] = useState<Partial<Food>>({ name: "", category: "", price: "" });
  
    const [searchText, setSearchText] = useState("");
    const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(searchText.toLowerCase())
    );

  const fetchFoods = async (pageNumber = 1) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get<FoodResponse>(`/food?page=${pageNumber}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFoods(res.data.data.data);
      setPage(res.data.data.current_page);
      setLastPage(res.data.data.last_page);
    } catch (err) {
      console.error("Error fetching foods:", err);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleOpenDialog = (mode: "create" | "edit", food?: Food) => {
    setDialogMode(mode);
    if (food) {
      setCurrentFood(food);
    } else {
      setCurrentFood({ name: "", category: "", price: "" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleSaveFood = async () => {
    try {
      const token = localStorage.getItem("token");
     if (dialogMode === "create") {
        const res = await api.post<CreateFoodResponse>(
            "/food",
            currentFood,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setFoods((prev) => [...prev, res.data.result]);
    } else if (dialogMode === "edit" && currentFood.id) {
        const res = await api.put<UpdateFoodResponse>(
            `/food/${currentFood.id}`,
            currentFood,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

          setFoods((prev) =>prev.map((f) => (f.id === currentFood.id ? res.data.result : f)));
      }
      handleCloseDialog();
    } catch (err) {
      console.error("Error saving food:", err);
    }
  };

  const handleDeleteFood = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this food?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/food/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFoods((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error("Error deleting food:", err);
    }
  };

  return (
    <Box p={3}>
        <Typography variant="h4" mb={2}>Master Food</Typography>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Button variant="contained" color="primary" onClick={() => handleOpenDialog("create")}>
                Add Food
            </Button>

            <TextField
                size="small"
                placeholder="Search food..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
            />
        </Box>

      <Table sx={{ mt: 2 }}>
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
                <Button variant="outlined" color="info" size="small" onClick={() => handleOpenDialog("edit", food)} sx={{ mr: 1 }}>
                Edit
                </Button>
                <Button variant="outlined" color="error" size="small" onClick={() => handleDeleteFood(food.id)}>
                Delete
                </Button>
            </TableCell>
            </TableRow>
        ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <Box mt={2} display="flex" gap={1}>
        <Button disabled={page <= 1} onClick={() => fetchFoods(page - 1)}>Previous</Button>
        <Typography>Page {page} of {lastPage}</Typography>
        <Button disabled={page >= lastPage} onClick={() => fetchFoods(page + 1)}>Next</Button>
      </Box>

      {/* Dialog for Create/Edit */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{dialogMode === "create" ? "Add Food" : "Edit Food"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Name"
            value={currentFood.name}
            onChange={(e) => setCurrentFood({ ...currentFood, name: e.target.value })}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={currentFood.category}
              label="Category"
              onChange={(e) => setCurrentFood({ ...currentFood, category: e.target.value })}
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat.replace("_", " ")}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Price"
            type="number"
            value={currentFood.price}
            onChange={(e) => setCurrentFood({ ...currentFood, price: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveFood}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MasterFoodPage;
