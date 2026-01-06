import { useState, useEffect } from "react";
import { Box, Typography, Paper, TextField, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { correctEmployeeRows } from "../utils/helper.js";

const EDITABLE_FIELDS = ["shift_a_days", "shift_b_days", "shift_c_days", "prime_days"];
const FIELD_LABEL_MAP = {
  shift_a_days: "Shift A",
  shift_b_days: "Shift B",
  shift_c_days: "Shift C",
  prime_days: "Prime",
};

const BACKEND_TO_FRONTEND = {
  emp_id: "EMP ID",
  emp_name: "EMP NAME",
  grade: "GRADE",
  department: "DEPARTMENT",
  client: "CLIENT",
  project: "PROJECT",
  project_code: "PROJECT CODE",
  reason: "REASON",
};

const EmployeeEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [editRow, setEditRow] = useState(location.state?.row || null);
  const [saveSuccess, setSaveSuccess] = useState("");

  if (!editRow) {
    return (
      <Box p={3}>
        <Typography>No employee selected.</Typography>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </Box>
    );
  }

  const handleSave = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const data = await correctEmployeeRows([editRow]);
      let message = "";

      if (data && (data.success === true || (data.message && data.message.toLowerCase().includes("success")))) {
        message = `EMP ID: ${editRow.emp_id} - ${data.message}`;
      } else {
        message = `EMP ID: ${editRow.emp_id} update failed: ${data.message || "Unknown error"}`;
      }

      setSaveSuccess(message);
    } catch (err) {
      setSaveSuccess(`EMP ID: ${editRow.emp_id} update failed: ${err.message}`);
    }

    setTimeout(() => setSaveSuccess(""), 5000);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={3}>
        Employee Details – EMP ID: {editRow.emp_id}
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
        {Object.entries(editRow).map(([key, value]) => {
          if (!EDITABLE_FIELDS.includes(key)) {
            return (
              <Paper key={key} sx={{ p: 2, flex: "1 1 calc(30% - 16px)", backgroundColor: "#fafafa" }}>
                <Typography fontWeight={600}>{BACKEND_TO_FRONTEND[key] || key.toUpperCase()}</Typography>
                <Typography>{value ?? "-"}</Typography>
              </Paper>
            );
          }
          return null;
        })}
      </Box>

      <Typography variant="h6" mb={1}>
        Edit Shift Days
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {EDITABLE_FIELDS.map((field) => {
          const errorMessage = editRow.reason?.[field];
          return (
            <Paper key={field} sx={{ p: 2, flex: "1 1 calc(25% - 16px)" }}>
              <Typography fontWeight={600}>{FIELD_LABEL_MAP[field]}</Typography>
              <TextField
                fullWidth
                size="small"
                value={editRow[field] ?? ""}
                onChange={(e) => setEditRow((prev) => ({ ...prev, [field]: e.target.value }))}
                error={Boolean(errorMessage)}
                helperText={errorMessage}
              />
            </Paper>
          );
        })}
      </Box>

      <Button variant="contained" sx={{ mt: 3 }} onClick={handleSave}>
        Save
      </Button>

      {saveSuccess && (
        <Typography color={saveSuccess.includes("successfully") ? "success.main" : "error"} sx={{ mt: 1 }}>
          {saveSuccess}
        </Typography>
      )}

      <Button sx={{ mt: 2 }} onClick={() => navigate(-1)}>
        Go Back
      </Button>
    </Box>
  );
};

export default EmployeeEdit;


