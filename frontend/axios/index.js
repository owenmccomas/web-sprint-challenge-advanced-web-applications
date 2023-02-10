import axios from "axios";

export function axiosWithAuth() {
  const token = window.localStorage.getItem("token");
  return axios.create({
    headers: {
      Authorization: token,
    },
  });
}
