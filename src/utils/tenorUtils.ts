import https from 'https';

export const getRandomGifs = async (request: TenorRandomGifRequest): Promise<TenorRandomGifResponse> => {
    const params = getParams(request);

    const httpsOptions: https.RequestOptions = {
        host: 'g.tenor.com',
        path: `/v1/random?key=${process.env.TENOR_KEY}${params}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    }

    return new Promise<TenorRandomGifResponse>((resolve, reject) => {
        https.get(httpsOptions, (res) => {
            try {
                let chunks:string[] = [];
        
                res.on('data', (chunk) => {
                    chunks.push(chunk)
                });
                
                res.on('end', () => {
                    const responseString = chunks.join('');
                    const responseObject: TenorRandomGifResponse = JSON.parse(responseString);

                    resolve(responseObject);
                });

                res.on('error', (error) => {
                    reject(error);
                });
            } catch (err) {
                reject(err);
            }
        });
    });    
}

const getParams = (request: TenorRandomGifRequest): string => {
    let params = "";

    for (let prop in request) {
        const value = (<any>request)[prop];
        if (value) {
            params += `&${prop}=${value}`;
        }
    }

    return params;
}