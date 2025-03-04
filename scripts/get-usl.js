// run this in the console on page 
// https://en.wikipedia.org/wiki/USL_Championship


var getLocation = function (title) {
  // await fetch(url);
  var url = new URL('https://en.wikipedia.org/w/api.php');
  
  return new Promise(async (resolve, reject) => {
    const params = {
      'action': 'query',
      'prop': 'coordinates',
      'titles': title,
      'format': 'json',
      'origin': '*'
    };
    // https://github.com/github/fetch/issues/256#issuecomment-379196019
    Object.keys(params).forEach((key) => {
      url.searchParams.append(key, params[key])
    });

    const results = await fetch(url);
    const jsonResults = await results.json();

    const key = Object.keys(jsonResults.query.pages)[0];
    const resObject = jsonResults.query.pages[key];
    if(resObject.hasOwnProperty('coordinates')) {
      resolve(resObject.coordinates[0]);
    } else {
      console.log('issue!', key);
      resolve(false);
    }
    
  });
};


const results = $('.wikitable').eq(1).find('tr').get().map(async function(tr) {
  console.log('tr:', tr);
  if($(tr).find('td').eq(0).find('a').text()) {

    var stadiumLink = $(tr).find('td').eq(2).find('a').eq(0).attr('href');
    var location = await getLocation(decodeURIComponent(stadiumLink.replace('/wiki/', '')))

    if(location) {
      
      // length: $(tr).find('td').length
      console.log('FIND', $(tr).find('td').eq(1).find('a').eq(0).text().split(','));
      let retArr =  [
        $(tr).find('td').eq(0).find('a').eq(0).text(), // team name
        $(tr).find('td').eq(1).find('a').eq(0).text().split(',')[0].trim(), // city
        $(tr).find('td').eq(1).find('a').eq(0).text().split(',')[1].trim(), // state
        location.lat, // latitude
        location.lon, // longitude
        $(tr).find('td').eq(2).find('a').eq(0).text(), // stadium
        $(tr).find('td').eq(3).text().replace(',','').trim() // stadium_capacity,
        
      ];

      if($(tr).find('td').length === 8) {
        retArr.push($(tr).find('td').eq(4).text().trim()); // founded
        retArr.push($(tr).find('td').eq(5).text().trim()); // joined
        retArr.push($(tr).find('td').eq(6).find('a').eq(1).text().trim()); // head_coach
        retArr.push($(tr).find('td').eq(7).text().trim()); // mls_affiliate
      } else {
        // assume the "founded" and "joined" are merged cells
        retArr.push($(tr).find('td').eq(4).text().trim()); // founded
        retArr.push($(tr).find('td').eq(4).text().trim()); // joined
        retArr.push($(tr).find('td').eq(5).find('a').eq(1).text().trim()); // head_coach
        retArr.push($(tr).find('td').eq(6).text().trim()); // mls_affiliate
      }
      return retArr;
    } else {

      return [];
    }
  } else {
    // title or something
    console.log('HERE');
    return [];
  }
});
const r = await Promise.all(results);

let retString = 'team,city,state,latitude,longitude,stadium,stadium_capacity,year_founded,year_joined,head_coach,mls_affiliate';
r.forEach((arr) => {
  if(arr.length > 0) {
    retString = `${retString}\n${arr.join(',')}`;
  } 
});
console.log(retString);