import { useState, useCallback, useMemo } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import {
  fetchEmployees,
  fetchEmployeeDetail,
  uploadFile,
  debounce,
  toBackendMonthFormat,
} from "../utils/helper.js";



export const UI_HEADERS = [
  "Emp ID",
  "Emp Name",
  "Department",
  "Shift Details",
  "Client Partner",
  "Client",
  "Duration Month",
  "Payroll Month",
  "Total Allowances",
];

export const EXPORT_HEADERS = [
  // ...UI_HEADERS,
  "Emp ID",
  "Emp Name",
  "Department",
  "Shift Details",
  "Account Manager",
  "Client",
  "Duration Month",
  "Payroll Month",
  "Total Allowances",
  "Project",
  "Practice Lead/ Head",
  "Delivery/ Project Manager",
  "Shift A\n(09 PM to 06 AM)\nINR 500",
  "Shift B\n(04 PM to 01 AM)\nINR 350",
  "Shift C\n(06 AM to 03 PM)\nINR 100",
  "Prime\n(12 AM to 09 AM)\nINR 700",
  "TOTAL DAYS",
];

const FIELD_MAP = {
  emp_id: "Emp ID",
  emp_name: "Emp Name",
  department: "Department",
  account_manager: "Client Partner",
  client: "Client",
  duration_month: "Duration Month",
  payroll_month: "Payroll Month",
  shift_details: "Shift Details",
  total_allowance: "Total Allowances",
};

const backendApi = import.meta.env.VITE_BACKEND_API;


const mapBackendToUI = (row) => {
  const uiRow = {};
  Object.entries(FIELD_MAP).forEach(([key, label]) => {
    uiRow[label] = row[key] ?? "";
  });
  return uiRow;
};

const buildSearchParams = (filters) => {
  const params = {};

  if (filters.query && filters.searchBy) {
    switch (filters.searchBy) {
      case "Emp ID":
        params.emp_id = filters.query;
        break;
      case "Account Manager":
        params.account_manager = filters.query;
        break;
      case "Department":
        params.department = filters.query;
        break;
      case "Client":
        params.client = filters.query;
        break;
      default:
        break;
    }
  }

  if (filters.startMonth) {
    params.start_month = toBackendMonthFormat(filters.startMonth);
  }

  if (filters.endMonth) {
    params.end_month = toBackendMonthFormat(filters.endMonth);
  }

  return params;
};


export const useEmployeeData = () => {
  const token = localStorage.getItem("access_token");

  const [rows, setRows] = useState([]);
  const [displayRows, setDisplayRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({});
  const [shiftSummary, setShiftSummary] = useState(null);
  const [onSave, setOnSave] = useState(false);


  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modelOpen, setModelOpen] = useState(false);
  const [errorRows, setErrorRows] = useState([]);
  const [errorFileLink, setErrorFileLink] = useState(null);
  const [success, setSuccess] = useState("");



  // const getProcessedData = useCallback(
  //   async (start = 0, limit = 10, params = {}) => {
  const getProcessedData = useCallback(
    async (start = 0, limit = 10, params = filters) => {

      try {
        setLoading(true);
        const res = await fetchEmployees({start, limit, params });

        const employees = Array.isArray(res?.data?.employees)
          ? res.data.employees
          : [];

        const shiftDetails = res?.shift_details || {};

        const mapped = employees.map((item, idx) => ({
          id: `${item.emp_id}-${idx}`,
          ...mapBackendToUI(item),
          __fullEmployee: item,
        }));

        setRows(mapped);
        setDisplayRows(mapped);
        const total = res?.total_records ?? 0;

        setTotalRecords(total);
        setTotalPages(total === 0 ? 0 : Math.ceil(total / limit));

        setShiftSummary({
          shiftA: shiftDetails["A(9PM to 6AM)"] ?? 0,
          shiftB: shiftDetails["B(4PM to 1AM)"] ?? 0,
          shiftC: shiftDetails["C(6AM to 3PM)"] ?? 0,
          prime: shiftDetails["PRIME(12AM to 9AM)"] ?? 0,
          total: shiftDetails["total_allowance"] ?? 0,
          head_count: shiftDetails["head_count"] ?? 0,
        });

        if ((res?.total_records ?? 0) === 0) {
          setError("No data found");
        } else {
          setError("");
        }

      } catch (error) {
        const message =
          error?.response?.data?.detail ||error.message|| "Failed to fetch data";
          console.log(message)

        setError(message);
        setRows([]);
        setDisplayRows([]);
        setShiftSummary(null);
        setTotalRecords(0);
        setTotalPages(0);
      }
      finally {
        setLoading(false);
      }
    },
    [token]
  );


  const applyFilters = useCallback(
    async (newFilters, pageNo = 1) => {
      setFilters(newFilters);
      setPage(pageNo);

      const start = (pageNo - 1) * 10;
      await getProcessedData(start, 10, buildSearchParams(newFilters));
    },
    [getProcessedData]
  );



  // const handlePageChange = useCallback(
  //   (newPage) => {
  //     setPage(newPage);
  //     const start = (newPage - 1) * 10;
  //     getProcessedData(start, 10, buildSearchParams(filters));
  //   },
  //   [filters, getProcessedData]
  // );
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);



  const debouncedFetch = useMemo(
    () =>
      debounce(async (params, pageNo = 1) => {
        const start = (pageNo - 1) * 10;
        await getProcessedData(start, 10, params);
      }, 500),
    [getProcessedData]
  );


  const handleIndividualEmployee = useCallback(
    async (emp_id, duration_month, payroll_month) => {
      setLoadingDetail(true);
      try {
        const emp = await fetchEmployeeDetail(
          emp_id,
          duration_month,
          payroll_month
        );
        setSelectedEmployee(emp);
        setModelOpen(true);
      } finally {
        setLoadingDetail(false);
      }
    },
    [token]
  );



  const fetchDataFromBackend = async (file) => {

    setLoading(true);
    setError("");
    setErrorRows([]);
    setErrorFileLink(null);
    setSuccess("");

    try {
      const res = await uploadFile(file);
      setSuccess(res.message || "File uploaded successfully");

      const start = (page - 1) * 10;
      getProcessedData(start, 10, buildSearchParams(filters));
    } catch (err) {
      const errorDetail = err?.detail;

      if (errorDetail) {
        const { message, error_file, error_rows } = errorDetail;

        if (message) setError(message);
        if (error_file) setErrorFileLink(error_file);
        if (error_rows) setErrorRows(error_rows);
      } else {
        setError("Network error");
      }
    }
    finally {
      setLoading(false);
    }
  };



  // const downloadExcel = useCallback(() => {
  //   const data = [Object.fromEntries(EXPORT_HEADERS.map((h) => [h, ""]))];
  //   const ws = XLSX.utils.json_to_sheet(data);
  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, "Employee Data");
  //   XLSX.writeFile(wb, "Allowance_Template.xlsx");
  // }, []);
  const downloadExcel = useCallback(async () => {
    return new Promise((resolve) => {
      const data = [Object.fromEntries(EXPORT_HEADERS.map((h) => [h, ""]))];
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Employee Data");

      XLSX.writeFile(wb, "Allowance_Template.xlsx");

      // allow React to paint loader
      setTimeout(() => {
        resolve();
      }, 0);
    });
  }, []);



  const downloadSearchData = useCallback(
    async ({ query, searchBy, startMonth, endMonth }) => {
      const params = buildSearchParams({ query, searchBy, startMonth, endMonth });

      // if (!Object.keys(params).length) {
      //   alert("Apply filters before downloading");
      //   return;
      // }

      try {
        const res = await axios.get(`${backendApi}/excel/download`, {
          params,
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        });

        const url = URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.download = "Allowance_Data.xlsx";
        link.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        alert("Failed to download data",err);
      }
    },
    [token]
  );


  const downloadErrorExcel = useCallback(async () => {
    if (!errorFileLink) return alert("No error file");

    const res = await axios.get(
      `${backendApi}/upload/error-files/${errorFileLink}`,
      {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const url = URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = "Error_File.xlsx";
    link.click();
    URL.revokeObjectURL(url);
  }, [errorFileLink, token]);



  return {
    UI_HEADERS,
    EXPORT_HEADERS,
    rows,
    displayRows,
    page,
    totalPages,
    totalRecords,
    loading,
    loadingDetail,
    error,
    filters,
    shiftSummary,
    selectedEmployee,
    modelOpen,
    setModelOpen,
    applyFilters,
    debouncedFetch,
    handlePageChange,
    handleIndividualEmployee,
    fetchDataFromBackend,
    errorRows,
    setErrorRows,
    errorFileLink,
    success,
    onSave,
    setOnSave,
    downloadExcel,
    downloadSearchData,
    downloadErrorExcel,
    getProcessedData,
  };
};
