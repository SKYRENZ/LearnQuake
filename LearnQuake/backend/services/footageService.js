import axios from 'axios';

const YT_API_KEY = process.env.YOUTUBE_API_KEY;
const YT_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

const RAW_KEYWORDS = [
  'raw footage',
  'caught on camera',
  'live footage',
  'CCTV',
  'camera',
  'recorded',
  'dashboard camera',
  'home camera',
  'security camera',
  'livestream'
];

const EXCLUDE_KEYWORDS = [
  'news',
  'interview',
  'reaction',
  'music',
  'song',
  'dance',
  'fan cam',
  'updates',
  'headline'
];

function isRawFootageVideo(snippet) {
  const text = `${snippet.title} ${snippet.description}`.toLowerCase();

  const hasRawKeyword = RAW_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()));
  const hasExcludeKeyword = EXCLUDE_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()));

  return hasRawKeyword && !hasExcludeKeyword;
}

class FootageService {
  async fetchEarthquakeVideos(region = 'PH', maxResults = 12) {
    const { data } = await axios.get(YT_SEARCH_URL, {
      params: {
        key: YT_API_KEY,
        part: 'snippet',
        type: 'video',
        maxResults,
        order: 'date',
        regionCode: region,
        q: [
          '"earthquake"',
          'Philippines',
          '"raw footage"',
          '"caught on camera"',
          '-news',
          '-interview',
          '-update'
        ].join(' ')
      },
    });

    return data.items
      .filter(item => isRawFootageVideo(item.snippet))
      .map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        channel: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails.high?.url ?? item.snippet.thumbnails.default.url,
      }));
  }
}

export default new FootageService();