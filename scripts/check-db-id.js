const url = process.env.POSTGRES_URL || "";
console.log("Local DB ID:", url.slice(-4));
