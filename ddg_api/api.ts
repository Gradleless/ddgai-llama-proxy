const URL = 'https://duckduckgo.com/duckchat/v1/';

interface Message {
    content: string;
    role: string;
}

async function getVqd() {
    const options = {
        'method': 'GET',
        'headers': {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br, zstd',
          'Referer': 'https://duckduckgo.com/',
          'Cache-Control': 'no-store',
          'x-vqd-accept': '1',
          'Connection': 'keep-alive',
          'Cookie': 'dcm=1',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'Priority': 'u=0',
          'TE': 'trailers'
        },
      };

    const response = await fetch(URL + "status", options);
    
    if (response.ok) {
        const json = await response.json();
        if(json.status === "0") return response.headers.get('x-vqd-4'); 
    } else {
        throw new Error('Failed to get VQD');
    }
}

async function sendChat(messages: Message[], model?: string, vqd?: string) {
    const options = {
        'method': 'POST',
        'headers': {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
          'Accept': 'text/event-stream',
          'Referer': 'https://duckduckgo.com/',
          'Content-Type': 'application/json',
          'x-vqd-4': vqd ? vqd : (await getVqd()) || '',
          'Origin': 'https://duckduckgo.com',
          'Cookie': 'dcm=1',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'Priority': 'u=4',
          'TE': 'trailers'
        },
      };

    const response = fetch(URL + "chat", {
        ...options,
        body: JSON.stringify({ messages, model })
    });

    return response;
}

export { sendChat, getVqd };