import { readerFromStreamReader } from "https://deno.land/std@0.93.0/io/mod.ts";
import {existsSync} from "https://deno.land/std/fs/mod.ts";
import * as mod from "https://deno.land/std@0.165.0/streams/conversion.ts";

let exportedTweets: any;

export enum MediaType {
    PHOTO = 'photo',
    VIDEO = 'video',
    GIF = 'animated_gif',
}


function getMedia(tweetEntity: any): string {
    if (typeof tweetEntity === 'undefined') {
        return "";
    } else {
        return tweetEntity.media.map((media: any) => {
            if (media.type === MediaType.PHOTO) {
                return parseImage(media);
            } else if (media.type === MediaType.VIDEO || media.type === MediaType.GIF) {
                return parseVideo(media);
            }
        });
    }
}

function parseImage(media: any): string {
    const imageURL = media.media_url_https;
    return `${imageURL}:large`;
}

function parseVideo(media: any): string {
    const variants = media.video_info.variants;
    const video = variants.reduce((prev: any, curr: any) => {
        const prevBitrate = parseInt(prev.bitrate);
        const currBitrate = parseInt(curr.bitrate);
        
        if (curr.content_type === 'video/mp4') {
            if (curr.content_type === 'video/mp4' && prevBitrate > currBitrate) {
                return prev;
            } else {
                return curr;
            }
        } else {
            return prev;
        }
    });
    return video.url;
}

export function readTweets(): string[] {
    const tweets = exportedTweets;

    const tweetTexts: string[] = [];
    
    tweets.map((tweet: any) => {
        const mediaURL: string = getMedia(tweet.tweet.extended_entities);
        
        if (mediaURL !== null || typeof mediaURL !== 'undefined') {
            if (mediaURL !== "") {
                tweetTexts.push(mediaURL.toString());
            }
        }
    });

    return tweetTexts;
}

async function downloadMedia(tweets: string[]): Promise<void> {
    const outputExists = existsSync('./output');

    if (!outputExists) {
        console.log('Creating output directory');
        Deno.mkdirSync('./output');
    }

    for (let i = 0; i < tweets.length; i++) {
        const tweet = tweets[i];
        console.log(`Downloading ${tweet}`);
        const url = tweet;
        const fileName = url.split('/').pop();
        let cleanFileName: string;
        if (typeof fileName !== 'undefined') {
            cleanFileName = fileName.replace(/[:?].*$/, '');
        } else {
            cleanFileName = 'undefined';
        }
        const res = await fetch(url);
        const file = await Deno.open(`./output/${cleanFileName}`, { create: true, write: true })

        if (res?.body) {
            const reader = readerFromStreamReader(res.body.getReader());
            await mod.copy(reader, file);
         }
         file.close();

        console.log(`Written to ./output/${cleanFileName}`);
    }
}

async function loadJSFile(path: string): Promise<void> {
    const file = await Deno.readFile(path);
    const textFile =  new TextDecoder().decode(file);

    const textForEval = textFile.replace('window.YTD.tweets.part0', 'exportedTweets');

    await eval(textForEval);
}

await loadJSFile(Deno.args[0]);
const tweetMediaToDownload = readTweets();
await downloadMedia(tweetMediaToDownload);
