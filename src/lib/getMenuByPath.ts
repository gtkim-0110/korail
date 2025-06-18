export async function getMenuByPath (path: string) {
  // const res = await fetch(`http://localhost:8080/api/${path}`, {
  //   cache: 'no-store',
  //   headers: {
  //     'Authorization': 'Bearer ' + process.env.API_TOKEN,
  //   },
  // })
  //
  // if (!res.ok) return null;

  // return res.json(); // menu 객체

  /**
   * 실패 했을떄 default 페이지 넘겨 줘야할듯.
   */

  return 'Main'
}