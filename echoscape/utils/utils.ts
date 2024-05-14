import { ss_delete, ss_save } from "@/utils/secureStore/SStore"

export const invalidateToken = async () => {
    await ss_save("token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MTM2MDEzNjB9.YLRZxKJCGllmVK1TILiSd7yOajJpcX8f3abvThNaw7M")
    await ss_save("lastUpdate", "2021-02-13T15:00:00.000Z")
}

export const invalidateUser = async () => {
    await ss_delete("username");
    await ss_delete("password");

}