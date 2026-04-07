import api from "./api";

// ── Auth ───────────────────────────────────────────────────────────────
export const authService = {
  login:         (email, password) => api.post("/auth/login",          { email, password }),
  logout:        ()                => api.post("/auth/logout"),
  me:            ()                => api.get("/auth/me"),
  forgotPassword:(email)           => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) => api.post("/auth/reset-password",  { token, password }),
};

// ── Products ───────────────────────────────────────────────────────────
export const productService = {
  getAll:      (params) => api.get("/products/",              { params }),
  getOne:      (id)     => api.get(`/products/${id}`),
  create:      (data)   => api.post("/products/",             data),
  update:      (id, d)  => api.put(`/products/${id}`,         d),
  remove:      (id)     => api.delete(`/products/${id}`),
  uploadImage: (id, file) => {
    const fd = new FormData();
    fd.append("image", file);
    return api.post(`/products/${id}/image`, fd, { headers: { "Content-Type": "multipart/form-data" } });
  },
};

// ── Inventory ──────────────────────────────────────────────────────────
export const inventoryService = {
  getAll:       (params) => api.get("/inventory/",            { params }),
  getLowStock:  ()       => api.get("/inventory/low-stock"),
  movement:     (data)   => api.post("/inventory/movement",   data),
  getMovements: (params) => api.get("/inventory/movements",   { params }),
};

// ── Sales ──────────────────────────────────────────────────────────────
export const saleService = {
  create:  (data)   => api.post("/sales/",       data),
  getAll:  (params) => api.get("/sales/",         { params }),
  getOne:  (id)     => api.get(`/sales/${id}`),
};

// ── Reports ────────────────────────────────────────────────────────────
export const reportService = {
  summary:      ()       => api.get("/reports/summary"),
  salesByDay:   (days)   => api.get("/reports/sales-by-day",  { params: { days } }),
  topProducts:  ()       => api.get("/reports/top-products"),
};

// ── Users ──────────────────────────────────────────────────────────────
export const userService = {
  getAll:  ()        => api.get("/users/"),
  create:  (data)    => api.post("/users/",      data),
  update:  (id, d)   => api.put(`/users/${id}`,  d),
};
