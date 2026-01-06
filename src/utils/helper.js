import axios from "axios";
import axiosInstance from "./axiosInstance";

const backendApi = import.meta.env.VITE_BACKEND_API;
const token = localStorage.getItem("access_token");


export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};


export const fetchDashboardClientSummary = async (
  payload
) => {
 

  try {
   const response = await axiosInstance.post(
      "/dashboard/client-allowance-summary",
      payload
    );
    return response.data;
  } catch (err) {
    throw new Error(
      err?.response?.data?.detail ||
      err?.message ||
      "Unable to fetch summary data."
    );
  }
};


export const fetchEmployees = async ({
  start = 0,
  limit = 10,
  params = {},
}) => {
  try {
    const hasParams = Object.keys(params).length > 0;

    const requestParams = hasParams
      ? { ...params, start, limit }
      : { start, limit };

    const response = await axiosInstance.get(
      "/employee-details/search",
      {
        params: requestParams,
      }
    );

    const data = response.data;

    // Normalize API response shape
    if (Array.isArray(data?.data?.data)) {
      return {
        ...data,
        data: data.data.data,
      };
    }

    if (Array.isArray(data?.data)) {
      return data;
    }

    return data;
  } catch (err) {
    throw new Error(
      err?.response?.data?.detail ||
      err?.message ||
      "Unable to fetch employees."
    );
  }
};


export const fetchEmployeeDetail = async (
  emp_id,
  duration_month,
  payroll_month
) => {
  try {
    const response = await axiosInstance.get(
      "/display/details",
      {
        params: {
          emp_id,
          duration_month,
          payroll_month,
        },
      }
    );

    return response.data;
  } catch (err) {
    throw new Error(
      err?.response?.data?.detail ||
      err?.message ||
      "Unable to fetch employee details."
    );
  }
};


export const uploadFile = async (file) => {
  if (!file) throw new Error("No file selected");

  const formData = new FormData();
  formData.append("file", file); 

  try {
    const response = await axiosInstance.post("/upload", formData);
    return response.data;
  } catch (err) {
    console.error("Upload error:", err.response?.data || err.message);
    throw new Error(
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err?.message ||
      "File upload failed"
    );
  }
};




export const updateEmployeeShift = async (
  emp_id,
  duration_month,
  payroll_month,
  payload
) => {
  try {
    const response = await axiosInstance.put(
      "/display/update",
      payload,
      {
        params: {
          emp_id,
          duration_month,
          payroll_month,
        },
      }
    );

    return response.data;
  } catch (err) {
    throw new Error(
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err?.message ||
      "Something went wrong while updating shift"
    );
  }
};

export const toBackendMonthFormat = (monthStr) => {
  if (!monthStr) return "";

  const months = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };

  const match = monthStr.match(/([A-Za-z]{3})'(\d{2})/);
  if (!match) return monthStr;

  const [, mon, year] = match;
  const yyyy = "20" + year; 
  return `${yyyy}-${months[mon]}`;
};


export const toFrontendMonthFormat = (monthStr) => {
  if (!monthStr) return "";

  const [year, month] = monthStr.split("-");
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  return `${months[parseInt(month, 10) - 1]}'${year.slice(2)}`;
};


export const correctEmployeeRows = async (correctedRows) => {
  if (!token) throw new Error("Not authenticated");
 
  const payload = correctedRows.map(({ reason, ...row }) => row);
 
  try {
    const response = await axiosInstance.post(
      `/upload/correct_error_rows`,
      { corrected_rows: payload }
    );
 
    return response.data;
  } catch (err) {
     throw new Error(
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err?.message ||
      "Failed to correct employee rows"
    );
  }
};


export const fetchClientSummary = async (
  payload
) => {
  if (!token) throw new Error("Not authenticated");

  try {
    const response = await axios.post(
      `${backendApi}/client-summary`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (err) {
    throw new Error(
      err?.response?.data?.detail ||
      err?.message ||
      "Unable to fetch summary data."
    );
  }
};

export const downloadClientSummary = async (payload) => {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("Not authenticated");

  const response = await axios.post(
    `${backendApi}/client-summary/download`,
    payload,
    {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data; // this is a Blob
};



// export const fetchEmployeesByMonthRange = async (token, startMonth, endMonth) => {
//   if (!token) throw new Error("Not authenticated");

//   const url = `${backendApi}/monthly/search`;

//   try {
//     const response = await axios.get(url, {
//       params: { start_month: startMonth, end_month: endMonth },
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     console.log("Month range response:", response.data)
//     if (!Array.isArray(response.data) || response.data.length === 0) {
//       return [];
//     }

//     return response.data;
//   } catch (err) {
//     console.error(err);
//     if (err?.response?.data?.detail) {
//       throw new Error(err.response.data.detail);
//     }
//     throw new Error(`No data found for month range ${startMonth} to ${endMonth}`);
//   }
// };



// export const fetchClientComparison = async (
//   searchBy = "",
//   startMonth = "",
//   endMonth = "",
//   client = ""
// ) => {
//   const token = localStorage.getItem("access_token");
//   if (!token) throw new Error("Not authenticated");
//   if (!client) throw new Error("Client is required");

//   const params = new URLSearchParams();
//   params.append("client", client);

//   if (startMonth) params.append("start_month", startMonth);
//   if (endMonth) params.append("end_month", endMonth);
//   if (searchBy) params.append("account_manager", searchBy);

//   try {
//     const response = await axios.get(
//       `${backendApi}/client-comparison?${params.toString()}`,
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     return response.data;
//   } catch (err) {
//     if (err?.response?.data?.detail) throw new Error(err.response.data.detail);
//     if (err?.message) throw new Error(err.message);
//     throw new Error("Unable to fetch client comparison data.");
//   }
// };

export const fetchClientDepartments = async () => {
  try {
    const response = await axiosInstance.get(
      "/client-departments"
    );
    return response.data;
  } catch (err) {
    throw new Error(
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err?.message ||
      "Failed to fetch client departments"
    );
  }
};


export const fetchClientEnums = async () => {
  try {
    const response = await axiosInstance.get(
      "/display/client-enum"
    );
    return response.data;
  } catch (err) {
    throw new Error(
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err?.message ||
      "Failed to fetch client enums"
    );
  }
};


export const fetchClients = async () => {
  try {
    const response = await axiosInstance.get("/dashboard/clients");
    return response.data;
  } catch (err) {
    throw new Error(
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err?.message ||
      "Failed to fetch clients"
    );
  }
};

export const getMonthString = (monthIndex) => {
  return dayjs().month(monthIndex).format("YYYY-MM");
};