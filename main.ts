import { load } from "cheerio";
import fetch from "node-fetch";
import * as fs from 'fs';

const TargetUrl = "https://crowdfunding.comicola.com/campaign/hoat-hinh-con-tho/";
const OutputPath = 'TBM/input.csv';

async function main() {
  const htmlContent = await fetch(TargetUrl).then(e => e.text());
  const $ = load(htmlContent);
  const table = $('.table > tbody > tr').toArray()
    .slice(1)
    .map(elem => $(elem).find("td").toArray())
    .map(row => row.map(elem => $(elem).text()))
    .map(row => [row[0], row[1], resolveDate(row[2])])
    .map(row => row.map(cell => cell.replace(/,/g, '').replace(/₫/g, '').trim()).map(cell => `"${cell}"`).join());
  table.splice(0, 0, 'Tên,Quyên góp,Date');
  fs.writeFileSync(OutputPath, table.join('\n'), { encoding: 'utf8' })
}
main().catch((e: Error) => console.error(e.stack));

function resolveDate(str: string) {
  const match = /(.+?) (\d{2}), (\d{4})/.exec(str);
  const months = {
    'Tháng Một': 1,
    'Tháng Hai': 2,
    'Tháng Ba': 3,
    'Tháng Tư': 4,
    'Tháng Năm': 5,
    'Tháng Sáu': 6,
    'Tháng Bảy': 7,
    'Tháng Tám': 8,
    'Tháng Chín': 9,
    'Tháng Mười': 10,
    'Tháng Mười Một': 11,
    'Tháng Mười Hai': 12,
  };
  const month = months[match[1]];
  if (month == null)
    throw Error('Invalid month: ' + match[1]);
  return `${match[2]}/${month}/${match[3]}`;
}