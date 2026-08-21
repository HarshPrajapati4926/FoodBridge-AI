import api from "./axiosInstance";

export const createDonation = (formData) =>
  api.post("/donations", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const fetchMyDonations = () => api.get("/donations/mine");
export const fetchDonationMatches = (id) => api.get(`/donations/${id}/matches`);
