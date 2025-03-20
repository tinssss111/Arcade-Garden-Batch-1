// import { Groq } from "groq-sdk";

// interface TweetParams {
//     playerAddress?: string;
//     score: number;
//     bossDefeated: boolean;
// }

// class AIAgentService {
//     private groqClient: Groq;

//     constructor() {
//         // Khởi tạo Groq client
//         this.groqClient = new Groq({
//             apiKey: process.env.GROQ_API_KEY || '',
//         });
//     }

//     async generateTweet(params: TweetParams): Promise<string> {
//         try {
//             // Gọi API endpoint của bạn
//             const response = await fetch('/api/generate-tweet', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(params),
//             });

//             if (!response.ok) {
//                 throw new Error(`API error: ${response.status}`);
//             }

//             const data = await response.json();
//             return data.tweet;
//         } catch (error) {
//             console.error('Error generating tweet:', error);
//             return this.getMockTweet(params);
//         }
//     }

//     async postToTwitter(content: string): Promise<boolean> {
//         try {
//             console.log('Posting to Twitter:', content);

//             // Gọi API endpoint để đăng tweet
//             const response = await fetch('/api/post-tweet', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ content }),
//             });

//             if (!response.ok) {
//                 throw new Error(`API error: ${response.status}`);
//             }

//             const data = await response.json();
//             console.log('Twitter API response:', data);

//             return data.success;
//         } catch (error) {
//             console.error('Error posting to Twitter:', error);
//             // Giả lập đăng tweet thành công trong môi trường phát triển
//             return false;
//         }
//     }

//     private getMockTweet(params: TweetParams): string {
//         if (params.bossDefeated) {
//             const mockTweets = [
//                 `Không thể tin được! Tôi, Boss vĩ đại, vừa bị đánh bại bởi ${params.playerAddress || 'Unknown'} với ${params.score} điểm. Chúc mừng, nhưng lần sau tôi sẽ không dễ dàng vậy đâu! #GameOver #BossDefeated`,
//                 `Hôm nay là ngày đen tối của tôi! ${params.playerAddress || 'Unknown'} đã đánh bại tôi với ${params.score} điểm. Tôi sẽ trở lại mạnh mẽ hơn! #Respect #WillBeBack`,
//                 `Wow! ${params.playerAddress || 'Unknown'} thật là một đối thủ đáng gờm! Đánh bại tôi với ${params.score} điểm. Tôi cần tập luyện thêm rồi! #ImPressed #GoodGame`
//             ];
//             return mockTweets[Math.floor(Math.random() * mockTweets.length)];
//         } else {
//             const mockTweets = [
//                 `Haha! ${params.playerAddress || 'Unknown'} vừa thử thách tôi và thất bại thảm hại với chỉ ${params.score} điểm. Quay lại khi bạn đã sẵn sàng nhé! #TooEasy #BossFTW`,
//                 `Một ngày tồi tệ cho ${params.playerAddress || 'Unknown'}! Chỉ đạt ${params.score} điểm? Tôi thậm chí còn chưa dùng hết sức đấy! #GetGood #TryAgain`,
//                 `${params.playerAddress || 'Unknown'} vừa bị tôi nghiền nát với chỉ ${params.score} điểm. Có lẽ bạn nên chơi game khác? Hoặc... thử lại và chứng minh tôi sai? #Challenge #ComeBackStronger`
//             ];
//             return mockTweets[Math.floor(Math.random() * mockTweets.length)];
//         }
//     }
// }

// // eslint-disable-next-line import/no-anonymous-default-export
// export default new AIAgentService();