interface TenorRandomGifRequest {
    q: string;
    locale?: string;
    contentfilter?: string;
    media_filter?: string;
    ar_range?: string;
    limit?: number;
    pos?: string;
    anon_id?: string;
}

interface TenorRandomGifResponse {
    next: string;
    results: TenorGif[];
}

interface TenorGif {
    created: number;
    hasaudio: boolean;
    id: string;
    media: TenorMedia;
    tags: string[];
    title: string;
    itemurl: string;
    hascaption: boolean;
    url: string;
}

interface TenorMedia {
    [gif: string]: TenorMediaObject;
}

interface TenorMediaObject {
    preview: string;
    url: string;
    dims: number[];
    size: number;
}