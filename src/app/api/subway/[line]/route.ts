import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { line: string } }) {
  const { line } = params;

  // Overpass QL 쿼리: 서울 지역에서 해당 호선 이름을 가진 subway relation 가져오기
  const query = `
    [out:json][timeout:25];
    area["name"="Seoul"]->.searchArea;
    (
      relation["railway"="subway"]["name"~"${line}"](area.searchArea);
    );
    out body;
    >;
    out skel qt;
  `;

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Overpass API fetch failed' }, { status: 500 });
    }

    const osmJson = await res.json();

    // 서버에서 osmtogeojson 사용
    const osmtogeojson = (await import('osmtogeojson')).default;
    const geojson = osmtogeojson(osmJson);

    return NextResponse.json(geojson);
  } catch (error) {
    console.error('GeoJSON API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
