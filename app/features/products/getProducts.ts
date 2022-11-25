import { CommerceApi } from "./constants";

export const getProducts = () => {
  return CommerceApi.products
    .list({
      sortBy: "price",
      sortOrder: "desc",
    })
    .then((response) => response.data);
};
