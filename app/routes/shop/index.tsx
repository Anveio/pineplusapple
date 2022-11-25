import { useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "stream/consumers";
import { PageWrapper } from "~/components/PageWrapper";
import { getProducts } from "~/features/products";

export async function loader({ request }: LoaderArgs) {
  try {
    const products = await getProducts();
    return products;
  } catch (e) {
    return [];
  }
}

export default function Store() {
  const data = useLoaderData<typeof loader>();
  console.log(data);
  return <PageWrapper title="Shop">{JSON.stringify(data)}</PageWrapper>;
}
