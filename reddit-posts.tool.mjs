export default async function fetchRedditPosts({ subreddit, where }) {
    const url = `https://www.reddit.com/r/${subreddit}/${where}.json`;
    
    const response = await fetch(url, {
        headers: {
            "User-Agent": "tune/0.0.2"
        }
    });
    
    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data.children.map(item => `##${item.data.title}\n${item.data.selftext}\n${item.data.url}`).join("\n\n");
}
