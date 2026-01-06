import { useState, useEffect, useCallback, useMemo } from "react";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Button,
  Accordion,
  AccordionSummary,
  FormControlLabel,
  Checkbox,
  AccordionDetails,
  InputLabel,
  OutlinedInput,
  ListItemText,
  FormHelperText,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  debounce,
  fetchClientDepartments,
  fetchClientEnums,
  fetchDashboardClientSummary,
} from "../utils/helper.js";
import { ChevronDown, Info, X } from "lucide-react";
import DepartmentBarChart from "../visuals/DepartmentBarChart.jsx";
import DonutChart from "../visuals/DonutChart.jsx";
import AccountManagersTable from "../component/AccountManagersTable.jsx";
import DepartmentAllowanceChart from "../visuals/DepartmentAllowanceChart.jsx";
import HorizontalAllowanceBarChart from "../visuals/HorizontalAllowanceBarChart.jsx";

const hideScrollbar = {
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  "&::-webkit-scrollbar": {
    width: 0,
    height: 0,
    background: "transparent",
  },
};

const DashboardPage = () => {
  const [selectedClients, setSelectedClients] = useState([]);
  const [clientDepartments, setClientDepartments] = useState([]);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [expandedClient, setExpandedClient] = useState(null);
  const [startMonth, setStartMonth] = useState(null);
  const [endMonth, setEndMonth] = useState(null);
  const [topFilter, setTopFilter] = useState("5");
  const [timelineSelection, setTimelineSelection] = useState("range");
  const [year, setYear] = useState(null);
  const [multipleMonths, setMultipleMonths] = useState([]);
  const [quarterlySelection, setQuarterlySelection] = useState([]);
  const [transformedData, setTransformedData] = useState({});
  const [selectedDonutClient, setSelectedDonutClient] = useState(null);
  const [accountMananer, setAccountManager] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({});
  const [selectedColor, setSelectedColor] = useState("");
  const [clientColors, setClientColors] = useState({});
  const [enums, setEnums] = useState(null);

  const horizontalChartData = useMemo(() => {
    if (!data?.dashboard?.clients) return null;

    let clientsArray = Object.entries(data.dashboard.clients);

    return Object.fromEntries(
      clientsArray.map(([client, clientData]) => [
        client,
        {
          total_allowance: clientData.total_allowance,
          color: clientColors[client],
          shift_A: clientData.shift_A,
          shift_B: clientData.shift_B,
          shift_C: clientData.shift_C,
          shift_PRIME: clientData.shift_PRIME,
        },
      ])
    );
  }, [data, topFilter, selectedClients, clientColors]);

  const isEndMonthInvalid =
    startMonth &&
    endMonth &&
    (dayjs(endMonth).isBefore(dayjs(startMonth), "month") ||
      dayjs(endMonth).isSame(dayjs(startMonth), "month"));

  const isStartMonthInvalid = !startMonth && endMonth;

  const timelines = [
    { label: "Monthly", value: "monthly" },
    { label: "Quarterly", value: "quarterly" },
    { label: "Range", value: "range" },
  ];

  const monthsList = [
    { label: "January", value: "01" },
    { label: "February", value: "02" },
    { label: "March", value: "03" },
    { label: "April", value: "04" },
    { label: "May", value: "05" },
    { label: "June", value: "06" },
    { label: "July", value: "07" },
    { label: "August", value: "08" },
    { label: "September", value: "09" },
    { label: "October", value: "10" },
    { label: "November", value: "11" },
    { label: "December", value: "12" },
  ];
  const quarterlyList = [
    { label: "Q1 (Jan - Mar)", value: "Q1" },
    { label: "Q2 (Apr - Jun)", value: "Q2" },
    { label: "Q3 (Jul - Sep)", value: "Q3" },
    { label: "Q4 (Oct - Dec)", value: "Q4" },
  ];

  const runFetch = useCallback(
    debounce(async (payload) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchDashboardClientSummary(payload);
        setData(res);
      } catch (err) {
        setError(err?.message || "Unable to fetch data");
        setData({});
      } finally {
        setLoading(false);
      }
    }, 600),
    []
  );

  const runClientEnums = useCallback(async () => {
    try {
      const response = await fetchClientEnums();
      console.log(response);
      setEnums(response);
    } catch (error) {
      setError(error);
    }
  }, []);

  useEffect(() => {
    let payload = {
      clients: "ALL",
      top: topFilter,
    };
    runFetch(payload);

    runClientEnums();
  }, []);

  const transformData = (data) => {
    const result = {};
    if (data.dashboard) {
      for (const clientName in data.dashboard.clients) {
        const clientData = data.dashboard.clients[clientName];
        const clientKey = clientName;

        const clientInfo = [];
        for (const depName in clientData.department) {
          const depData = clientData.department[depName];
          const departmentInfo = {
            [depName]: {
              total_allowance: depData.total_allowance,
              head_count: depData.head_count,
              shift_A: depData.shift_A,
              shift_B: depData.shift_B,
              shift_C: depData.shift_C,
              shift_PRIME: depData.shift_PRIME,
            },
          };
          clientInfo.push(departmentInfo);
        }

        result[clientKey] = clientInfo;
      }
    }

    return result;
  };

  const transformAccountManagers = (accountManagers = {}) => {
    return Object.entries(accountManagers).map(
      ([managerName, managerData]) => ({
        manager_name: managerName,
        total_allowance: managerData.total_allowance,
        head_count: managerData.head_count,

        shifts: {
          shift_A: managerData.shift_A,
          shift_B: managerData.shift_B,
          shift_C: managerData.shift_C,
          shift_PRIME: managerData.shift_PRIME,
        },

        clients: Object.entries(managerData.clients || {}).map(
          ([clientName, clientData]) => ({
            client_name: clientName,
            total_allowance: clientData.total_allowance,
            head_count: clientData.head_count,

            shifts: {
              shift_A: clientData.shift_A,
              shift_B: clientData.shift_B,
              shift_C: clientData.shift_C,
              shift_PRIME: clientData.shift_PRIME,
            },

            departments: Object.entries(clientData.department || {}).map(
              ([deptName, deptData]) => ({
                department_name: deptName,
                total_allowance: deptData.total_allowance,
                head_count: deptData.head_count,
                shifts: {
                  shift_A: deptData.shift_A,
                  shift_B: deptData.shift_B,
                  shift_C: deptData.shift_C,
                  shift_PRIME: deptData.shift_PRIME,
                },
              })
            ),
          })
        ),
      })
    );
  };

  useEffect(() => {
    if (data?.dashboard) {
      const transformed = transformData(data);
      setTransformedData(transformed);

      const accountManagers = transformAccountManagers(
        data.dashboard.account_manager
      );
      setAccountManager(accountManagers);
    }
  }, [data]);

  const handleClientSummaryWithDepartments = () => {
    const payload = {
      clients:
        Object.keys(selectedClients).length > 0 ? selectedClients : "ALL",
    };
    if (timelineSelection === "range") {
      if (startMonth) {
        payload.start_month = dayjs(startMonth).format("YYYY-MM");
      }
      if (endMonth) {
        payload.end_month = dayjs(endMonth).format("YYYY-MM");
      }
    }

    if (timelineSelection === "monthly") {
      if (year) {
        payload.selected_year = dayjs(year).format("YYYY");
      }
      if (multipleMonths?.length > 0) {
        payload.selected_months = multipleMonths;
      }
    }
    if (timelineSelection === "quarterly") {
      if (year) {
        payload.selected_year = dayjs(year).format("YYYY");
      }
      if (quarterlySelection?.length > 0) {
        payload.selected_quarters = quarterlySelection;
      }
    }
    if (topFilter) {
      payload.top = topFilter;
    }
    runFetch(payload);
    setClientDialogOpen(false);
  };

  useEffect(() => {
    const loadClientDepartments = async () => {
      try {
        setLoading(true);
        const data = await fetchClientDepartments();
        setClientDepartments(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadClientDepartments();
  }, []);

  const toggleDepartment = (client, dept) => {
    setSelectedClients((prev) => {
      const current = prev[client] || [];
      if (dept === "ALL") {
        const allDepartments =
          clientDepartments.find((c) => c.client === client)?.departments || [];

        if (current.length === allDepartments.length) {
          const updatedState = { ...prev };
          delete updatedState[client];
          return updatedState;
        } else {
          return { ...prev, [client]: [...allDepartments] };
        }
      } else {
        const newDepartments = current.includes(dept)
          ? current.filter((d) => d !== dept)
          : [...current, dept];

        if (newDepartments.length === 0) {
          const updatedState = { ...prev };
          delete updatedState[client];
          return updatedState;
        }

        return { ...prev, [client]: newDepartments };
      }
    });
  };

  useEffect(() => {
    setEndMonth(null);
    setStartMonth(null);
    setYear(null);
    setQuarterlySelection([]);
    setMultipleMonths([]);
  }, [timelineSelection]);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        justifyContent: "center",
        paddingX: 4,
        overflowY: clientDialogOpen ? "hidden" : "auto",
        overflowX: "hidden",
        height: clientDialogOpen ? "100%" : "auto",
      }}
    >
      <Box
        onClick={() => setClientDialogOpen(false)}
        sx={{
          position: "absolute",
          inset: 0,
          top: 0,
          backgroundColor: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(6px)",
          opacity: clientDialogOpen ? 1 : 0,
          pointerEvents: clientDialogOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
          zIndex: 100,
          overflow: "hidden",
        }}
      >
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: 320,
            height: "100%",
            backgroundColor: "white",
            padding: 2,
            transform: clientDialogOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.3s ease",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            overflowY: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              justifyContent: "space-between",
              px: 2.4,
            }}
          >
            <Typography variant="h6">Select Clients</Typography>
            <X
              style={{ cursor: "pointer" }}
              onClick={() => setClientDialogOpen(false)}
            />
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto", ...hideScrollbar }}>
            {clientDepartments.map(({ client, departments }) => {
              const isExpanded = expandedClient === client;
              const clientChecked =
                selectedClients[client]?.length === departments.length &&
                departments.length > 0;
              const clientIndeterminate =
                selectedClients[client]?.length > 0 &&
                selectedClients[client]?.length < departments.length;

              return (
                <Accordion
                  key={client}
                  expanded={isExpanded}
                  onChange={() => setExpandedClient(isExpanded ? null : client)}
                  disableGutters
                  sx={{ background: "transparent", boxShadow: "none" }}
                >
                  <AccordionSummary>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={clientChecked}
                          indeterminate={clientIndeterminate}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => toggleDepartment(client, "ALL")}
                        />
                      }
                      label={
                        <Typography fontWeight={600} fontSize={12}>
                          {client}
                        </Typography>
                      }
                    />
                    <ChevronDown
                      size={18}
                      style={{
                        marginLeft: "auto",
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0)",
                        transition: "0.3s",
                      }}
                    />
                  </AccordionSummary>

                  <AccordionDetails sx={{ pl: 4 }}>
                    {departments.map((dept) => (
                      <FormControlLabel
                        key={dept}
                        control={
                          <Checkbox
                            checked={
                              selectedClients[client]?.includes(dept) || false
                            }
                            onChange={() => toggleDepartment(client, dept)}
                          />
                        }
                        label={dept}
                      />
                    ))}
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            mb: 3,
            alignItems: "center",
            mt: 2,
          }}
        >
          <Button
            variant="outlined"
            color="primary"
            sx={{ py: 1, transition: "all 0.3s ease" }}
            size="small"
            onClick={() => setClientDialogOpen(true)}
          >
            Select Clients
          </Button>

          {timelineSelection === "range" && (
           <LocalizationProvider dateAdapter={AdapterDayjs}>
  <Box sx={{ display: "flex", gap: 2, position: "relative" }}>
    {/* Start Month */}
    <Box sx={{ position: "relative" }}>
      <DatePicker
        views={["year", "month"]}
        label="Start Month"
        value={startMonth ? dayjs(startMonth) : null}
        maxDate={endMonth ? dayjs(endMonth) : undefined}
        disableFuture
        onChange={(newValue) =>
          setStartMonth(newValue ? newValue.format("YYYY-MM") : null)
        }
        inputFormat="YYYY-MM"
        slotProps={{
          popper: {
            disablePortal: false,
            modifiers: [
              {
                name: "preventOverflow",
                options: { altAxis: true },
              },
            ],
          },
          textField: {
            size: "small",
            sx: { width: 200 },
            InputProps: {
              endAdornment: startMonth && (
                <IconButton
                  size="small"
                  onClick={() => setStartMonth(null)}
                >
                  <X size={16} />
                </IconButton>
              ),
            },
          },
        }}
      />

      {isStartMonthInvalid && (
        <FormHelperText
          sx={{
            m: 0,
            p: 0,
            position: "absolute",
            bottom: -20,
            left: 0,
            color: "orange",
          }}
        >
          <span className="flex items-center gap-1">
            <Info size={12} className="block" />
            <span className="text-sm">Start month is required</span>
          </span>
        </FormHelperText>
      )}
    </Box>

    {/* End Month */}
    <Box sx={{ position: "relative" }}>
      <DatePicker
        views={["year", "month"]}
        label="End Month"
        value={endMonth ? dayjs(endMonth) : null}
        minDate={startMonth ? dayjs(startMonth) : undefined}
        disableFuture
        onChange={(newValue) =>
          setEndMonth(newValue ? newValue.format("YYYY-MM") : null)
        }
        inputFormat="YYYY-MM"
        slotProps={{
          popper: {
            disablePortal: false,
            modifiers: [
              {
                name: "preventOverflow",
                options: { altAxis: true },
              },
            ],
          },
          textField: {
            size: "small",
            sx: { width: 200 },
            InputProps: {
              endAdornment: endMonth && (
                <IconButton
                  size="small"
                  onClick={() => setEndMonth(null)}
                >
                  <X size={16} />
                </IconButton>
              ),
            },
          },
        }}
      />

      {isEndMonthInvalid && (
        <FormHelperText
          sx={{
            m: 0,
            p: 0,
            position: "absolute",
            bottom: -39,
            left: 0,
            color: "orange",
          }}
        >
          <span className="flex items-center gap-1">
            <Info size={12} className="block" />
            <span className="text-sm">
              End month must be after start month
            </span>
          </span>
        </FormHelperText>
      )}
    </Box>
  </Box>
</LocalizationProvider>

          )}

          {timelineSelection === "monthly" && (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                views={["year"]}
                label="Select Year"
                value={year}
                onChange={(v) => {
                  setYear(v);
                  setMultipleMonths(v ? monthsList.map((m) => m.value) : []);
                }}
                disableFuture
                slotProps={{
                  textField: { size: "small", sx: { width: 200 } },
                }}
              />
              <Box sx={{ position: "relative", width: 200 }}>
                <FormControl sx={{ width: "100%" }} size="small">
                  <InputLabel>Select Months</InputLabel>
                  <Select
                    multiple
                    value={multipleMonths}
                    disabled={!year}
                    input={<OutlinedInput label="Select Months" />}
                    renderValue={(selected) =>
                      selected.length === 12
                        ? "All Months"
                        : selected
                            .map(
                              (m) =>
                                monthsList.find((x) => x.value === m)?.label
                            )
                            .join(", ")
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.includes("ALL")) {
                        if (multipleMonths.length === 12) {
                          setMultipleMonths([]);
                        } else {
                          setMultipleMonths(monthsList.map((m) => m.value));
                        }
                        return;
                      }
                      const uniqueMonths = [...new Set(value)];
                      if (uniqueMonths.length === monthsList.length) {
                        setMultipleMonths(monthsList.map((m) => m.value));
                      } else {
                        setMultipleMonths(uniqueMonths);
                      }
                    }}
                  >
                    <MenuItem value="ALL">
                      <Checkbox checked={multipleMonths.length === 12} />
                      <ListItemText primary="All Months" />
                    </MenuItem>

                    {monthsList.map((month) => (
                      <MenuItem key={month.value} value={month.value}>
                        <Checkbox
                          checked={multipleMonths.includes(month.value)}
                        />
                        <ListItemText primary={month.label} />
                      </MenuItem>
                    ))}
                  </Select>

                  {!year && (
                    <FormHelperText
                      sx={{
                        position: "absolute",
                        bottom: -20,
                        left: 0,
                        color: "orange",
                        m: 0,
                        p: 0,
                      }}
                    >
                      <span className="flex items-center gap-1">
                        <Info size={12} className="block" />
                        <span className="text-sm">Please select year</span>
                      </span>
                    </FormHelperText>
                  )}
                </FormControl>
              </Box>
            </LocalizationProvider>
          )}

          {timelineSelection === "quarterly" && (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                views={["year"]}
                label="Select Year"
                value={year}
                onChange={(v) => {
                  setYear(v);
                  setQuarterlySelection(
                    v ? quarterlyList.map((m) => m.value) : []
                  );
                }}
                disableFuture
                slotProps={{
                  textField: { size: "small", sx: { width: 200 } },
                }}
              />
              <Box sx={{ position: "relative", width: 200 }}>
                <FormControl sx={{ width: "100%" }} size="small">
                  <InputLabel>Select Quarter</InputLabel>
                  <Select
                    multiple
                    value={quarterlySelection}
                    onChange={(e) =>
                      setQuarterlySelection([...new Set(e.target.value)])
                    }
                    input={<OutlinedInput label="Select Quarter" />}
                    disabled={!year}
                    renderValue={(selected) =>
                      selected.length === 0
                        ? ""
                        : selected
                            .map(
                              (q) =>
                                quarterlyList.find((x) => x.value === q)?.label
                            )
                            .join(", ")
                    }
                  >
                    {quarterlyList.map((qtr) => (
                      <MenuItem key={qtr.value} value={qtr.value}>
                        <Checkbox
                          checked={quarterlySelection.includes(qtr.value)}
                        />
                        <ListItemText primary={qtr.label} />
                      </MenuItem>
                    ))}
                  </Select>
                  {!year && (
                    <FormHelperText
                      sx={{
                        position: "absolute",
                        bottom: -20,
                        left: 0,
                        color: "orange",
                        m:0,
                        p:0
                      }}
                    >
                      <span className="flex items-center gap-1">
                        <Info size={12} className="block" />
                        <span className="text-sm">Please select year</span>
                      </span>
                    </FormHelperText>
                  )}
                </FormControl>
              </Box>
            </LocalizationProvider>
          )}

          <Box>
            <FormControl sx={{ width: 120 }}>
              <InputLabel>Selection</InputLabel>
              <Select
                value={timelineSelection}
                label="Selection"
                size="small"
                onChange={(e) => setTimelineSelection(e.target.value)}
              >
                {timelines.map((timeline) => (
                  <MenuItem key={timeline.value} value={timeline.value}>
                    {timeline.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <FormControl sx={{ width: 120 }}>
              <InputLabel>Filters</InputLabel>
              <Select
                value={topFilter}
                label="Filters"
                size="small"
                onChange={(e) => setTopFilter(e.target.value)}
              >
                <MenuItem value="5">Top 5</MenuItem>
                <MenuItem value="10">Top 10</MenuItem>
                <MenuItem value="ALL">All</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Button
            variant="contained"
            onClick={handleClientSummaryWithDepartments}
            disabled={isEndMonthInvalid}
          >
            Search
          </Button>

          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              setStartMonth(null);
              setEndMonth(null);
              setYear(null);
              setMultipleMonths([]);
              setQuarterlySelection([]);
              setSelectedClients([]);
              setTopFilter("5");
              runFetch({ clients: "ALL", top: "5" });
            }}
          >
            Clear
          </Button>
        </Box>

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            width: "100%",
          }}
        >
          <div className="flex flex-col gap-4 ">
            <div className="flex flex-col md:flex-row gap-4 items-center pt-4 justify-evenly">
              <div className="w-full md:max-w-3/5 h-80 rounded-md shadow-sm flex justify-center items-center">
                {/* DonutChart */}
                {loading ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <CircularProgress color="black" size={40} />
                    <Typography sx={{ color: "black" }}>Loading...</Typography>
                  </Box>
                ) : data?.dashboard &&
                  Object.keys(data.dashboard).length > 0 ? (
                  <DonutChart
                    clients={data.dashboard.clients}
                    onSelectClient={setSelectedDonutClient}
                    topN={topFilter}
                    onSelectColor={setSelectedColor}
                    clientColors={clientColors}
                    setClientColors={setClientColors}
                    enums={enums}
                  />
                ) : (
                  <Typography>No data Available</Typography>
                )}
              </div>

              <div className="w-full md:max-w-2/5 h-80 rounded-md shadow-sm flex justify-center items-center">
                {/* DepartmentBarChart */}
                {loading ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <CircularProgress color="black" size={40} />
                    <Typography sx={{ color: "black" }}>Loading...</Typography>
                  </Box>
                ) : selectedDonutClient &&
                  data?.dashboard &&
                  Object.keys(data.dashboard).length > 0 ? (
                  <DepartmentBarChart
                    clientName={selectedDonutClient}
                    transformedData={transformedData}
                  />
                ) : data?.dashboard &&
                  Object.keys(data.dashboard).length > 0 ? (
                  <h3 className="text-center">
                    Click on the slice to view the graph
                  </h3>
                ) : (
                  <Typography>No data Available</Typography>
                )}
              </div>
            </div>

            <div className="flex flex-row gap-4 justify-evenly w-full">
              <div className="rounded-md shadow-sm p-4 w-[50%] flex items-center justify-center min-h-60">
                {loading ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2,
                    }}
                  >
                    <CircularProgress size={40} />
                    <Typography>Loading...</Typography>
                  </Box>
                ) : horizontalChartData ? (
                  <HorizontalAllowanceBarChart
                    chartDataFromParent={horizontalChartData}
                    enums={enums}
                  />
                ) : (
                  <Typography align="center">No data available</Typography>
                )}
              </div>

              <div className="shadow-sm p-8 rounded-md w-[50%] flex items-center justify-center min-h-60">
                {loading ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2,
                    }}
                  >
                    <CircularProgress size={40} />
                    <Typography>Loading...</Typography>
                  </Box>
                ) : selectedDonutClient && transformedData ? (
                  <DepartmentAllowanceChart
                    clientName={selectedDonutClient}
                    transformedData={transformedData}
                    selectedColor={selectedColor}
                  />
                ) : selectedDonutClient && !transformedData ? (
                  <Typography align="center">No data available</Typography>
                ) : (
                  <Typography align="center">
                    Select a client to view department allowance
                  </Typography>
                )}
              </div>
            </div>

            <div className="pt-4 pb-4 w-full flex items-center justify-center">
              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                  }}
                >
                  <CircularProgress size={40} />
                  <Typography>Loading...</Typography>
                </Box>
              ) : accountMananer.length > 0 ? (
                <AccountManagersTable
                  data={accountMananer}
                  clickedClient={selectedDonutClient}
                  selectedColor={selectedColor}
                />
              ) : (
                <Typography align="center">No data available</Typography>
              )}
            </div>
          </div>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;
