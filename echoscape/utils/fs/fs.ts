import { ss_get } from "../secureStore/SStore";


import * as FileSystem from "expo-file-system";

export const getUserBaseURI = async () => {
  const username = await ss_get("username");
  return FileSystem.documentDirectory + `user-${username}`;
}