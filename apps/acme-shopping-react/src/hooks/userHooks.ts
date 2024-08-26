import { useQuery } from "@tanstack/react-query";
import { getUsernfo } from "../api/userClient";
import {UserInfo} from "../types/User.ts";

export const useGetUserInfo = () => {
  return useQuery<UserInfo | null, Error>({
    queryKey: ['userInfo'],
    queryFn: getUsernfo
  });
};