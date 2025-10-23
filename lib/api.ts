// src/lib/api.ts

"use client";

import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { getApiUrl, DEFAULT_API_BASE_URL } from "./config";

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Retry utility function
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const shouldRetry = (error: any, retryCount: number): boolean => {
  // Don't retry if we've exceeded max retries
  if (retryCount >= MAX_RETRIES) return false;
  
  // Don't retry on authentication errors (401)
  if (error.response?.status === 401) return false;
  
  // Don't retry on client errors (4xx except 408, 429)
  if (error.response?.status >= 400 && error.response?.status < 500) {
    return error.response?.status === 408 || error.response?.status === 429;
  }
  
  // Retry on network errors, timeouts, and server errors (5xx)
  return !error.response || error.response?.status >= 500;
};

// ----------------- Axios instance -----------------
let api: AxiosInstance = axios.create({
  baseURL: DEFAULT_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000, // 30 seconds timeout
  withCredentials: true, // Include cookies for CORS
});
// ----------------- Set base URL dynamically -----------------
export const setApiBaseUrl = (company: string) => {
  const url = getApiUrl(company);
  api.defaults.baseURL = url;
  
  // Store company name in localStorage for restoration after refresh
  if (typeof window !== "undefined") {
    localStorage.setItem("api_company", company);
  }
  
  console.log("🌐 API Base URL set to:", url);
};

// ----------------- Restore API base URL from localStorage -----------------
export const restoreApiBaseUrl = () => {
  if (typeof window === "undefined") return;
  
  const storedCompany = localStorage.getItem("api_company");
  if (storedCompany) {
    const url = getApiUrl(storedCompany);
    api.defaults.baseURL = url;
    console.log("🌐 API Base URL restored to:", url);
  }
};
// ----------------- Request interceptor -----------------
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      // Try to get token from user object first, then fallback to access_token
      const userStr = localStorage.getItem("user");
      let token = null;
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          token = user?.token;
        } catch (e) {
          console.error("Error parsing user from localStorage:", e);
        }
      }
      
      // Fallback to direct access_token if user object doesn't have token
      if (!token) {
        token = localStorage.getItem("access_token");
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper function to handle auth failure
const handleAuthFailure = () => {
  if (typeof window !== "undefined") {
    console.log("🚪 Authentication failed, clearing data and redirecting to login");
    // Clear all auth data
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("api_company");
    sessionStorage.clear();
    
    // Redirect to login
    window.location.href = "/login";
  }
};

// ----------------- Response interceptor -----------------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as any;

    // Handle network errors
    if (!error.response) {
      console.error("🌐 Network error:", error.message);
      return Promise.reject({
        ...error,
        message: "Network error. Please check your connection and try again.",
        isNetworkError: true
      });
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error("⏰ Request timeout:", error.message);
      return Promise.reject({
        ...error,
        message: "Request timeout. Please try again.",
        isTimeoutError: true
      });
    }

    // Handle 401 authentication errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log("🔐 401 Unauthorized - Attempting token refresh...");
      
      try {
        const newToken = await refreshAccessToken();

        if (newToken) {
          console.log("✅ Token refreshed successfully");
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          // Refresh failed - logout and redirect
          console.log("❌ Token refresh failed - redirecting to login");
          handleAuthFailure();
          return Promise.reject({
            ...error,
            message: "Session expired. Please login again.",
            isAuthError: true
          });
        }
      } catch (refreshError) {
        // Refresh token request failed - logout and redirect
        console.log("❌ Token refresh error - redirecting to login");
        handleAuthFailure();
        return Promise.reject({
          ...error,
          message: "Session expired. Please login again.",
          isAuthError: true
        });
      }
    }

    // If 401 and already retried, force logout
    if (error.response?.status === 401 && originalRequest._retry) {
      console.log("❌ 401 after retry - forcing logout");
      handleAuthFailure();
      return Promise.reject({
        ...error,
        message: "Session expired. Please login again.",
        isAuthError: true
      });
    }

    // Handle other HTTP errors with better error messages
    const status = error.response?.status;
    const errorData = error.response?.data;
    
    let errorMessage = "An error occurred";
    
    switch (status) {
      case 400:
        errorMessage = errorData?.message || "Bad request. Please check your input.";
        break;
      case 403:
        errorMessage = "Access denied. You don't have permission to perform this action.";
        break;
      case 404:
        errorMessage = "Resource not found.";
        break;
      case 422:
        errorMessage = errorData?.message || "Validation error. Please check your input.";
        break;
      case 500:
        errorMessage = "Server error. Please try again later.";
        break;
      case 502:
      case 503:
      case 504:
        errorMessage = "Service temporarily unavailable. Please try again later.";
        break;
      default:
        errorMessage = errorData?.message || `HTTP ${status} error occurred.`;
    }

    return Promise.reject({
      ...error,
      message: errorMessage,
      status,
      data: errorData
    });
  }
);


// ----------------- AUTH -----------------
export const login = async (username: string, password: string) => {
  const res = await axios.post(
    `${api.defaults.baseURL}/api/users/login_with_password/`,
    { username, password },
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  const { access_token, refresh_token } = res.data;
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
  }
  return res.data;
};

export const refreshAccessToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null;
  
  // Try to get refresh token from user object first, then fallback to direct storage
  const userStr = localStorage.getItem("user");
  let refreshToken = null;
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      refreshToken = user?.refresh_token;
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
    }
  }
  
  // Fallback to direct refresh_token if user object doesn't have it
  if (!refreshToken) {
    refreshToken = localStorage.getItem("refresh_token");
  }
  
  if (!refreshToken) {
    console.log("❌ No refresh token available");
    return null;
  }

  try {
    console.log("🔄 Attempting to refresh access token...");
    const res = await axios.post(
      `${api.defaults.baseURL}/api/users/refresh_token/`,
      { refresh: refreshToken },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000, // 10 seconds timeout
      }
    );
    const newToken = res.data.access;
    
    if (typeof window !== "undefined" && newToken) {
      // Update both storage methods for compatibility
      localStorage.setItem("access_token", newToken);
      
      // Also update the user object if it exists
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          user.token = newToken;
          localStorage.setItem("user", JSON.stringify(user));
        } catch (e) {
          console.error("Error updating user token:", e);
        }
      }
    }
    
    return newToken;
  } catch (error: any) {
    console.error("❌ Token refresh failed:", error.response?.status, error.response?.data);
    // If refresh token is invalid/expired, clear all auth data
    if (error.response?.status === 401) {
      console.log("🚪 Refresh token expired, clearing auth data");
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
      }
    }
    return null;
  }
};

export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("api_company");
  }
};

// ----------------- TENANT API -----------------
export const validateDomain = async (tenantInput: string) => {
  // Build domain based on input (oem → oem.platform-api-test.joulepoint.com)
  const domainUrl = `${tenantInput.toLowerCase()}.platform-api-test.joulepoint.com`;

  const validateUrl = `https://${domainUrl}/api/tenant/validate-domain/`;

  const res = await axios.get(validateUrl, {
    params: { domain: domainUrl },
    headers: { "Content-Type": "application/json" },
  });

  if (res.data.is_valid) {
    // ✅ Update baseURL globally for axios instance
    api.defaults.baseURL = `https://${domainUrl}`;
  }

  return res.data;
};

export const forgotPassword = async (payload: any) => {
  const res = await api.post("/api/users/forgot_password/", payload);
  return res.data;
};
export const setPassword = async (payload: any) => {
  const res = await api.post("/api/users/set_password/", payload);
  return res.data;
};
export const verifyOtp = async (payload: any) => {
  const res = await api.post("/api/users/verify_otp_update/", payload);
  return res.data;
};
/**
 * ✅ TENANT API
//  */
// export const validateDomain = async (domain: string) => {
//   const res = await api.get("/api/tenant/validate-domain/", {
//     params: { domain },
//   });
//   return res.data;
// };

/**
 * ✅ USER APIs
 */
// export const getMyProfile = async () => {
//   const res = await api.get("/api/users/users/me/");
//   return res.data;
// };
export const getMyProfile = async () => {
  const res = await api.get("/api/users/user_profile/");
  return res.data;
};

export const updateUserProfile = async (userId: number, profileData: any) => {
  const res = await api.patch(`/api/users/users/${userId}/profile/`, profileData);
  return res.data;
};

export const listUsers = async (params: {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  exclude_group_id?: number;
} = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.page_size) queryParams.set('page_size', params.page_size.toString());
  if (params.search) queryParams.set('search', params.search);
  if (params.ordering) queryParams.set('ordering', params.ordering);
  if (params.exclude_group_id) queryParams.set('exclude_group_id', params.exclude_group_id.toString());
  
  const url = `/api/users/users/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const res = await api.get(url);
  return res.data;
};
export const createUser = async (payload: any) => {
  console.log("Creating user with payload:", payload);
  console.log("API URL: POST /api/users/users/");
  
  try {
    const res = await api.post("/api/users/users/", payload);
    console.log("User creation successful:", res.data);
    return res.data;
  } catch (error) {
    console.error("Create user API error:", error);
    console.error("Error response:", error?.response?.data);
    console.error("Error status:", error?.response?.status);
    console.error("Error URL:", error?.config?.url);
    throw error;
  }
};

export const getUserPermissions = async (userId: number) => {
  const res = await api.get(`/api/users/users/${userId}/permissions/`);
  return res.data;
};

export const updateUserPermissions = async (userId: number, permissions: number[]) => {
  const res = await api.post(`/api/users/users/${userId}/permissions/`, {
    permissions
  });
  return res.data;
};
export const updateUser = async (id: number, payload: any) => {
  console.log(`Attempting to update user ${id} with payload:`, payload);
  console.log(`API URL: PUT /api/users/users/${id}/`);
  
  try {
    // Try PUT first
    const res = await api.put(`/api/users/users/${id}/`, payload);
    console.log("Update successful with PUT:", res.data);
    return res.data;
  } catch (error) {
    console.error("PUT failed, trying PATCH:", error?.response?.status);
    
    // If PUT fails with 404, try PATCH
    if (error?.response?.status === 404) {
      try {
        const res = await api.patch(`/api/users/users/${id}/`, payload);
        console.log("Update successful with PATCH:", res.data);
        return res.data;
      } catch (patchError) {
        console.error("PATCH also failed:", patchError);
        throw patchError;
      }
    }
    
    console.error("Update user API error:", error);
    console.error("Error response:", error?.response?.data);
    console.error("Error status:", error?.response?.status);
    console.error("Error URL:", error?.config?.url);
    throw error;
  }
};
export const getUser = async (id: number) => {
  console.log(`Fetching user ${id} from: GET /api/users/users/${id}/`);
  try {
    const res = await api.get(`/api/users/users/${id}/`);
    console.log("User fetch successful:", res.data);
    return res.data;
  } catch (error) {
    console.error("Get user API error:", error);
    console.error("Error response:", error?.response?.data);
    console.error("Error status:", error?.response?.status);
    throw error;
  }
};
export const deleteUser = async (id: number) => {
  const res = await api.delete(`/api/users/users/${id}/`);
  return res.data;
};

// Dashboard api....................................................................
export const dashboardSummary = async () => {
  const res = await api.get("/api/fleet/dashboard/summary/");
  return res.data;
};
export const alerts = async () => {
  const res = await api.get("/api/fleet/alerts/");
  return res.data;
};

//group permission
export const assignUsersToGroup = async (groupId: number, users: number[]) => {
  const res = await api.post(`/api/users/groups/${groupId}/users/`, { users });
  return res.data;
};

export const addUsersToGroup = async (groupId: number, users: number[]) => {
  const res = await api.post(`/api/users/groups/${groupId}/users/`, { 
    action: "add", 
    users 
  });
  return res.data;
};

export const removeUsersFromGroup = async (groupId: number, users: number[]) => {
  const res = await api.post(`/api/users/groups/${groupId}/users/`, { 
    action: "remove", 
    users 
  });
  return res.data;
};

export const assignPermissionsToGroup = async (
  groupId: number,
  permissions: number[]
) => {
  const res = await api.post(`/api/users/groups/${groupId}/permissions/`, {
    permissions,
  });
  return res.data;
};
export const getUserGroups = async () => {
  const res = await api.get(`/api/users/groups/`);
  return res.data.results || res.data;
};
export const AddGroups = async (payload: any) => {
  const res = await api.post(`/api/users/groups/`, payload);
  return res.data;
};
export const getGroupsById = async (id: number) => {
  const res = await api.get(`/api/users/groups/${id}`);
  return res.data;
};
export const deleteGroupsById = async (id: number) => {
  const res = await api.delete(`/api/users/groups/${id}/`);
  return res.data;
};
export const updateGroupsById = async (id: number,payload: any) => {
  const res = await api.put(`/api/users/groups/${id}/`,payload);
  return res.data;
};
export const getPermissions = async (params: {
  page?: number;
  page_size?: number;
  search?: string;
  app_label?: string;
  model?: string;
} = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.page_size) queryParams.set('page_size', params.page_size.toString());
  if (params.search) queryParams.set('search', params.search);
  if (params.app_label) queryParams.set('app_label', params.app_label);
  if (params.model) queryParams.set('model', params.model);
  
  const url = `/api/users/permissions/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const res = await api.get(url);
  return res.data;
};

export const getGroupPermissions = async (groupId: number) => {
  const res = await api.get(`/api/users/groups/${groupId}/permissions/`);
  return res.data;
};
export const getGroupUsers = async (groupId: number) => {
  const res = await api.get(`/api/users/groups/${groupId}/users/`);
  return res.data;
};
/**
 * ✅ FLEET & VEHICLES
 */
// export const getVehicleHistory = async (vehicleId: number) => {
//   const response = await api.get(`/api/fleet/history/vehicle/${vehicleId}`);
//   return response.data;
// };
// lib/api.ts

export const getVehicleHistory = async (
  vehicleId: number,
  params: {
    date_range?: "today" | "10days" | "30days" | "90days";
    start_date?: string; // ISO recommended
    end_date?: string; // ISO recommended
    visualization?: string[]; // e.g. ["motor_temperature","battery_level",...]
    category?: string; // overrides visualization
    chart_points?: number; // default 7
    max_points?: number; // default 100
    include_details?: boolean;
    include_raw?: boolean;
    aggregation?: string; // "daily", "hourly", "minute" - controls data granularity
  } = {}
) => {
  if (!Number.isFinite(vehicleId) || vehicleId <= 0) {
    throw new Error("Invalid vehicleId");
  }

  const toISO = (v?: string) => {
    if (!v) return undefined;
    if (/[zZ]$/.test(v) || /[+-]\d{2}:\d{2}$/.test(v)) return v;
    const d = new Date(v);
    return isNaN(d.getTime()) ? v : d.toISOString();
  };

  const qp = new URLSearchParams();
  const base = {
    date_range: params.date_range,
    start_date: toISO(params.start_date),
    end_date: toISO(params.end_date),
    category: params.category,
    chart_points: params.chart_points,
    max_points: params.max_points,
    include_details: params.include_details ? "true" : undefined,
    include_raw: params.include_raw ? "true" : undefined,
    aggregation: params.aggregation,
  } as Record<string, any>;

  Object.entries(base).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qp.set(k, String(v));
  });

  if (!params.category && Array.isArray(params.visualization)) {
    params.visualization.forEach((val) => {
      if (val) qp.append("visualization", String(val));
    });
  }

  const url =
    qp.toString().length > 0
      ? `/api/fleet/history/vehicle/${vehicleId}?${qp.toString()}`
      : `/api/fleet/history/vehicle/${vehicleId}`;

  const response = await api.get(url);
  return response.data;
};

export const getVehicleTelementry = async () => {
  const response = await api.get(`/api/fleet/obd-telemetry/?aggregated=true`);
  return response.data;
};
export const listVehicles = async (
  page: number = 1,
  fleetId?: number,
  vehicletypeId?: number
) => {
  let url = `/api/fleet/vehicles/?page=${page}`;
  if (fleetId) {
    url += `&fleet=${fleetId}`;
  }
  if (vehicletypeId) {
    url += `&vehicle_type=${vehicletypeId}`;
  }
  const response = await api.get(url);
  return response.data;
};
export const listVehiclesWithoutOBD = async (
  page: number = 1,
  fleetId?: number
) => {
  let url = `/api/fleet/vehicles/?page=${page}`;
  if (fleetId) {
    url += `&fleet=${fleetId}`;
  }
  url += `&has_obd=false`;
  const response = await api.get(url);
  return response.data;
};
// export async function listVehicles(params: { page?: number; limit?: number; fleet_operator?: number }) {
//   const query = new URLSearchParams();
//   if (params.page) query.append("page", String(params.page));
//   if (params.limit) query.append("limit", String(params.limit));
//   if (params.fleet_operator) query.append("fleet_operator", String(params.fleet_operator));

//   return fetch(`/api/vehicles?${query.toString()}`).then((res) => res.json());
// }

export const createVehicle = async (payload: any) => {
  const res = await api.post("/api/fleet/vehicles/", payload);
  return res.data;
};
export const updateVehicle = async (id: number, payload: any) => {
  const res = await api.put(`/api/fleet/vehicles/${id}/`, payload);
  return res.data;
};
export const getVehicleById = async (id: number) => {
  const res = await api.get(`/api/fleet/vehicles/${id}/`);
  return res.data;
};

export const deleteVehicle = async (id: number) => {
  const response = await api.delete(`/api/fleet/vehicles/${id}/`);
  return response.data;
};
//vehicle types
// export const listVehiclesType = async () => {
//   const response = await api.get("/api/fleet/vehicle-types/")
//   return response.data.results
// }
// in lib/api.ts
export const listVehiclesType = async (page: number = 1) => {
  const response = await api.get(`/api/fleet/vehicle-types/?page=${page}`);
  return response.data; // backend should return results + count or next/prev
};

// Create a new vehicle type
export const createVehicleType = async (payload: any) => {
  const response = await api.post("/api/fleet/vehicle-types/", payload);
  return response.data;
};
export const updateVehicleType = async (id: number, payload: any) => {
  const response = await api.put(`/api/fleet/vehicle-types/${id}/`, payload);
  return response.data;
};

// Delete a vehicle type by ID
export const deleteVehicleType = async (id: number) => {
  const response = await api.delete(`/api/fleet/vehicle-types/${id}/`);
  return response.data;
};
export const getVehicleType = async (id: number) => {
  const res = await api.get(`api/fleet/vehicle-types/${id}/`);
  return res.data;
};
// export async function getVehicleHistory(
//   vehicleId: number,
//   filters?: {
//     date_range?: "today" | "10days" | "30days" | "90days";
//     start_date?: string;
//     end_date?: string;
//     visualization?: string[];
//     category?: string;
//     chart_points?: number;
//     max_points?: number;
//     include_details?: boolean;
//     include_raw?: boolean;
//   }
// ) {
//   const params = new URLSearchParams();
//   if (filters?.date_range) params.set("date_range", filters.date_range);
//   if (filters?.start_date) params.set("start_date", filters.start_date);
//   if (filters?.end_date) params.set("end_date", filters.end_date);
//   if (filters?.category) params.set("category", filters.category);
//   (filters?.visualization ?? []).forEach((v) => params.append("visualization", v));
//   if (filters?.chart_points != null) params.set("chart_points", String(filters.chart_points));
//   if (filters?.max_points != null) params.set("max_points", String(filters.max_points));
//   if (filters?.include_details != null) params.set("include_details", String(filters.include_details));
//   if (filters?.include_raw != null) params.set("include_raw", String(filters.include_raw));

//   const res = await fetch(`/api/vehicles/${vehicleId}/history?${params.toString()}`, {
//     credentials: "include",
//   });
//   if (!res.ok) throw new Error("Failed to fetch vehicle history");
//   return res.json();
// }

/**
 * ✅ OBD Devices
 */
export const listDevices = async (page: number = 1) => {
  const resp = await api.get(`/api/fleet/obd-devices/?page=${page}`);
  return resp.data;
};

export const createDevice = async (data: any) => {
  const resp = await api.post("/api/fleet/obd-devices/", data);
  return resp.data;
};

export const updateDevice = async (id: number, data: any) => {
  const resp = await api.put(`/api/fleet/obd-devices/${id}/`, data);
  return resp.data;
};

export const deleteDevice = async (id: number) => {
  const resp = await api.delete(`/api/fleet/obd-devices/${id}/`);
  return resp.data;
};

export const listOBDDevices = async () => {
  const res = await api.get("/api/fleet/obd-devices/");
  return res.data;
};

export const getOBDDevice = async (id: number) => {
  const res = await api.get(`/api/fleet/obd-devices/${id}/`);
  return res.data;
};
//obd telemetry
// lib/api.ts
// export const listOBDTelemetry = async (
//   page: number = 1,
//   vehicleId?: number
// ) => {
//   let url = `/api/fleet/obd-telemetry/?page=${page}`;
//   if (vehicleId) {
//     url += `&vehicle=${vehicleId}`;
//   }
//   const res = await api.get(url);
//   return res.data;
// };
// lib/api.ts

type ListOBDParams = {
  page?: number;
  page_size?: number;
  timestamp_after?: string;
  timestamp_before?: string;
  trip?: string | number;
  trip_id?: string | number;
  vehicle?: string | number;
  vehicle_vin?: string;
  min_speed?: string | number;
  max_speed?: string | number;
  min_battery?: string | number;
  max_battery?: string | number;
  min_motor_temp?: string | number;
  max_motor_temp?: string | number;
  min_range?: string | number;
  max_range?: string | number;
  has_error_codes?: "true" | "false";
  ordering?: string; // e.g. "-timestamp"
  aggregated?: boolean;
  top_errors?: boolean;
};

export const listOBDTelemetry = async (
  params: ListOBDParams | number = 1
): Promise<any> => {
  // Backward compatibility for old signature: listOBDTelemetry(page, vehicleId?)
  if (typeof params === "number") {
    const url = `/api/fleet/obd-telemetry/?page=${params}`;
    const res = await api.get(url);
    return res.data;
  }

  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    p.set(k, String(v));
  });

  const url = `/api/fleet/obd-telemetry/?${p.toString()}`;
  const res = await api.get(url);
  return res.data;
};

export const getOBDTelemetry = async (id: number) => {
  const res = await api.get(`/api/fleet/obd-telemetry/${id}/`);
  return res.data;
};

/**
 * ✅ SIM MANAGEMENT
 */
export const getSIMCard = async (id: number) => {
  const res = await api.get(`/api/fleet/sim-cards/${id}/`);
  return res.data;
};
export const deleteSIMCard = async (id: number) => {
  const res = await api.delete(`/api/fleet/sim-cards/${id}/`);
  return res.data;
};
export const listSIMCards = async (page: number = 1) => {
  const res = await api.get(`/api/fleet/sim-cards/?page=${page}`);
  return res.data;
};
export const listSIMCardsSummary = async () => {
  const res = await api.get("/api/fleet/sim-cards/summary/");
  return res.data;
};
export const createSIM = async (data: any) => {
  const res = await api.post("/api/fleet/sim-cards/", data);
  return res.data;
};
export const updateSIMCard = async (id: number, data: any) => {
  const res = await api.patch(`/api/fleet/sim-cards/${id}/`, data);
  return res.data;
};
export const suspendSIM = async (id: number) => {
  const res = await api.post(`/api/fleet/sim-cards/${id}/suspend/`);
  return res.data;
};

/**
 * ✅ GENERIC HELPERS
 */
export const getRequest = async (url: string, params: any = {}, signal?: AbortSignal) => {
  const res = await api.get(url, { params, signal });
  return res.data;
};

export const postRequest = async (url: string, data: any = {}, signal?: AbortSignal) => {
  const res = await api.post(url, data, { signal });
  return res.data;
};

// Request cancellation helper
export const createAbortController = () => new AbortController();

// Enhanced API call with retry logic
export const apiCallWithRetry = async (
  apiCall: () => Promise<any>,
  retryCount: number = 0
): Promise<any> => {
  try {
    return await apiCall();
  } catch (error) {
    if (shouldRetry(error, retryCount)) {
      console.log(`🔄 Retrying API call (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await sleep(RETRY_DELAY * Math.pow(2, retryCount)); // Exponential backoff
      return apiCallWithRetry(apiCall, retryCount + 1);
    }
    throw error;
  }
};
//alerts
export const listAlerts = async (page: number = 1) => {
  const res = await api.get(`/api/fleet/alerts/?page=${page}`);
  return res.data;
};
export const getAlerts = async (id: number) => {
  const res = await api.get(`/api/fleet/alerts/${id}`);
  return res.data;
};
export const resolveAlerts = async (id: number) => {
  const res = await api.patch(`/api/fleet/alerts/${id}/resolve`);
  return res.data;
};
// alert Rule api
export const listAlertRules = async (page: number = 1) => {
  const res = await api.get(`/api/fleet/alert-rules/?page=${page}`);
  return res.data;
};

export const createAlertRules = async (data: any) => {
  const res = await api.post("/api/fleet/alert-rules/", data);
  return res.data;
};

export const updateAlertRules = async (id: number, data: any) => {
  const res = await api.put(`/api/fleet/alert-rules/${id}/`, data);
  return res.data;
};
export const deleteAlertRule = async (id: number) => {
  const resp = await api.delete(`/api/fleet/alert-rules/${id}/`);
  return resp.data;
};
export const getAlertRuleById = async (id: number) => {
  const resp = await api.get(`/api/fleet/alert-rules/${id}/`);
  return resp.data;
};
//fleet operator.......................................................
export const listFleetOperators = async (page: number = 1) => {
  const res = await api.get(`/api/fleet/fleet-operators/?page=${page}`);
  return res.data;
};

// Get fleet operator by ID
export const getFleetOperatorById = async (id: number) => {
  const res = await api.get(`/api/fleet/fleet-operators/${id}/`);
  return res.data;
};
// ✅ Patch Fleet Operator (Upload Logo)
export const updateFleetOperatorLogo = async (id: number, file: File) => {
  const formData = new FormData();
  formData.append("logo", file);

  const res = await api.patch(`/api/fleet/fleet-operators/${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// For FormData (file uploads)
export const createFleetOperator = async (data: any) => {
  try {
    console.log("Sending FormData payload:", data);
    console.log("API Base URL:", api.defaults.baseURL);
    console.log("Full URL:", `${api.defaults.baseURL}/api/fleet/fleet-operators/`);

    // Check if data is FormData, send it correctly
    let config = {};
    if (data instanceof FormData) {
      config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      };
    } else {
      config = {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      };
    }

    console.log("Request config:", config);

    const res = await api.post("/api/fleet/fleet-operators/", data, config);

    console.log("API response:", res.data);
    return res.data;
  } catch (error: any) {
    console.error("API Error:", error.response?.data || error.message);
    console.error("Error status:", error.response?.status);
    console.error("Error headers:", error.response?.headers);

    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to create fleet operator";

    throw new Error(errorMessage);
  }
};

// Update fleet operator by ID
export const updateFleetOperator = async (id: number, data: any) => {
  const res = await api.put(`/api/fleet/fleet-operators/${id}/`, data);
  return res.data;
};

// Delete fleet operator by ID
export const deleteFleetOperator = async (id: number) => {
  const res = await api.delete(`/api/fleet/fleet-operators/${id}/`);
  return res.data;
};
////////////////////////////////////////
//firmware updates...............
export const listFirmwareUpdates = async (page: number = 1) => {
  const res = await api.get(`/api/fleet/firmware-updates/?page=${page}`);
  return res.data;
};
export const rollOutFirmwareUpdates = async (id: number) => {
  const res = await api.post(`/api/fleet/firmware-updates/${id}/resume/`);
  return res.data;
};

export const pauseFirmwareUpdates = async (id: number) => {
  const res = await api.post(`/api/fleet/firmware-updates/${id}/pause/`);
  return res.data;
};
export const firmwareUpdatesByID = async (id: number) => {
  const res = await api.get(`/api/fleet/firmware-updates/${id}`);
  return res.data;
};
export const firmwareUpdatesDelete = async (id: number) => {
  const res = await api.delete(`/api/fleet/firmware-updates/${id}`);
  return res.data;
};
export const firmwareUpdatesSummary = async (id: number) => {
  const res = await api.get(`/api/fleet/firmware-updates/${id}/summary/`);
  return res.data;
};
export const createFirmwareUpdates = async (data: any) => {
  // Check if data is FormData, send it correctly
  let config = {};
  if (data instanceof FormData) {
    config = {
      headers: {
        "Content-Type": "multipart/form-data", // important for file uploads
      },
    };
  }

  const res = await api.post("/api/fleet/firmware-updates/", data, config);
  return res.data;
};

export const updateFirmwareUpdates = async (id: number, data: any) => {
  // Check if data is FormData, send it correctly
  let config = {};
  if (data instanceof FormData) {
    config = {
      headers: {
        "Content-Type": "multipart/form-data", // important for file uploads
      },
      timeout: 60000, // 60 seconds for file uploads
    };
  } else {
    // For JSON data, set proper content type
    config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
  }

  try {
    // Try PATCH instead of PUT to avoid triggering status validation
    const res = await api.patch(`/api/fleet/firmware-updates/${id}/`, data, config);
    return res.data;
  } catch (error) {
    console.error("Firmware update error:", error);
    throw error;
  }
};

export default api;
// src/lib/api.ts
// src/lib/api.ts
// "use client";

// import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
// import { getApiUrl, DEFAULT_API_BASE_URL,DOMAIN_MAP } from "./config";

// // ----------------- Axios instance -----------------
// let api: AxiosInstance = axios.create({
//   baseURL: DEFAULT_API_BASE_URL,
//   headers: { "Content-Type": "application/json" },
// });

// // ----------------- Set base URL dynamically -----------------
// export const setApiBaseUrl = (tenant: string) => {
//   const url = getApiUrl(tenant);
//   api.defaults.baseURL = url;
// };

// // ----------------- Request interceptor -----------------
// api.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
//     if (token) config.headers.Authorization = `Bearer ${token}`;
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // ----------------- Response interceptor -----------------
// api.interceptors.response.use(
//   (response: AxiosResponse) => response,
//   async (error) => {
//     const originalRequest = error.config as any;
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       const newToken = await refreshAccessToken();
//       if (newToken) {
//         originalRequest.headers.Authorization = `Bearer ${newToken}`;
//         return api(originalRequest);
//       } else {
//         logout();
//         if (typeof window !== "undefined") window.location.href = "/login";
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// // ----------------- AUTH -----------------
// export const login = async (username: string, password: string) => {
//   const res = await axios.post(`${api.defaults.baseURL}/api/users/login_with_password/`, { username, password }, {
//     headers: { "Content-Type": "application/json" },
//   });
//   const { access_token, refresh_token } = res.data;
//   if (typeof window !== "undefined") {
//     localStorage.setItem("access_token", access_token);
//     localStorage.setItem("refresh_token", refresh_token);
//   }
//   return res.data;
// };

// export const refreshAccessToken = async (): Promise<string | null> => {
//   const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
//   if (!refreshToken) return null;

//   try {
//     const res = await axios.post(`${api.defaults.baseURL}/api/users/refresh_token/`, { refresh: refreshToken }, {
//       headers: { "Content-Type": "application/json" },
//     });
//     const newToken = res.data.access;
//     if (typeof window !== "undefined") localStorage.setItem("access_token", newToken);
//     return newToken;
//   } catch {
//     return null;
//   }
// };

// export const logout = () => {
//   if (typeof window !== "undefined") {
//     localStorage.removeItem("access_token");
//     localStorage.removeItem("refresh_token");
//   }
// };

// // ----------------- TENANT API -----------------
// export const validateDomain = async (tenantInput: string) => {
//   // Build domain based on input (oem → oem.platform-api-test.joulepoint.com)
//   const domainUrl = `${tenantInput.toLowerCase()}.platform-api-test.joulepoint.com`;

//   const validateUrl = `https://${domainUrl}/api/tenant/validate-domain/`;

//   const res = await axios.get(validateUrl, {
//     params: { domain: domainUrl },
//     headers: { "Content-Type": "application/json" },
//   });

//   if (res.data.is_valid) {
//     // ✅ Update baseURL globally for axios instance
//     api.defaults.baseURL = `https://${domainUrl}`;
//   }

//   return res.data;
// };

// // ----------------- USER APIs -----------------
// export const getMyProfile = async () => (await api.get("/api/users/users/me/")).data;
// export const listUsers = async (page = 1) => (await api.get(`/api/users/users/?page=${page}`)).data;
// export const createUser = async (payload: any) => (await api.post("/api/users/users/", payload)).data;
// export const getUserPermissions = async (userId: number) => (await api.get(`/api/users/users/${userId}/permissions/`)).data;
// export const updateUser = async (id: number, payload: any) => (await api.put(`/api/users/users/${id}/`, payload)).data;
// export const getUser = async (id: number) => (await api.get(`/api/users/users/${id}/`)).data;
// export const deleteUser = async (id: number) => (await api.delete(`/api/users/users/${id}/`)).data;

// // ----------------- GROUP & PERMISSIONS -----------------
export const getGroups = async () => {
  const res = await api.get("/api/users/groups/");
  return res.data.results;
};
// export const getPermissions = async () => (await api.get("/api/users/permissions/")).data.results;
// export const getGroupPermissions = async (groupId: number) => (await api.get(`/api/users/groups/${groupId}/permissions/`)).data;
// export const assignUsersToGroup = async (groupId: number, users: number[]) => (await api.post(`/api/users/groups/${groupId}/users/`, { users })).data;
// export const assignPermissionsToGroup = async (groupId: number, permissions: number[]) => (await api.post(`/api/users/groups/${groupId}/permissions/`, { permissions })).data;

// // ----------------- DASHBOARD -----------------
// export const dashboardSummary = async () => (await api.get("/api/fleet/dashboard/summary/")).data;
// export const alerts = async () => (await api.get("/api/fleet/alerts/")).data;

// // ----------------- VEHICLES -----------------
// export const listVehicles = async (page = 1) => (await api.get(`/api/fleet/vehicles/?page=${page}`)).data;
// export const createVehicle = async (payload: any) => (await api.post("/api/fleet/vehicles/", payload)).data;
// export const updateVehicle = async (id: number, payload: any) => (await api.put(`/api/fleet/vehicles/${id}/`, payload)).data;
// export const getVehicleById = async (id: number) => (await api.get(`/api/fleet/vehicles/${id}/`)).data;
// export const deleteVehicle = async (id: number) => (await api.delete(`/api/fleet/vehicles/${id}/`)).data;

// // ----------------- FLEET OPERATORS -----------------
// export const listFleetOperators = async (page = 1) => (await api.get(`/api/fleet/fleet-operators/?page=${page}`)).data;
// export const getFleetOperatorById = async (id: number) => (await api.get(`/api/fleet/fleet-operators/${id}/`)).data;
// export const createFleetOperator = async (data: any) => (await api.post("/api/fleet/fleet-operators/", data)).data;
// export const updateFleetOperator = async (id: number, data: any) => (await api.put(`/api/fleet/fleet-operators/${id}/`, data)).data;
// export const deleteFleetOperator = async (id: number) => (await api.delete(`/api/fleet/fleet-operators/${id}/`)).data;

// // ----------------- SIM MANAGEMENT -----------------
// export const listSIMCards = async () => (await api.get("/api/fleet/sim-cards/")).data;
// export const listSIMCardsSummary = async () => (await api.get("/api/fleet/sim-cards/summary/")).data;
// export const createSIM = async (data: any) => (await api.post("/api/fleet/sim-cards/", data)).data;
// export const suspendSIM = async (id: number) => (await api.post(`/api/fleet/sim-cards/${id}/suspend/`)).data;

// // ----------------- ALERT RULES -----------------
// export const listAlertRules = async () => (await api.get("/api/fleet/alert-rules/")).data;
// export const createAlertRules = async (data: any) => (await api.post("/api/fleet/alert-rules/", data)).data;
// export const updateAlertRules = async (id: number, data: any) => (await api.put(`/api/fleet/alert-rules/${id}/`, data)).data;
// export const deleteAlertRule = async (id: number) => (await api.delete(`/api/fleet/alert-rules/${id}/`)).data;

// // ----------------- FIRMWARE UPDATES -----------------
// export const listFirmwareUpdates = async (page = 1) => (await api.get(`/api/fleet/firmware-updates/?page=${page}`)).data;
// export const rollOutFirmwareUpdates = async (id: number) => (await api.post(`/api/fleet/firmware-updates/${id}/resume/`)).data;
// export const firmwareUpdatesByID = async (id: number) => (await api.get(`/api/fleet/firmware-updates/${id}`)).data;
// export const firmwareUpdatesSummary = async (id: number) => (await api.get(`/api/fleet/firmware-updates/${id}/summary/`)).data;
// export const createFirmwareUpdates = async (data: any) => {
//   const config = data instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
//   return (await api.post("/api/fleet/firmware-updates/", data, config)).data;
// };

// export default api;
