import { readerFromStreamReader } from "https://deno.land/std@0.93.0/io/mod.ts";
import {existsSync} from "https://deno.land/std/fs/mod.ts";
import * as mod from "https://deno.land/std@0.165.0/streams/conversion.ts";

import { exportedTweets } from './tweets.js';

export enum MediaType {
    PHOTO = 'photo',
    VIDEO = 'video',
    GIF = 'animated_gif',
}


function getMedia(tweetEntity): string {
    if (typeof tweetEntity === 'undefined') {
        return "";
    } else {
        return tweetEntity.media.map((media) => {
            if (media.type === MediaType.PHOTO) {
                return parseImage(media);
            } else if (media.type === MediaType.VIDEO || media.type === MediaType.GIF) {
                return parseVideo(media);
            }
        });
    }
}

function parseImage(media): string {
    const imageURL = media.media_url_https;
    return `${imageURL}:large`;
}

function parseVideo(media): string {
    const variants = media.video_info.variants;
    const video = variants.reduce((prev, curr) => {
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

    let tweetTexts: string[] = [];
    
    tweets.map((tweet) => {
        const mediaURL: string = getMedia(tweet.tweet.extended_entities);
        
        if (mediaURL !== null || typeof mediaURL !== 'undefined') {
            if (mediaURL !== "") {
                tweetTexts.push(mediaURL.toString());
            }
        }
    });

    return tweetTexts;
}

// download media from tweet array 

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
        const cleanFileName = fileName.replace(/[:?].*$/, '');

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

const tweetMediaToDownload = readTweets();
await downloadMedia(tweetMediaToDownload);
