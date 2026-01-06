import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Modal,
  Breadcrumbs,
  Link,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Pen, X } from "lucide-react";
import * as XLSX from "xlsx";
import { correctEmployeeRows } from "../utils/helper";

const BACKEND_TO_FRONTEND = {
  emp_id: "EMP ID",
  emp_name: "EMP NAME",
  grade: "GRADE",
  department: "DEPARTMENT",
  client: "CLIENT",
  project: "PROJECT",
  project_code: "PROJECT CODE",
};

const HIDDEN_FIELDS = ["reason"];
const isHiddenField = (key) => HIDDEN_FIELDS.includes(key);

const EmployeeEditPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [errorRows, setErrorRows] = useState(state?.errorRows || []);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editedFields, setEditedFields] = useState({});
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [saveError, setSaveError] = useState("");
  const [clearedErrors, setClearedErrors] = useState({});


  const TEXT_FIELDS = ["payroll_month", "duration_month"];

  const isFieldInvalid = (field, value) => {
    if (selectedEmployee?.reason?.[field]) return true;
    if (value === "" || value === undefined) return true;
    if (TEXT_FIELDS.includes(field)) return false;
    return isNaN(Number(value)) || Number(value) < 0;
  };


  useEffect(() => {
    if (selectedEmployee) {
      const fieldsToEdit = {};
      Object.keys(selectedEmployee).forEach((key) => {
        if (!isHiddenField(key)) {
          fieldsToEdit[key] = selectedEmployee[key];
        }
      });
      setEditedFields(fieldsToEdit);
      setSaveError("");
    } else {
      setEditedFields({});
    }
  }, [selectedEmployee]);

  const handleSave = async () => {
    if (!selectedEmployee) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      setPopupMessage("You are not authenticated. Please login again.");
      setPopupType("error");
      setPopupOpen(true);
      return;
    }

    try {
      const correctedRow = { ...selectedEmployee, ...editedFields };
      delete correctedRow.reason;

      const data = await correctEmployeeRows(token, [correctedRow]);


      if (data?.message) {
        setPopupMessage(`EMP ID: ${correctedRow.emp_id} - ${data.message}`);
        setPopupType("success");
        setPopupOpen(true);

        const updatedErrors = errorRows.filter(
          (r) => r.emp_id !== correctedRow.emp_id
        );
        setErrorRows(updatedErrors);

        setTimeout(() => setSelectedEmployee(null), 1000);
        setSaveError("");
      }
    } catch (err) {
      const errorMsg =
        err?.detail?.failed_rows?.[0]?.reason || err?.message || "Unknown error";
      setSaveError(`Failed to save EMP ID: ${selectedEmployee.emp_id} - ${errorMsg}`);
    }
  };

  const handleDownloadErrorRows = () => {
    if (!errorRows || errorRows.length === 0) return;

    const cleanedRows = errorRows.map(({ reason, ...rest }) => rest);
    const worksheet = XLSX.utils.json_to_sheet(cleanedRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Error Rows");
    XLSX.writeFile(workbook, "Remaining_Error_Rows.xlsx");
  };

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSaveDisabled = selectedEmployee
    ? Object.keys(selectedEmployee.reason || {}).some((field) => {
      const value = editedFields[field];
      if (value === "" || value === undefined) return true;
      if (TEXT_FIELDS.includes(field)) return false;
      return isNaN(Number(value)) || Number(value) < 0;
    })
    : true;

  return (
    <Box sx={{ p: 4 }}>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          backgroundColor: "#312e81",
          overflow: "visible",
          paddingLeft: "16px",
          backgroundColor: "transparent",
        }}
      >
        {/* Shift Allowance */}
        <Box
          onClick={() => navigate("/shift-allowance")}
          sx={{
            position: "relative",
            px: 3,
            py: 1,
            color: "white",
            fontSize: 14,
            fontWeight: 500,
            backgroundColor: "#3730a3",
            cursor: "pointer",

            /* LEFT < */
            "&::before": {
              content: '""',
              position: "absolute",
              left: "-16px",
              top: 0,
              width: 0,
              height: 0,
              borderTop: "20px solid transparent",
              borderBottom: "20px solid transparent",
              borderRight: "16px solid #3730a3",
            },

            "&:hover": {
              backgroundColor: "#2563eb",
              "&::before": {
                borderRightColor: "#2563eb",
              },
            },
          }}
        >
          Shift Allowance
        </Box>

        {/* Error Records */}
        <Box
          sx={{
            position: "relative",
            px: 3,
            py: 1,
            color: "white",
            fontSize: 14,
            fontWeight: 700,
            backgroundColor: "#3730a3",
            borderTopRightRadius: "999px",
            borderBottomRightRadius: "999px",

            /* < separator */
            "&::before": {
              content: '""',
              position: "absolute",
              left: "-16px",
              top: 0,
              width: 0,
              height: 0,
              borderTop: "20px solid transparent",
              borderBottom: "20px solid transparent",
              borderRight: "16px solid #ffffff",
            },
            "&::after": {
              content: '""',
              position: "absolute",
              left: "-14px",
              top: "2px",
              width: 0,
              height: 0,
              borderTop: "18px solid transparent",
              borderBottom: "18px solid transparent",
              borderRight: "14px solid #3730a3",
            },
          }}
        >
          Error Records
        </Box>
      </Box>


      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Error Records
        </Typography>
        <Button
          variant="outlined"
          onClick={handleDownloadErrorRows}
          disabled={errorRows.length === 0}
        >
          Download Error Rows
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "#000",
                "& th": {
                  backgroundColor: "#000",
                  color: "#fff",
                  fontWeight: "bold",
                  border: "1px solid #444",
                },
              }}
            >
              {Object.keys(errorRows[0] || {})
                .filter((key) => !isHiddenField(key))
                .map((key) => (
                  <TableCell key={key} sx={{ fontWeight: "bold" }}>
                    {BACKEND_TO_FRONTEND[key] || key.toUpperCase()}
                  </TableCell>
                ))}
              <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {errorRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <Typography color="success.main" fontWeight="bold">
                    All rows successfully edited
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              errorRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, idx) => (
                  <TableRow
                    key={idx}
                    hover
                    sx={{
                      "& td": {
                        backgroundColor: "inherit",
                      },
                    }}
                  >
                    {Object.keys(row)
                      .filter((key) => !isHiddenField(key))
                      .map((key) => (
                        <TableCell
                          key={key}
                          sx={{
                            border: "1px solid #ddd",
                            borderColor:
                              row.reason && row.reason[key] ? "red" : "#ddd",
                            color: row.reason && row.reason[key] ? "red" : "inherit",
                            fontWeight:
                              row.reason && row.reason[key] ? "bold" : "normal",
                            backgroundColor:
                              row.reason && row.reason[key]
                                ? "rgba(255, 0, 0, 0.1)"
                                : "inherit",
                          }}
                        >
                          {row[key] ?? "-"}
                        </TableCell>
                      ))}
                    <TableCell>
                      <IconButton
                        onClick={() => {
                          setSelectedEmployee(row);
                          setPopupMessage("");
                          setPopupOpen(false);
                          setSaveError("");
                        }}
                      >
                        <Pen size={20} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={errorRows.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />

      {/* Modal for editing employee */}
      <Modal
        open={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        BackdropProps={{
          style: { backgroundColor: "rgba(0,0,0,0.5)" },
          onClick: (e) => e.stopPropagation(),
        }}
      >
        <Paper
          sx={{
            width: "70%",
            maxWidth: 900,
            maxHeight: "80vh",
            p: 3,
            mx: "auto",
            mt: "10vh",
            overflowY: "auto",
            borderRadius: 2,
          }}
        >
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="h6" fontWeight="bold">
              Employee Details – EMP ID: {selectedEmployee?.emp_id}
            </Typography>

            <IconButton
              onClick={() => {
                setSelectedEmployee(null);
                setPopupMessage("");
                setPopupOpen(false);
              }}
            >
              <X size={20} />
            </IconButton>

          </Box>

          <Typography fontWeight="bold" mb={1}>
            Edit Error Fields
          </Typography>

          {/* Display non-error fields */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
            {selectedEmployee &&
              Object.entries(selectedEmployee).map(([key, value]) => {
                if (isHiddenField(key) || key in selectedEmployee.reason)
                  return null;
                return (
                  <Paper key={key} sx={{ p: 2, flex: "1 1 calc(45% - 12px)" }}>
                    <Typography fontWeight="bold">
                      {BACKEND_TO_FRONTEND[key] || key.toUpperCase()}
                    </Typography>
                    <Typography>{value ?? "-"}</Typography>
                  </Paper>
                );
              })}
          </Box>

          {/* Display error fields for editing */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {selectedEmployee &&
              Object.keys(selectedEmployee.reason || {}).map((field) => (
                <Paper key={field} sx={{ p: 2, flex: "1 1 45%" }}>
                  <Typography fontWeight="bold">
                    {field.replace(/_/g, " ").toUpperCase()}
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type={TEXT_FIELDS.includes(field) ? "text" : "number"}
                    inputProps={TEXT_FIELDS.includes(field) ? {} : { min: 0 }}
                    value={editedFields[field] ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditedFields((prev) => ({ ...prev, [field]: value }));

                      let isValid = false;
                      if (TEXT_FIELDS.includes(field)) {
                        isValid = value.trim() !== "";
                      } else {
                        const num = Number(value);
                        isValid = !isNaN(num) && num >= 0;
                      }

                      // if (isValid && selectedEmployee?.reason?.[field]) {
                      //   setSelectedEmployee((prev) => ({
                      //     ...prev,
                      //     reason: { ...prev.reason, [field]: undefined },
                      //   }));
                      if (isValid) {
                        setClearedErrors((prev) => ({
                          ...prev,
                          [field]: true,
                        }));
                      }
                    }}
                    // error={!!selectedEmployee?.reason?.[field]}
                    // helperText={selectedEmployee?.reason?.[field] || ""}
                    error={
                      !!selectedEmployee?.reason?.[field] && !clearedErrors[field]
                    }
                    helperText={
                      !clearedErrors[field] ? selectedEmployee?.reason?.[field] : ""
                    }

                  />
                </Paper>
              ))}
          </Box>

          <Box mt={3} display="flex" flexDirection="column" gap={1}>
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={isSaveDisabled}
              >
                Save
              </Button>
              <Button variant="outlined" onClick={() => setSelectedEmployee(null)}>
                Back
              </Button>
            </Box>

            {/* Error message below Save button */}
            {saveError && (
              <Typography color="error" variant="body2">
                {saveError}
              </Typography>
            )}
          </Box>
        </Paper>
      </Modal>

      {/* Popup modal for success messages */}
      <Modal
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        BackdropProps={{ style: { backgroundColor: "rgba(0,0,0,0.3)" } }}
        aria-labelledby="popup-message"
        aria-describedby="popup-description"
      >
        <Paper
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            p: 4,
            width: { xs: "80%", sm: 400 },
            textAlign: "center",
            borderRadius: 2,
            maxHeight: "70vh",
            overflowY: "auto",

            border: popupType === "success"
              ? "2px solid #16a34a"
              : "2px solid #dc2626",


            boxShadow:
              popupType === "success"
                ? "0 0 10px rgba(22,163,74,0.4)"
                : "0 0 10px rgba(220,38,38,0.4)",

          }}
        >
          <Typography
            id="popup-message"
            sx={{
              color: popupType === "success" ? "green" : "red",
              fontWeight: "bold",
              mb: 2,
              wordBreak: "break-word",
            }}
            variant="h6"
          >
            {popupMessage}
          </Typography>
          <Button
            variant="contained"
            onClick={() => setPopupOpen(false)}
            sx={{
              mt: 1,
              backgroundColor: "#1E3A8A",
              "&:hover": { backgroundColor: "#17326c" },
            }}
          >
            Close
          </Button>
        </Paper>
      </Modal>
    </Box>
  );
};

export default EmployeeEditPage;

