import React, { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { SelectChangeEvent } from "@mui/material/Select";
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

const TableManagement: React.FC = () => {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<string>("");

  // ambil data floor dan set selectedFloor ke lantai 1 jika ada
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

  // ambil data table sesuai lantai yang dipilih
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

  // handle ganti dropdown
  const handleFloorChange = (event: SelectChangeEvent) => {
    setSelectedFloor(event.target.value);
  };

  // warna berdasarkan status meja
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "#c8e6c9"; // hijau
      case "occupied":
        return "#ffcdd2"; // merah
      case "reserved":
        return "#fff9c4"; // kuning
      case "inactive":
        return "#e0e0e0"; // abu-abu
      default:
        return "#ffffff"; // putih
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Table Management</Typography>

        {/* Dropdown pilih lantai */}
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

      {/* Legend status */}
      <Box mt={2} display="flex" gap={1}>
        <Chip label="Available" sx={{ bgcolor: "#c8e6c9" }} />
        <Chip label="Occupied" sx={{ bgcolor: "#ffcdd2" }} />
        <Chip label="Reserved" sx={{ bgcolor: "#fff9c4" }} />
        <Chip label="Inactive" sx={{ bgcolor: "#e0e0e0" }} />
      </Box>

      <Grid container spacing={2} mt={3}>
        <Grid size = {10}>
          <Grid container spacing={2}>
              {tables.map((table) => (
                  <Card sx={{ bgcolor: getStatusColor(table.status) }}>
                    <CardContent>
                      <Typography variant="subtitle1">
                        Table {table.number}
                      </Typography>
                      <Typography variant="body2">
                        Status: {table.status}
                      </Typography>
                    </CardContent>
                  </Card>
              ))}
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
  );
};

export default TableManagement;
