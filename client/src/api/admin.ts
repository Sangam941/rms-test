import api from "./axios";

export async function generateQrApi(tableCode: string) {
  const response = await api.post("/tables/generate-qr", { tableCode });
  return response.data;
}

