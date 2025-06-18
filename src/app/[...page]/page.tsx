import dynamic from "next/dynamic";
import {getMenuByPath} from "@/lib/getMenuByPath";

const mapping = [
  {
    id: 1,
    pId: null,
    link: '/home',
    component: 'Main'
  },
  {
    id: 2,
    pId: 1,
    link: '/home/temp',
    component: 'Main'
  },
]

export default async function PageMapper(props: { params: { page?: string[] } }) {

  const { params } = await Promise.resolve(props);
  const path = "/" + (params.page?.join("/") ?? "");

  const menu = await getMenuByPath(path);

  const Component = dynamic(() => import(`@/app/pages/${menu}`), {
    ssr: true,
  });

  return <Component />
}