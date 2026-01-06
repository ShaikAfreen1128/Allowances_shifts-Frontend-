import { useState, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, IconButton, Popover, Typography } from "@mui/material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { ChevronDown, Info, EllipsisVertical } from "lucide-react";
 
const formatINR = (value) => {
  if (value == null) return "";
  return `₹${Number(value).toLocaleString("en-IN")}`;
};
 
const parseINR = (value) => {
  if (!value) return 0;
  return Number(String(value).replace(/[₹,]/g, ""));
};
 
const ClientSummaryTable = ({
  clientsMap,
  monthTotals,
  monthTotalA,
  monthTotalB,
  monthTotalC,
  monthTotalPRIME,
  monthHeadCount
}) => {
  const [openMap, setOpenMap] = useState({});
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [popoverMessage, setPopoverMessage] = useState("");
  const [sortAnchor, setSortAnchor] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
 
  const toggleOpen = (key) => {
    setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };
 
  const handleInfoClick = (event, message) => {
    setPopoverAnchor(event.currentTarget);
    setPopoverMessage(message);
  };
 
  const handlePopoverClose = () => {
    setPopoverAnchor(null);
    setPopoverMessage("");
  };
 
  const columns = [
    {
      field: "clientName",
      headerName: "Client",
      width: 340,
      renderCell: (params) => {
        const { row } = params;
        const paddingLeft = row.level > 0 ? row.level * 6 : 0;
        const canExpand = row.level === 0 || (row.level === 1 && !row.hasError);
 
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              pl: paddingLeft,
              transition: "all 0.3s ease",
            }}
            onClick={() => {
              if (canExpand) {
                toggleOpen(row.clientKey);
              }
            }}
          >
            {params.value}
 
            {row.level === 0 && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOpen(row.clientKey);
                }}
              >
                <ChevronDown
                  size={16}
                  style={{
                    transform: openMap[row.clientKey]
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "0.3s",
                  }}
                />
              </IconButton>
            )}
 
            {row.level === 1 && row.hasError && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleInfoClick(e, row.error);
                }}
              >
                <Info size={16} />
              </IconButton>
            )}
 
            {row.level === 1 && !row.hasError && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOpen(row.clientKey);
                }}
              >
                <ChevronDown
                  size={16}
                  style={{
                    transform: openMap[row.clientKey]
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "0.3s",
                  }}
                />
              </IconButton>
            )}
          </Box>
        );
      },
    },
    { field: "headCount", headerName: "Head Count", width: 120 },
    { field: "accountManager", headerName: "Client Partner", width: 200 },
    { field: "shiftA", headerName: "Shift A", width: 150 },
    { field: "shiftB", headerName: "Shift B", width: 150 },
    { field: "shiftC", headerName: "Shift C", width: 150 },
    { field: "primeShift", headerName: "PRIME", width: 150 },
    {
      field: "amount",
      headerName: "Total Allowance",
      width: 180,
      renderHeader: () => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography fontWeight={700}>Total Allowance</Typography>
 
          <IconButton
            size="small"
            sx={{ color: "#fff" }}
            onClick={(e) => setSortAnchor(e.currentTarget)}
          >
            <EllipsisVertical color="white" fontSize="small" />
          </IconButton>
 
          <Menu
            anchorEl={sortAnchor}
            open={Boolean(sortAnchor)}
            onClose={() => setSortAnchor(null)}
          >
            <MenuItem
              onClick={() => {
                setSortOrder("desc");
                setSortAnchor(null);
              }}
            >
              High → Low
            </MenuItem>
 
            <MenuItem
              onClick={() => {
                setSortOrder("asc");
                setSortAnchor(null);
              }}
            >
              Low → High
            </MenuItem>
 
            <MenuItem
              onClick={() => {
                setSortOrder(null);
                setSortAnchor(null);
              }}
            >
              Clear Sort
            </MenuItem>
          </Menu>
        </Box>
      ),
    },
  ];
 
  const rows = useMemo(() => {
    const flatRows = [];
 
    Object.entries(clientsMap || {})
      .filter(([k]) => k !== "total" && k !== "month_total")
      .forEach(([clientName, clientObj]) => {
        const clientKey = clientName;
 
        flatRows.push({
          id: clientKey,
          clientKey,
          clientName,
          level: 0,
          headCount: clientObj.client_head_count ?? "",
          accountManager: clientObj.client_partner ?? "",
          shiftA: formatINR(clientObj.client_A ?? 0),
          shiftB: formatINR(clientObj.client_B ?? 0),
          shiftC: formatINR(clientObj.client_C ?? 0),
          primeShift: formatINR(clientObj.client_PRIME ?? 0),
          amount: formatINR(clientObj.client_total ?? 0),
        });
 
        if (openMap[clientKey]) {
          Object.entries(clientObj.departments || {}).forEach(
            ([deptName, deptObj]) => {
              const deptKey = `${clientKey}-${deptName}`;
              const hasError = deptObj.error && deptObj.error.trim() !== "";
 
              flatRows.push({
                id: deptKey,
                clientKey: deptKey,
                clientName: deptName,
                level: 1,
                hasError,
                error: deptObj.error,
                headCount: deptObj.dept_head_count ?? 0,
                accountManager: deptObj.account_manager ?? "",
                shiftA: formatINR(deptObj.dept_A ?? 0),
                shiftB: formatINR(deptObj.dept_B ?? 0),
                shiftC: formatINR(deptObj.dept_C ?? 0),
                primeShift: formatINR(deptObj.dept_PRIME ?? 0),
                amount: formatINR(deptObj.dept_total ?? 0),
              });
 
              if (openMap[deptKey] && !hasError) {
                (deptObj.employees || []).forEach((emp) => {
                  flatRows.push({
                    id: `${deptKey}-emp-${emp.emp_id}`,
                    clientKey: `${deptKey}-emp-${emp.emp_id}`,
                    clientName: emp.emp_name,
                    level: 2,
                    headCount: 1,
                    accountManager: emp.account_manager ?? "",
                    shiftA: formatINR(emp.A ?? 0),
                    shiftB: formatINR(emp.B ?? 0),
                    shiftC: formatINR(emp.C ?? 0),
                    primeShift: formatINR(emp.PRIME ?? 0),
                    amount: formatINR(emp.total ?? 0),
                  });
                });
              }
            }
          );
        }
      });
 
    const monthTotalRow = {
      id: "monthTotal",
      clientKey: "monthTotal",
      clientName: "Month Total",
      headCount: monthHeadCount??"",
      shiftA: formatINR(monthTotalA),
      shiftB: formatINR(monthTotalB),
      shiftC: formatINR(monthTotalC),
      primeShift: formatINR(monthTotalPRIME),
      amount: formatINR(monthTotals),
    };
 
    let sortableRows = [...flatRows];
 
    if (sortOrder) {
      sortableRows.sort((a, b) => {
        const aVal = parseINR(a.amount);
        const bVal = parseINR(b.amount);
 
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      });
    }
 
    sortableRows.push(monthTotalRow);
 
    return sortableRows;
  }, [
    clientsMap,
    openMap,
    monthTotals,
    monthTotalA,
    monthTotalB,
    monthTotalC,
    monthTotalPRIME,
    sortOrder,
  ]);
 
  const isEmpty = Object.keys(clientsMap).length === 0 || clientsMap?.message;
 
  return (
    <Box
      sx={{
        height: isEmpty ? "auto" : 400,
        "& .MuiDataGrid-virtualScroller": {
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      }}
    >
      {isEmpty ? (
        <Box sx={{ p: 2 }}>
          <Typography color="error">
            {clientsMap.message || "No Data Found"}
          </Typography>
        </Box>
      ) : (
        <>
          <DataGrid
            rows={rows}
            columns={columns}
            pagination={false}
            hideFooter
            disableColumnFilter
            disableColumnMenu
            disableColumnSelector
            disableColumnSorting
            disableDensitySelector
             disableRowSelectionOnClick
            getRowId={(row) => row.id}
            getRowClassName={(params) => {
              if (params.row.id === "monthTotal") return "row-month-total";
              if (params.row.level === 1) return "row-department";
              if (params.row.level === 2) return "row-employee";
              return "row-client";
            }}
            sx={{
              border: "none",
              borderRadius: 0,
              ".row-month-total": {
                backgroundColor: "#d1eaff",
                fontWeight: 700,
              },
              "& .row-client": { backgroundColor: "#e9f5ff", fontWeight: 600 },
              "& .row-department": { backgroundColor: "#f0f4ff" },
              "& .row-employee": { backgroundColor: "#fafafa" },
              "& .MuiDataGrid-cell": { outline: "none", cursor: "pointer" },
              "& .MuiDataGrid-columnHeader": {
                backgroundColor: "#000",
                color: "#fff",
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: 700,
                textAlign: "center",
                color: "#fff",
              },
              "& .MuiDataGrid-scrollbar--vertical": {
                display: "none",
              },
              "& .MuiDataGrid-columnHeaders": {
                overflowY: "hidden",
                scrollbarWidth: "none",
              },
              "& .MuiDataGrid-columnHeaders::-webkit-scrollbar": {
                display: "none",
              },
                "& .MuiDataGrid-cell": {
            outline: "none",
            cursor: "pointer",
          },
          "& .MuiDataGrid-cell:focus": {
            outline: "none",
          },
          "& .MuiDataGrid-columnHeaders": {
            position: "sticky",
            top: 0,
          },
            }}
          />
 
          <Popover
            open={Boolean(popoverAnchor)}
            anchorEl={popoverAnchor}
            onClose={handlePopoverClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
            <Box sx={{ p: 2, maxWidth: 300 }}>
              <Typography variant="body2">{popoverMessage}</Typography>
            </Box>
          </Popover>
        </>
      )}
    </Box>
  );
};
 
export default ClientSummaryTable;
 
 