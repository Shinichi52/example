import axios from 'axios';

export function getIdFromUrl(link1) {
  const link = link1 || '';
  const isURL = (str) => {
    const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return pattern.test(str) && str.startsWith('https://');
  };
  if (!link || !isURL(link)) return [];
  try {
    return (link || '').match(/[-\w]{25,}/)[0];
  } catch (e) {
    return '';
  }
}

export async function getByUrl(link) {
  const id = getIdFromUrl(link);
  return id ? await getById(id) : [];
}

export async function getById(id) {
  if (!id) return [];
  try {
    const body = (await axios({
      url: `https://docs.google.com/spreadsheets/d/${id}/export?format=tsv&id=${id}&gid=0`,
      timeout: 5000
    })).data;
    const json = [];
    const rows = body.split(/\r\n/i);
    for (let i = 0; i < rows.length; i += 1) {
      json.push(rows[i].split(/\t/i));
    }
    return json;
  } catch (e) {
    return [];
  }
}
export async function getRates(link) {
  const rs = {
    stt: 'error',
    msg: `Error get rates from ${link}`
  };
  const data = await getByUrl(link);
  if (data.length > 1) {
    data.splice(0, 1);
    rs.data = data.map((v) => {
      console.log('');
      return {
        bid: parseFloat(v[0].trim()),
        ask: parseFloat(v[1].trim())
      };
    });
    rs.stt = 'success';
    delete rs.msg;
  }
  return rs;
}
