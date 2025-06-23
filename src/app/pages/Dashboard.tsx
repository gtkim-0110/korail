import path from 'path';
import { promises as fs } from 'fs';
import DashboardMap from "@/features/dashboard/components/DashboardMap";
import SubwayMap from "@/features/dashboard/components/DashboardSecondMap";
import SeoulSubwayMap from "@/features/dashboard/components/DashboardSecondMap";
import { parse } from 'svgson';
import SubwayMap2 from "@/app/pages/SubwayMap2";

export default async function Dashboard () {

  // const res = await fetch(`https://api.odcloud.kr/api/15099316/v1/uddi:e3362505-a95b-4480-8deb-b3e0671bc320?page=1&perPage=1000&serviceKey=1vYrONN2lI%2FZukl4QfOAHVFrazQXOpKhUIYr9OlcQcrrzQvODvQ4jN6eLcf3aYlkN2Leyj%2BI8Xt2siGopwcvSQ%3D%3D`);
  // const data = await res.json();

  // const filePath = path.join(process.cwd(), 'public', 'seoul_subway_stations_label.json');
  // const fileData = await fs.readFile(filePath, 'utf-8');
  // const stations = JSON.parse(fileData);


  const filePath = path.join(process.cwd(), 'public', 'two.json');
  const fileData = await fs.readFile(filePath, 'utf-8');
  const stations = JSON.parse(fileData);


  const svgFile = path.join(process.cwd(), 'public', 'a.svg');
  const svData = await fs.readFile(svgFile, 'utf-8');
  const result = parse(svData).then(res=> {
    console.log(res)
  })

  console.log(result);

  return (
    <div style={{width:'100%',height:'100%',position:'relative'}}>
      {/*<DashboardMap data={stations}/>*/}
      {/*<SeoulSubwayMap />*/}

      <SubwayMap2 />
    </div>
  )
}