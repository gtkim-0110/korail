
export default async function Temp () {

  const res = await fetch(`http://localhost:3000/api/subway/${encodeURIComponent('1호선')}/route`);

  console.log(await res.json());

  return (
    <>
      Temp 화면
    </>
  )
}