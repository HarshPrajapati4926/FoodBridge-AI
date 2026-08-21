import api from "./axiosInstance";

export const fetchNgoMatches = () => api.get("/ngo/matches");
export const acceptMatch = (matchId) => api.patch(`/ngo/matches/${matchId}/accept`);
export const rejectMatch = (matchId) => api.patch(`/ngo/matches/${matchId}/reject`);
export const fetchNgoDonations = () => api.get("/ngo/donations");
export const fetchAllNGOsForMap = () => api.get("/ngo/map");
export const advanceDonationStatus = (donationId) => api.patch(`/donations/${donationId}/status`);
export const fetchDonationsForMap = () => api.get("/donations/map");
export const fetchImpactStats = () => api.get("/impact/stats");
