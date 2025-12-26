import api from "./api";

export const loginAPI = async (email, password, role) => {
  const response = await api.post("/global/login", {
    email,
    password,
    role
  });

  return response.data;
};

export const getProfileAPI = async () => {
  const response = await api.get("/global/profile");
  return response.data;
}

