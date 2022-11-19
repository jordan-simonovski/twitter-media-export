# Twitter Media Export Downloader

I'm just playing around with Deno to build something I wanted. 

This is a little utility script for downloading high resolution media from twitter archives.

## Usage

Prior to executing the script, you'll need to download your twitter archive. You can do this by going to [twitter.com/settings/your_twitter_data](https://twitter.com/settings/your_twitter_data) and clicking the "Request your archive" button. It may take a few days at the moment.

Once it's available, download the archive and extract it. You should have a folder called `data` with a bunch of JS files in it.

Now you're ready to run the download.

I haven't gotten around to packaging this just yet. So for now, you'll need to clone the repo and run it with Deno.

```bash
deno run --allow-read --allow-net --allow-write main.ts <path-to-tweets.js>
```

## Downloading

**Note: Only pre-release downloads are available at the moment**

Mac OS X
```bash
# ARM (Apple Silicon)
curl -L https://github.com/jordan-simonovski/twitter-media-export/releases/download/latest/amd-darwin-twitter-media-download-macos-arm  > twitter-media-download | chmod +x twitter-media-download

# Intel
curl -L https://github.com/jordan-simonovski/twitter-media-export/releases/download/latest/x64-darwin-twitter-media-download-macos-arm > twitter-media-download | chmod +x twitter-media-download
```