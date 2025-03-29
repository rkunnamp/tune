export default async function weather({ location }, ctx) {
    // lets use openweathermap.org api 
    const api_key = await ctx.read("OPENWEATHER_KEY");
    let result = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${api_key}`);
    if (! result.ok) {
        return await result.json();
    }
    result = await result.json();
    const {lat, lon} = result[0];
  
    result = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`)
    return await result.json()
}
