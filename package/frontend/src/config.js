import { Platform } from "react-native";

const URL_POR_DEFECTO = Platform.OS === "android" ? "http://10.0.2.2:4000/api" : "http://localhost:4000";

// Acepta la URL con o sin el sufijo /api y sin barra final.
function normalizarUrlApi(url) {
  const base = url.trim().replace(/\/+$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
}

// Expo reemplaza process.env.EXPO_PUBLIC_* al empaquetar: se define en package/frontend/.env.
export const URL_API = normalizarUrlApi(process.env.EXPO_PUBLIC_API_URL || URL_POR_DEFECTO);
