export async function getMenus () {
  const res = await fetch(`${process.env.API_BASE_URL}/menus`, {
    cache: 'no-store',
    // headers: {
    //   'Authorization': 'Bearer ' + process.env.API_TOKEN,
    // },
  })

  if (!res.ok) return null;
  return res.json();
}